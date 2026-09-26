CREATE TABLE catalog_sync_runs (
  id uuid PRIMARY KEY,
  source text NOT NULL DEFAULT 'propfirmmap',
  status text NOT NULL CHECK (status IN ('running','succeeded','failed')),
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  firm_count integer NOT NULL DEFAULT 0,
  challenge_count integer NOT NULL DEFAULT 0,
  offer_count integer NOT NULL DEFAULT 0,
  error text
);

CREATE TABLE firms (
  id text PRIMARY KEY,
  provider_id bigint NOT NULL UNIQUE,
  name text NOT NULL,
  country text,
  asset_type text,
  website text,
  logo_url text,
  score numeric,
  safety_grade text,
  trustpilot_rating numeric,
  trustpilot_review_count integer,
  platforms text[] NOT NULL DEFAULT '{}',
  payout_methods text[] NOT NULL DEFAULT '{}',
  source text NOT NULL DEFAULT 'propfirmmap',
  source_url text NOT NULL,
  raw_data jsonb NOT NULL,
  active boolean NOT NULL DEFAULT true,
  synced_at timestamptz NOT NULL,
  sync_run_id uuid NOT NULL REFERENCES catalog_sync_runs(id)
);
CREATE INDEX firms_asset_active ON firms(asset_type, active);

CREATE TABLE challenges (
  id text PRIMARY KEY,
  firm_id text NOT NULL REFERENCES firms(id),
  provider_id bigint NOT NULL,
  name text,
  step text,
  account_size numeric,
  currency text,
  price numeric,
  profit_split_pct numeric,
  profit_target_pct numeric,
  daily_loss_pct numeric,
  total_drawdown_pct numeric,
  drawdown_model text,
  min_trade_days integer,
  raw_data jsonb NOT NULL,
  active boolean NOT NULL DEFAULT true,
  synced_at timestamptz NOT NULL,
  UNIQUE(firm_id, provider_id)
);
CREATE INDEX challenges_firm ON challenges(firm_id);

CREATE TABLE firm_rules (
  firm_id text PRIMARY KEY REFERENCES firms(id),
  trading_rules jsonb,
  payout_rules jsonb,
  synced_at timestamptz NOT NULL
);

CREATE TABLE offers (
  id text PRIMARY KEY,
  firm_id text NOT NULL REFERENCES firms(id),
  provider_id bigint NOT NULL UNIQUE,
  description text,
  promo_code text,
  discount_percent numeric,
  expires_at timestamptz,
  outbound_url text,
  raw_data jsonb NOT NULL,
  active boolean NOT NULL DEFAULT true,
  synced_at timestamptz NOT NULL
);
CREATE INDEX offers_firm ON offers(firm_id);

CREATE TABLE users (
  id text PRIMARY KEY,
  display_name text NOT NULL,
  email text NOT NULL DEFAULT '',
  photo_url text NOT NULL DEFAULT '',
  loyalty_points integer NOT NULL DEFAULT 200 CHECK (loyalty_points >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  last_login_at timestamptz NOT NULL DEFAULT now(),
  last_daily_claim_date date
);
CREATE TABLE favorites (
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  firm_id text NOT NULL REFERENCES firms(id),
  PRIMARY KEY(user_id, firm_id)
);
CREATE TABLE reviews (
  id uuid PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id),
  firm_id text NOT NULL REFERENCES firms(id),
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title text NOT NULL,
  comment text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, firm_id)
);
CREATE INDEX reviews_firm ON reviews(firm_id, created_at DESC);
CREATE TABLE giveaway_entries (
  id uuid PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id),
  giveaway_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, giveaway_id)
);
CREATE TABLE price_alerts (
  id uuid PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id),
  challenge_id text NOT NULL REFERENCES challenges(id),
  target_price numeric CHECK (target_price >= 0),
  alert_type text NOT NULL CHECK (alert_type IN ('any_change','price_drop','discount_increase')),
  channel text NOT NULL CHECK (channel IN ('email','in_app','both')),
  notify_on_discount boolean NOT NULL DEFAULT true,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_notified_at timestamptz,
  UNIQUE(user_id, challenge_id)
);
CREATE INDEX price_alerts_user ON price_alerts(user_id);
CREATE TABLE affiliates (
  user_id text PRIMARY KEY REFERENCES users(id),
  referral_code text NOT NULL UNIQUE,
  custom_slug text NOT NULL UNIQUE,
  tier text NOT NULL DEFAULT 'Silver',
  commission_rate numeric NOT NULL DEFAULT 15,
  total_clicks integer NOT NULL DEFAULT 0,
  total_signups integer NOT NULL DEFAULT 0,
  total_conversions integer NOT NULL DEFAULT 0,
  available_earnings numeric(14,2) NOT NULL DEFAULT 0 CHECK (available_earnings >= 0),
  pending_earnings numeric(14,2) NOT NULL DEFAULT 0,
  lifetime_earnings numeric(14,2) NOT NULL DEFAULT 0,
  payout_method text NOT NULL DEFAULT 'Crypto (USDT)',
  payout_address text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE affiliate_activities (
  id uuid PRIMARY KEY,
  affiliate_user_id text NOT NULL REFERENCES affiliates(user_id),
  type text NOT NULL CHECK (type IN ('click','signup','conversion')),
  details jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX affiliate_activities_user ON affiliate_activities(affiliate_user_id, created_at DESC);
CREATE TABLE affiliate_payouts (
  id uuid PRIMARY KEY,
  affiliate_user_id text NOT NULL REFERENCES affiliates(user_id),
  amount numeric(14,2) NOT NULL CHECK (amount >= 50),
  method text NOT NULL,
  destination text NOT NULL,
  status text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','Processing','Completed')),
  tx_hash text,
  requested_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX affiliate_payouts_user ON affiliate_payouts(affiliate_user_id, requested_at DESC);
