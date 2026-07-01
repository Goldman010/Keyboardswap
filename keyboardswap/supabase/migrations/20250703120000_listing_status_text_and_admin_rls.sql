-- Convert listing status from Postgres enum to TEXT.
-- Allowed values are validated in the application: pending, approved, rejected.

ALTER TABLE listings
  ALTER COLUMN status DROP DEFAULT;

ALTER TABLE listings
  ALTER COLUMN status TYPE TEXT
  USING status::text;

ALTER TABLE listings
  ALTER COLUMN status SET DEFAULT 'pending';

ALTER TABLE listings
  ALTER COLUMN status SET NOT NULL;

DROP TYPE IF EXISTS listing_status;

-- Admin MVP (no auth): allow reading pending listings for /admin.
CREATE POLICY "Anyone can view pending listings"
  ON listings
  FOR SELECT
  TO anon, authenticated
  USING (status = 'pending');

-- Admin MVP (no auth): approve or reject pending listings only.
CREATE POLICY "Anyone can moderate pending listings"
  ON listings
  FOR UPDATE
  TO anon, authenticated
  USING (status = 'pending')
  WITH CHECK (status IN ('approved', 'rejected'));

NOTIFY pgrst, 'reload schema';
