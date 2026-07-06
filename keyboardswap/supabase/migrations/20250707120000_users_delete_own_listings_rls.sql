-- Allow authenticated users to delete their own non-sold listings.
CREATE POLICY "Users can delete own listings"
  ON listings
  FOR DELETE
  TO authenticated
  USING (
    seller_id = auth.uid()
    AND status <> 'sold'
  );

-- Allow authenticated users to remove listing images after row deletion.
CREATE POLICY "authenticated delete listing images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'listing-images');

NOTIFY pgrst, 'reload schema';
