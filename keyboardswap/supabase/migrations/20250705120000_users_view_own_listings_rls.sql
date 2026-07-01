-- Allow authenticated users to read their own listings (all statuses).
CREATE POLICY "Users can view own listings"
  ON listings
  FOR SELECT
  TO authenticated
  USING (seller_id = auth.uid());

NOTIFY pgrst, 'reload schema';
