# PostgreSQL and PropFirmMap

The app uses PostgreSQL for all application persistence. Firebase Authentication still handles Google/anonymous sign-in; the server verifies Firebase ID tokens before accessing private rows. No browser code connects directly to PostgreSQL or Firestore.

Data flow:

```text
PropFirmMap public API → server importer → PostgreSQL → /api/catalog → React
Firebase sign-in → verified bearer token → /api/me/* → PostgreSQL
```

## Setup

1. Install dependencies with `bun install`.
2. Start PostgreSQL with `docker compose up -d` (or `podman compose up -d`).
3. Copy `.env.example` to `.env` and set `DATABASE_URL`. The example matches the local Compose database on port 55433. Use your own credentials and TLS connection settings for a hosted database.
4. Run `bun run db:migrate`, then `bun run db:sync`.
5. Run `bun run dev` and visit http://localhost:3000.

In this workspace an isolated Podman container named `propfirmmatch-postgres` was already created on port 55433 with volume `propfirmmatch-pgdata`. Use that container or Compose, not both on the same port. `podman start propfirmmatch-postgres` restarts it without losing its data.

PropFirmMap requires **no API key**: [documentation](https://propfirmmap.com/api/docs), [OpenAPI contract](https://propfirmmap.com/api/v1/openapi.json). No guessed authorization header is sent. `GEMINI_API_KEY` belongs to the separate optional AI chat/research features, not this import. PostgreSQL credentials are server-only, never `VITE_` variables.

## Tables

| Table | Purpose / relationships |
| --- | --- |
| `firms` | Provider ID, stable provider slug as primary key, searchable firm metadata, raw source fields, source URL and sync time |
| `challenges` | Account plans linked to `firms`; ID is `{firm-slug}:{provider-challenge-id}`; nullable price, currency, size, target, split and drawdown fields; raw source text |
| `firm_rules` | Trading and payout rule objects linked to a firm, including source verification dates and rule notes |
| `offers` | Active deals linked to firms; provider ID, code (nullable for automatic offers), discount, expiry, original payload |
| `catalog_sync_runs` | Import start/end, success/failure, row counts and error summary |
| `users` | Firebase UID, profile and server-managed loyalty points |
| `favorites` | User–firm join table |
| `reviews` | User–firm reviews; one review per user per firm; separate from Trustpilot ratings |
| `giveaway_entries` | One entry per user per giveaway |
| `price_alerts` | User–challenge subscriptions and target prices in the source plan currency |
| `affiliates` | User affiliate account with real balances initialized to zero |
| `affiliate_activities` | Referral events; requires a trusted tracking integration to populate |
| `affiliate_payouts` | Pending withdrawal requests, deducted atomically from available funds |
| `schema_migrations` | Applied versioned SQL migrations |

Schema: `db/migrations/001_postgres.sql`. Indexes cover catalog filtering and user-owned lookups; foreign keys retain relationships. Imported records that disappear are marked inactive, preserving favorites/reviews/alert references and history.

## Import behavior

- Reads every page of `/api/v1/firms`, then `/api/v1/firms/{slug}` for each published firm, followed by all pages of `/api/v1/deals`.
- Requests are sequential, spaced at least 1.1 seconds apart. Timeouts, bounded retry/backoff and `Retry-After` handling protect the provider's rate limits. A full import takes several minutes.
- A PostgreSQL advisory lock allows only one importer for this database at a time.
- Fetches and validates the complete catalog before publishing. All upserts, inactive flags and the success record commit in one transaction. API or database failures leave the previous catalog usable and record a failed run.
- Nulls stay null. Raw source statements and notes are retained; source currency is displayed without invented exchange rates or automatically applying a deal to every plan.
- Expired offers are excluded when the catalog is read, even between syncs.
- The server checks hourly for an import due (default 8 hours since the last successful run, about three imports per day), including on startup. Automatic scheduling requires a running server; failures retry at the next hourly check.
- `bun run db:sync` runs one import and exits with a nonzero status on failure. For an external cron scheduler, set `CATALOG_SYNC_ENABLED=false` and run it at 00:00, 08:00, and 16:00 in the server's timezone:

  ```cron
  0 0,8,16 * * * cd /path/to/pilot-project && /path/to/bun run db:sync >> /path/to/catalog-sync.log 2>&1
  ```

  Cron needs the same `DATABASE_URL` as the app. The importer takes a database lock, so overlapping runs cannot publish concurrently.

Inspect import status:

```sql
SELECT status, started_at, finished_at, firm_count, challenge_count, offer_count, error
FROM catalog_sync_runs ORDER BY started_at DESC LIMIT 10;
```

## API

- Public: `GET /api/health`, `GET /api/catalog`, `GET /api/firms/:slug/reviews`.
- Authenticated profile: `POST/GET /api/me/profile`, `PUT /api/me/favorites`, `POST /api/me/daily-bonus`.
- Authenticated activity: `POST /api/me/reviews`, `POST /api/me/giveaways`, `GET/POST /api/me/price-alerts`, `PATCH/DELETE /api/me/price-alerts/:id`.
- Affiliate: `GET/POST/PATCH /api/me/affiliate`, `GET /api/me/affiliate/activities`, `GET/POST /api/me/affiliate/payouts`.

Private routes require `Authorization: Bearer <Firebase ID token>`. User identity comes from the verified token, never a client-submitted user ID. Monetary balances and reward changes are server-managed. Client polling replaces Firestore listeners and stops on unmount/sign-out. There is no public import-trigger endpoint.

## Existing data and limits

This change does not delete or export the old Firestore database. Existing Firestore user records have **not** been copied; a returning sign-in currently creates a new PostgreSQL profile if none exists. A production cutover with existing users needs an authenticated Firestore export and explicit mapping of legacy firm/plan IDs to provider IDs before traffic is switched. The former Firestore rules/blueprint remain as historical reference and are not used by the running app.

The provider does not supply this app's community reviews, individual payout proofs, referral commissions or giveaway sponsorships. These must not be treated as imported catalog facts. Payout proofs now show no records. Guest affiliate simulations remain local demo data and cannot write balances. Price-alert preferences are persisted; automated price-change notification delivery and email delivery are not implemented. Withdrawal requests are stored as pending; no money-transfer integration is present.

The public catalog returns the complete snapshot in one response (currently 228 firms); server-side pagination can be added if payload size becomes a problem. No historical price time series is collected yet.

## Verification

`bun run lint` and `bun run build` check the app. `bun run test` runs importer tests; PostgreSQL integration tests run only when `TEST_DATABASE_URL` is set. They create a uniquely named test schema and remove it afterwards, leaving application tables untouched. Use a local/test database account with schema creation permission.

```sh
TEST_DATABASE_URL=postgres://propfirmmatch:propfirmmatch@127.0.0.1:55433/propfirmmatch bun run test
```

`bun run check:catalog` checks server rendering of all imported cards and details plus comparison, quiz, discounts and calculator views against the running local API. It is not a browser interaction test.
