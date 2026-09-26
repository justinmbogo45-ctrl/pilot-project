import { randomUUID } from 'node:crypto';
import { pool } from './db';
import { PropFirmMapClient, numeric, API_BASE, type CatalogSnapshot } from './propfirmmap';
import type { PoolClient } from 'pg';

// All writes publish in one transaction. A failed import never deactivates valid rows.
export async function publishSnapshot(client: PoolClient, snapshot: CatalogSnapshot, runId: string) {
  await client.query('UPDATE firms SET active=false');
  await client.query('UPDATE challenges SET active=false');
  await client.query('UPDATE offers SET active=false');
  let challengeCount = 0;
  for (const f of snapshot.firms) {
    const { challenges, rules, offers, ...raw } = f;
    await client.query(`INSERT INTO firms(id,provider_id,name,country,asset_type,website,logo_url,score,safety_grade,trustpilot_rating,trustpilot_review_count,platforms,payout_methods,source_url,raw_data,synced_at,sync_run_id)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,now(),$16)
      ON CONFLICT(id) DO UPDATE SET provider_id=EXCLUDED.provider_id,name=EXCLUDED.name,country=EXCLUDED.country,asset_type=EXCLUDED.asset_type,website=EXCLUDED.website,logo_url=EXCLUDED.logo_url,score=EXCLUDED.score,safety_grade=EXCLUDED.safety_grade,trustpilot_rating=EXCLUDED.trustpilot_rating,trustpilot_review_count=EXCLUDED.trustpilot_review_count,platforms=EXCLUDED.platforms,payout_methods=EXCLUDED.payout_methods,source_url=EXCLUDED.source_url,raw_data=EXCLUDED.raw_data,active=true,synced_at=now(),sync_run_id=EXCLUDED.sync_run_id`,
      [f.slug,f.id,f.name,f.country,f.asset_type,f.url,f.logo_url,numeric(f.propfirmmap_score),f.safety_grade,numeric(f.trustpilot?.rating),numeric(f.trustpilot?.review_count),f.platforms ?? [],f.payout_methods ?? [],`${API_BASE}/firms/${f.slug}`,raw,runId]);
    await client.query(`INSERT INTO firm_rules(firm_id,trading_rules,payout_rules,synced_at) VALUES($1,$2,$3,now()) ON CONFLICT(firm_id) DO UPDATE SET trading_rules=EXCLUDED.trading_rules,payout_rules=EXCLUDED.payout_rules,synced_at=now()`, [f.slug,rules?.trading_rules ?? null,rules?.payout_rules ?? null]);
    for (const c of challenges) {
      await client.query(`INSERT INTO challenges(id,firm_id,provider_id,name,step,account_size,currency,price,profit_split_pct,profit_target_pct,daily_loss_pct,total_drawdown_pct,drawdown_model,min_trade_days,raw_data,synced_at)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,now()) ON CONFLICT(id) DO UPDATE SET name=EXCLUDED.name,step=EXCLUDED.step,account_size=EXCLUDED.account_size,currency=EXCLUDED.currency,price=EXCLUDED.price,profit_split_pct=EXCLUDED.profit_split_pct,profit_target_pct=EXCLUDED.profit_target_pct,daily_loss_pct=EXCLUDED.daily_loss_pct,total_drawdown_pct=EXCLUDED.total_drawdown_pct,drawdown_model=EXCLUDED.drawdown_model,min_trade_days=EXCLUDED.min_trade_days,raw_data=EXCLUDED.raw_data,active=true,synced_at=now()`,
        [`${f.slug}:${c.id}`,f.slug,c.id,c.name,c.step,numeric(c.account_size_numeric),c.currency,numeric(c.price_numeric),numeric(c.profit_split_pct),numeric(c.profit_target_pct),numeric(c.max_daily_loss_pct),numeric(c.max_total_drawdown_pct),c.drawdown_model,numeric(c.min_trade_days),c]);
      challengeCount++;
    }
  }
  for (const o of snapshot.offers) {
    await client.query(`INSERT INTO offers(id,firm_id,provider_id,description,promo_code,discount_percent,expires_at,outbound_url,raw_data,synced_at)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,now()) ON CONFLICT(id) DO UPDATE SET firm_id=EXCLUDED.firm_id,description=EXCLUDED.description,promo_code=EXCLUDED.promo_code,discount_percent=EXCLUDED.discount_percent,expires_at=EXCLUDED.expires_at,outbound_url=EXCLUDED.outbound_url,raw_data=EXCLUDED.raw_data,active=true,synced_at=now()`,
      [`propfirmmap:${o.id}`,o.firm.slug,o.id,o.description,o.promo_code,numeric(o.discount_percent),o.expires_at,o.outbound_url,o]);
  }
  await client.query(`UPDATE catalog_sync_runs SET status='succeeded',finished_at=now(),firm_count=$2,challenge_count=$3,offer_count=$4 WHERE id=$1`, [runId,snapshot.firms.length,challengeCount,snapshot.offers.length]);
  return { firms: snapshot.firms.length, challenges: challengeCount, offers: snapshot.offers.length };
}

export async function syncCatalog(api = new PropFirmMapClient(), progress = console.log) {
  const client = await pool.connect();
  const runId = randomUUID();
  let locked = false;
  let started = false;
  try {
    locked = (await client.query('SELECT pg_try_advisory_lock(26092602) AS locked')).rows[0].locked;
    if (!locked) return { skipped: true, reason: 'Another catalog import is running' };
    await client.query(`UPDATE catalog_sync_runs SET status='failed',finished_at=now(),error='Importer stopped before completion' WHERE status='running'`);
    await client.query(`INSERT INTO catalog_sync_runs(id,status) VALUES($1,'running')`, [runId]);
    started = true;
    const snapshot = await api.snapshot(progress);
    await client.query('BEGIN');
    const result = await publishSnapshot(client, snapshot, runId);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    if (started) await client.query(`UPDATE catalog_sync_runs SET status='failed',finished_at=now(),error=$2 WHERE id=$1`, [runId,error instanceof Error ? error.message.slice(0,500) : 'Import failed']);
    throw error;
  } finally {
    if (locked) await client.query('SELECT pg_advisory_unlock(26092602)');
    client.release();
  }
}
