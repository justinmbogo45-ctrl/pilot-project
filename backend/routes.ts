import { Router, type RequestHandler } from 'express';
import { randomUUID, createHash } from 'node:crypto';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth, type DecodedIdToken } from 'firebase-admin/auth';
import firebaseConfig from '../firebase-applet-config.json';
import { pool, transaction } from './db';

class HttpError extends Error { constructor(public status: number, message: string) { super(message); } }
const text = (v: unknown, max = 500, optional = false) => {
  if (optional && v == null) return '';
  if (typeof v !== 'string' || v.length > max || (!optional && !v.trim())) throw new HttpError(400, 'Invalid text field');
  return v.trim();
};
const choice = (v: unknown, values: string[]) => { if (!values.includes(v as string)) throw new HttpError(400, 'Invalid option'); return v; };
const amount = (v: unknown, nullable = false): number | null => {
  if (nullable && v == null) return null;
  if (typeof v !== 'number' || !Number.isFinite(v) || v < 0 || v > 1e9) throw new HttpError(400, 'Invalid amount');
  return v;
};
const bool = (v: unknown) => { if (typeof v !== 'boolean') throw new HttpError(400, 'Invalid boolean'); return v; };
const uuid = (v: unknown) => { const s = text(v, 36); if (!/^[0-9a-f-]{36}$/i.test(s)) throw new HttpError(400, 'Invalid record ID'); return s; };
const wrap = (fn: RequestHandler): RequestHandler => (req, res, next) => { Promise.resolve(fn(req, res, next)).catch(next); };
const paymentMethods = ['Crypto (USDT)','Rise','Wise','Direct Bank Transfer','Deel','PayPal'];

export type VerifyToken = (token: string) => Promise<DecodedIdToken>;
const verifyToken: VerifyToken = token => {
  const app = getApps().find(a => a.name === 'postgres-auth') ?? initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID || firebaseConfig.projectId }, 'postgres-auth');
  return getAuth(app).verifyIdToken(token);
};

async function userProfile(id: string) {
  const result = await pool.query(`SELECT id AS uid,display_name AS "displayName",email,photo_url AS "photoURL",loyalty_points AS "loyaltyPoints",created_at AS "createdAt",last_login_at AS "lastLoginAt",to_char(last_daily_claim_date,'YYYY-MM-DD') AS "lastDailyClaimDate",
    ARRAY(SELECT firm_id FROM favorites WHERE user_id=u.id ORDER BY firm_id) AS "favoriteFirmIds",
    ARRAY(SELECT giveaway_id FROM giveaway_entries WHERE user_id=u.id) AS "claimedGiveaways" FROM users u WHERE id=$1`, [id]);
  if (!result.rowCount) throw new HttpError(404, 'Create your profile first');
  return result.rows[0];
}
async function affiliateProfile(id: string) {
  const r = await pool.query(`SELECT a.*,u.email,u.display_name FROM affiliates a JOIN users u ON u.id=a.user_id WHERE a.user_id=$1`,[id]);
  if (!r.rowCount) throw new HttpError(404,'Affiliate profile not found');
  const p = r.rows[0];
  return {userId:id,userEmail:p.email,displayName:p.display_name,referralCode:p.referral_code,customSlug:p.custom_slug,tier:p.tier,commissionRate:Number(p.commission_rate),totalClicks:p.total_clicks,totalSignups:p.total_signups,totalConversions:p.total_conversions,conversionRate:p.total_clicks ? p.total_conversions / p.total_clicks * 100 : 0,availableEarnings:Number(p.available_earnings),pendingEarnings:Number(p.pending_earnings),lifetimeEarnings:Number(p.lifetime_earnings),payoutMethod:p.payout_method,payoutAddress:p.payout_address,createdAt:p.created_at,updatedAt:p.updated_at};
}
async function alerts(id: string) {
  const r = await pool.query(`SELECT a.id,a.user_id AS "userId",u.email AS "userEmail",f.id AS "firmId",f.name AS "firmName",f.logo_url AS "firmLogo",c.id AS "planId",COALESCE(c.name,c.raw_data->>'account_size','Account') AS "planName",c.account_size::float8 AS "planSize",c.price::float8 AS "currentPrice",c.currency,a.target_price::float8 AS "targetPrice",a.alert_type AS "alertType",a.channel,a.notify_on_discount AS "notifyOnDiscount",a.active,a.created_at AS "createdAt",a.last_notified_at AS "lastNotifiedAt" FROM price_alerts a JOIN users u ON u.id=a.user_id JOIN challenges c ON c.id=a.challenge_id JOIN firms f ON f.id=c.firm_id WHERE a.user_id=$1 ORDER BY a.created_at DESC`,[id]);
  return r.rows;
}

export function createDataRouter(verify: VerifyToken = verifyToken) {
  const router = Router();
  router.get('/health', wrap(async (_req,res) => { await pool.query('SELECT 1'); res.json({status:'ok',database:'postgresql'}); }));
  router.get('/catalog', wrap(async (_req,res) => {
    const result = await pool.query(`SELECT f.raw_data || jsonb_build_object('slug',f.id,'synced_at',f.synced_at,'source_url',f.source_url,
      'challenges',COALESCE((SELECT jsonb_agg(c.raw_data ORDER BY c.provider_id) FROM challenges c WHERE c.firm_id=f.id AND c.active),'[]'::jsonb),
      'rules',jsonb_build_object('trading_rules',r.trading_rules,'payout_rules',r.payout_rules),
      'offers',COALESCE((SELECT jsonb_agg(o.raw_data ORDER BY o.discount_percent DESC NULLS LAST) FROM offers o WHERE o.firm_id=f.id AND o.active AND (o.expires_at IS NULL OR o.expires_at > now())),'[]'::jsonb)) AS firm
      FROM firms f LEFT JOIN firm_rules r ON r.firm_id=f.id WHERE f.active ORDER BY f.score DESC NULLS LAST,f.name`);
    const last = await pool.query(`SELECT finished_at FROM catalog_sync_runs WHERE status='succeeded' ORDER BY finished_at DESC LIMIT 1`);
    res.json({data:result.rows.map(r=>r.firm),meta:{source:'PropFirmMap',sourceUrl:'https://propfirmmap.com',lastSyncedAt:last.rows[0]?.finished_at ?? null}});
  }));
  router.get('/firms/:id/reviews',wrap(async (req,res) => {
    const r=await pool.query(`SELECT r.id,u.display_name AS author,u.photo_url AS avatar,r.rating,r.title,r.comment,r.created_at AS date,r.details FROM reviews r JOIN users u ON u.id=r.user_id WHERE firm_id=$1 ORDER BY r.created_at DESC LIMIT 100`,[text(req.params.id,150)]);
    res.json(r.rows.map(({details,...row})=>({...details,...row})));
  }));
  router.use('/me', wrap(async (req,res,next) => {
    res.setHeader('Cache-Control','no-store');
    const header=req.headers.authorization;
    if (!header?.startsWith('Bearer ')) throw new HttpError(401,'Sign in to continue');
    try { res.locals.user=await verify(header.slice(7)); } catch { throw new HttpError(401,'Your sign-in has expired'); }
    next();
  }));
  router.post('/me/profile',wrap(async (_req,res) => {
    const u=res.locals.user as DecodedIdToken;
    await pool.query(`INSERT INTO users(id,display_name,email,photo_url) VALUES($1,$2,$3,$4) ON CONFLICT(id) DO UPDATE SET display_name=EXCLUDED.display_name,email=EXCLUDED.email,photo_url=EXCLUDED.photo_url,last_login_at=now()`,[u.uid,u.name || 'Trader',u.email || '',u.picture || '']);
    res.json(await userProfile(u.uid));
  }));
  router.get('/me/profile',wrap(async (_req,res)=>{res.json(await userProfile(res.locals.user.uid));}));
  router.put('/me/favorites',wrap(async (req,res)=>{
    const ids=req.body.favoriteFirmIds;
    if (!Array.isArray(ids) || ids.length>3 || new Set(ids).size!==ids.length) throw new HttpError(400,'Choose up to three different firms');
    ids.forEach(v=>text(v,150));
    await transaction(async c=>{
      await c.query('SELECT id FROM users WHERE id=$1 FOR UPDATE',[res.locals.user.uid]);
      const found=await c.query('SELECT id FROM firms WHERE id=ANY($1::text[]) AND active',[ids]);
      if (found.rowCount!==ids.length) throw new HttpError(400,'Unknown firm');
      await c.query('DELETE FROM favorites WHERE user_id=$1',[res.locals.user.uid]);
      for (const id of ids) await c.query('INSERT INTO favorites(user_id,firm_id) VALUES($1,$2)',[res.locals.user.uid,id]);
    });
    res.json({success:true});
  }));
  router.post('/me/reviews',wrap(async(req,res)=>{
    const b=req.body,id=randomUUID(),uid=res.locals.user.uid;
    const rating=amount(b.rating); if (rating==null || !Number.isInteger(rating) || rating<1 || rating>5) throw new HttpError(400,'Rating must be 1–5');
    const details={payoutReceived:bool(b.payoutReceived),accountType:text(b.accountType,150,true),payoutAmount:amount(b.payoutAmount,true),country:text(b.country,100,true),pros:[],cons:[]};
    await transaction(async c=>{
      await c.query(`INSERT INTO reviews(id,user_id,firm_id,rating,title,comment,details) VALUES($1,$2,$3,$4,$5,$6,$7)`,[id,uid,text(b.firmId,150),rating,text(b.title,200),text(b.comment,5000),details]);
      await c.query('UPDATE users SET loyalty_points=loyalty_points+50 WHERE id=$1',[uid]);
    });
    res.status(201).json({id});
  }));
  router.post('/me/giveaways',wrap(async(req,res)=>{
    const uid=res.locals.user.uid,giveaway=text(req.body.giveawayId,150);
    await transaction(async c=>{
      const r=await c.query('INSERT INTO giveaway_entries(id,user_id,giveaway_id) VALUES($1,$2,$3) ON CONFLICT(user_id,giveaway_id) DO NOTHING',[randomUUID(),uid,giveaway]);
      if (r.rowCount) await c.query('UPDATE users SET loyalty_points=loyalty_points+25 WHERE id=$1',[uid]);
    });res.json({success:true});
  }));
  router.post('/me/daily-bonus',wrap(async(_req,res)=>{
    const r=await pool.query(`UPDATE users SET loyalty_points=loyalty_points+10,last_daily_claim_date=(now() AT TIME ZONE 'UTC')::date WHERE id=$1 AND last_daily_claim_date IS DISTINCT FROM (now() AT TIME ZONE 'UTC')::date RETURNING loyalty_points`,[res.locals.user.uid]);
    res.json({success:!!r.rowCount,pointsAdded:r.rowCount?10:0,newTotal:r.rows[0]?.loyalty_points ?? (await userProfile(res.locals.user.uid)).loyaltyPoints});
  }));
  router.get('/me/price-alerts',wrap(async(_req,res)=>{res.json(await alerts(res.locals.user.uid));}));
  router.post('/me/price-alerts',wrap(async(req,res)=>{
    const b=req.body,id=randomUUID(),uid=res.locals.user.uid;
    await transaction(async c=>{
      const found=await c.query('SELECT 1 FROM challenges c JOIN firms f ON f.id=c.firm_id WHERE c.id=$1 AND c.active AND f.active',[text(b.planId,200)]);
      if (!found.rowCount) throw new HttpError(400,'Unknown account plan');
      await c.query(`INSERT INTO price_alerts(id,user_id,challenge_id,target_price,alert_type,channel,notify_on_discount) VALUES($1,$2,$3,$4,$5,$6,$7)`,[id,uid,b.planId,amount(b.targetPrice,true),choice(b.alertType,['any_change','price_drop','discount_increase']),choice(b.channel,['email','in_app','both']),bool(b.notifyOnDiscount)]);
      await c.query('UPDATE users SET loyalty_points=loyalty_points+25 WHERE id=$1',[uid]);
    });res.status(201).json({id});
  }));
  router.patch('/me/price-alerts/:id',wrap(async(req,res)=>{
    const b=req.body;
    const r=await pool.query(`UPDATE price_alerts SET active=COALESCE($3,active),target_price=CASE WHEN $4 THEN $5 ELSE target_price END,channel=COALESCE($6,channel),alert_type=COALESCE($7,alert_type),notify_on_discount=COALESCE($8,notify_on_discount) WHERE id=$1 AND user_id=$2`,[uuid(req.params.id),res.locals.user.uid,b.active===undefined?null:bool(b.active),'targetPrice' in b,amount(b.targetPrice,true),b.channel===undefined?null:choice(b.channel,['email','in_app','both']),b.alertType===undefined?null:choice(b.alertType,['any_change','price_drop','discount_increase']),b.notifyOnDiscount===undefined?null:bool(b.notifyOnDiscount)]);
    if(!r.rowCount) throw new HttpError(404,'Alert not found'); res.json({success:true});
  }));
  router.delete('/me/price-alerts/:id',wrap(async(req,res)=>{
    const r=await pool.query('DELETE FROM price_alerts WHERE id=$1 AND user_id=$2',[uuid(req.params.id),res.locals.user.uid]);
    if(!r.rowCount) throw new HttpError(404,'Alert not found'); res.json({success:true});
  }));
  router.post('/me/affiliate',wrap(async(_req,res)=>{
    const uid=res.locals.user.uid,key=createHash('sha256').update(uid).digest('hex').slice(0,20);
    await pool.query('INSERT INTO affiliates(user_id,referral_code,custom_slug) VALUES($1,$2,$3) ON CONFLICT(user_id) DO NOTHING',[uid,`MATCH-${key.toUpperCase()}`,`trader_${key}`]);
    res.json(await affiliateProfile(uid));
  }));
  router.get('/me/affiliate',wrap(async(_req,res)=>{res.json(await affiliateProfile(res.locals.user.uid));}));
  router.patch('/me/affiliate',wrap(async(req,res)=>{
    const b=req.body;
    if(Object.keys(b).some(k=>!['customSlug','payoutMethod','payoutAddress'].includes(k))) throw new HttpError(400,'Earnings and referral metrics are managed by the server');
    const slug=b.customSlug===undefined?null:text(b.customSlug,80);
    if(slug && !/^[a-z0-9_]+$/.test(slug)) throw new HttpError(400,'Invalid referral slug');
    const r=await pool.query(`UPDATE affiliates SET custom_slug=COALESCE($2,custom_slug),payout_method=COALESCE($3,payout_method),payout_address=COALESCE($4,payout_address),updated_at=now() WHERE user_id=$1`,[res.locals.user.uid,slug,b.payoutMethod===undefined?null:choice(b.payoutMethod,paymentMethods),b.payoutAddress===undefined?null:text(b.payoutAddress,500)]);
    if(!r.rowCount) throw new HttpError(404,'Affiliate profile not found');res.json(await affiliateProfile(res.locals.user.uid));
  }));
  router.get('/me/affiliate/activities',wrap(async(_req,res)=>{
    const r=await pool.query(`SELECT id,affiliate_user_id AS "affiliateUserId",type,details,created_at AS timestamp FROM affiliate_activities WHERE affiliate_user_id=$1 ORDER BY created_at DESC LIMIT 200`,[res.locals.user.uid]);res.json(r.rows.map(({details,...r})=>({...details,...r})));
  }));
  router.post('/me/affiliate/activities',wrap(async()=>{throw new HttpError(403,'Referral activity must come from a verified tracking integration');}));
  router.get('/me/affiliate/payouts',wrap(async(_req,res)=>{
    const r=await pool.query(`SELECT id,affiliate_user_id AS "affiliateUserId",amount::float8,method,destination,status,requested_at AS "requestedAt",tx_hash AS "txHash" FROM affiliate_payouts WHERE affiliate_user_id=$1 ORDER BY requested_at DESC`,[res.locals.user.uid]);res.json(r.rows);
  }));
  router.post('/me/affiliate/payouts',wrap(async(req,res)=>{
    const id=randomUUID(),uid=res.locals.user.uid,value=amount(req.body.amount),method=choice(req.body.method,paymentMethods),destination=text(req.body.destination,500);
    if(value==null || value<50 || Math.abs(Math.round(value*100)-value*100)>0.000001) throw new HttpError(400,'Minimum withdrawal is $50, with at most two decimal places');
    await transaction(async c=>{
      const r=await c.query('UPDATE affiliates SET available_earnings=available_earnings-$2,payout_method=$3,payout_address=$4,updated_at=now() WHERE user_id=$1 AND available_earnings >= $2 RETURNING user_id',[uid,value,method,destination]);
      if(!r.rowCount) throw new HttpError(400,'Insufficient available earnings');
      await c.query('INSERT INTO affiliate_payouts(id,affiliate_user_id,amount,method,destination) VALUES($1,$2,$3,$4,$5)',[id,uid,value,method,destination]);
    });res.status(201).json({id});
  }));
  router.use((_req,res)=>{res.status(404).json({error:'API route not found'});});
  router.use((error:any,_req:any,res:any,_next:any)=>{
    const status=error instanceof HttpError?error.status:error.code==='23505'?409:error.code==='23503'?400:500;
    const message=error instanceof HttpError?error.message:error.code==='23505'?'This record already exists':error.code==='23503'?'Related record not found':'Database request failed';
    if(status===500) console.error('Database request failed:',error.code || error.name);
    res.status(status).json({error:message});
  });
  return router;
}
