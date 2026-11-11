-- seller_payment_accounts: tracks Stripe Connect onboarding status per seller.
-- stripe_account_id and status flags are written exclusively by trusted server-side
-- code (API route handlers using the service role key), never by direct client writes.

CREATE TABLE seller_payment_accounts (
  user_id                  UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_account_id        TEXT        UNIQUE,
  stripe_charges_enabled   BOOLEAN     NOT NULL DEFAULT false,
  stripe_payouts_enabled   BOOLEAN     NOT NULL DEFAULT false,
  stripe_details_submitted BOOLEAN     NOT NULL DEFAULT false,
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE seller_payment_accounts ENABLE ROW LEVEL SECURITY;

-- Sellers may only read their own payout account row.
CREATE POLICY "spa_own_select"
  ON seller_payment_accounts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- No direct INSERT / UPDATE / DELETE from client roles.
-- All mutations go through server-side API routes using the service role key.

GRANT SELECT ON seller_payment_accounts TO authenticated;

NOTIFY pgrst, 'reload schema';
