-- Allow authenticated users to update their own listings.
CREATE POLICY "Users can update own listings"
  ON listings
  FOR UPDATE
  TO authenticated
  USING (seller_id = auth.uid())
  WITH CHECK (seller_id = auth.uid());

NOTIFY pgrst, 'reload schema';
