import 'dotenv/config';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import pg from 'pg';
import express from 'express';
import { randomUUID } from 'node:crypto';
import { fixtureFirm } from './fixtures';

// An isolated schema is created and removed; never change the real catalog/user tables.
test('PostgreSQL import, transactions and authenticated persistence', {skip:!process.env.TEST_DATABASE_URL},async t=>{
  const root=new pg.Pool({connectionString:process.env.TEST_DATABASE_URL});
  const schema=`test_${randomUUID().replaceAll('-','')}`;
  await root.query(`CREATE SCHEMA ${schema}`);
  const url=new URL(process.env.TEST_DATABASE_URL!);url.searchParams.set('options',`-c search_path=${schema}`);
  process.env.DATABASE_URL=url.toString();
  const {pool,migrate,transaction}=await import('../backend/db');
  const {syncCatalog}=await import('../backend/sync');
  const {createDataRouter}=await import('../backend/routes');
  let server:ReturnType<ReturnType<typeof express>['listen']>|undefined;
  try {
    await migrate();await migrate();
    const fixture={firms:[fixtureFirm()],offers:[]};
    const api={snapshot:async()=>fixture} as any;
    await syncCatalog(api,()=>{});await syncCatalog(api,()=>{});
    assert.equal((await pool.query('SELECT count(*)::int AS n FROM firms')).rows[0].n,1);
    assert.equal((await pool.query('SELECT count(*)::int AS n FROM challenges')).rows[0].n,1);
    assert.equal((await pool.query('SELECT price FROM challenges')).rows[0].price,null);
    await assert.rejects(()=>syncCatalog({snapshot:async()=>{throw new Error('upstream unavailable');}} as any,()=>{}));
    assert.equal((await pool.query('SELECT active FROM firms')).rows[0].active,true);
    const bad={...fixture,firms:[{...fixtureFirm(),id:2},{...fixtureFirm('other',2)}]};
    await assert.rejects(()=>syncCatalog({snapshot:async()=>bad} as any,()=>{}));
    assert.equal((await pool.query('SELECT provider_id FROM firms')).rows[0].provider_id,'1');
    const app=express();app.use(express.json());app.use('/api',createDataRouter(async token=>{
      if(!['alice','bob'].includes(token))throw new Error('bad token');
      return {uid:token,email:`${token}@example.test`,name:token} as any;
    }));
    await new Promise<void>(resolve=>{server=app.listen(0,'127.0.0.1',resolve);});
    const address=server!.address() as {port:number};
    const call=async(path:string,method='GET',body?:unknown,user='alice')=>{
      const response=await fetch(`http://127.0.0.1:${address.port}/api${path}`,{method,headers:{Authorization:`Bearer ${user}`,'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
      return {status:response.status,data:await response.json()};
    };
    assert.equal((await call('/me/profile','GET',undefined,'forged')).status,401);
    for(const user of ['alice','bob'])assert.equal((await call('/me/profile','POST',{uid:'victim'},user)).data.uid,user);
    await t.test('daily rewards and giveaway entries are idempotent under concurrency',async()=>{
      await Promise.all([call('/me/daily-bonus','POST'),call('/me/daily-bonus','POST')]);
      await Promise.all([call('/me/giveaways','POST',{giveawayId:'test'}),call('/me/giveaways','POST',{giveawayId:'test'})]);
      assert.equal((await call('/me/profile')).data.loyaltyPoints,235);
    });
    await t.test('catalog joins, favorites and persisted reviews use real firm IDs',async()=>{
      const catalog=(await call('/catalog')).data;assert.equal(catalog.data[0].challenges[0].price_numeric,null);
      assert.equal((await call('/me/favorites','PUT',{favoriteFirmIds:['test-firm']})).status,200);
      assert.equal((await call('/me/favorites','PUT',{favoriteFirmIds:['missing']})).status,400);
      assert.deepEqual((await call('/me/profile')).data.favoriteFirmIds,['test-firm']);
      const review={firmId:'test-firm',rating:5,title:'Example',comment:'Test review',payoutReceived:false};
      assert.equal((await call('/me/reviews','POST',review)).status,201);
      assert.equal((await call('/me/reviews','POST',review)).status,409);
      assert.equal((await call('/firms/test-firm/reviews')).data[0].author,'alice');
    });
    await t.test('price alerts enforce ownership, uniqueness and persisted deletion',async()=>{
      const body={userId:'bob',planId:'test-firm:10',targetPrice:80,alertType:'price_drop',channel:'in_app',notifyOnDiscount:true};
      const created=await call('/me/price-alerts','POST',body);assert.equal(created.status,201);
      assert.equal((await call('/me/price-alerts','POST',body)).status,409);
      assert.equal((await call(`/me/price-alerts/${created.data.id}`,'PATCH',{active:false},'bob')).status,404);
      assert.equal((await call('/me/price-alerts')).data[0].userId,'alice');
      assert.equal((await call('/me/price-alerts','GET',undefined,'bob')).data.length,0);
      await call(`/me/price-alerts/${created.data.id}`,'DELETE');assert.deepEqual((await call('/me/price-alerts')).data,[]);
    });
    await t.test('affiliate balances cannot be fabricated or overdrawn',async()=>{
      const initial=(await call('/me/affiliate','POST')).data;assert.equal(initial.availableEarnings,0);
      assert.equal((await call('/me/affiliate','PATCH',{availableEarnings:99999})).status,400);
      assert.equal((await call('/me/affiliate/activities','POST',{type:'conversion'})).status,403);
      await pool.query("UPDATE affiliates SET available_earnings=100 WHERE user_id='alice'");
      const payout={amount:75,method:'Wise',destination:'test-destination',status:'Completed',txHash:'fake'};
      const results=await Promise.all([call('/me/affiliate/payouts','POST',payout),call('/me/affiliate/payouts','POST',payout)]);
      assert.deepEqual(results.map(r=>r.status).sort(),[201,400]);
      assert.equal((await call('/me/affiliate')).data.availableEarnings,25);
      assert.equal((await call('/me/affiliate/payouts')).data[0].status,'Pending');
      assert.equal((await call('/me/affiliate/payouts')).data[0].txHash,null);
    });
    await t.test('deactivation preserves user records and history',async()=>{
      await syncCatalog({snapshot:async()=>({firms:[fixtureFirm('new-firm',2)],offers:[]})} as any,()=>{});
      assert.equal((await pool.query("SELECT active FROM firms WHERE id='test-firm'")).rows[0].active,false);
      assert.equal((await pool.query('SELECT count(*)::int AS n FROM users')).rows[0].n,2);
      assert.equal((await pool.query('SELECT count(*)::int AS n FROM reviews')).rows[0].n,1);
    });
    await transaction(async c=>{assert.equal((await c.query('SELECT 1 AS n')).rows[0].n,1);});
  } finally {
    if(server)await new Promise<void>((resolve,reject)=>server!.close(e=>e?reject(e):resolve()));
    await pool.end();
    await root.query(`DROP SCHEMA ${schema} CASCADE`);
    await root.end();
  }
});
