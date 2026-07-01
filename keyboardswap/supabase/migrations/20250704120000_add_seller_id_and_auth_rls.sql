-- Link listings to authenticated sellers via auth.users.
ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES auth.users(id);

-- Legacy rows keep seller_username; new auth-based listings omit it.
ALTER TABLE listings
  ALTER COLUMN seller_username DROP NOT NULL;

ALTER TABLE listings
  DROP CONSTRAINT IF EXISTS listings_seller_username_check;

-- Replace anonymous listing creation with authenticated seller inserts.
DROP POLICY IF EXISTS "Anyone can create listings" ON listings;

CREATE POLICY "Authenticated users can create own listings"
  ON listings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    status = 'pending'
    AND seller_id = auth.uid()
  );

NOTIFY pgrst, 'reload schema';
