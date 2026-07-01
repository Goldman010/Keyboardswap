-- Add image_urls column to store public Supabase Storage URLs (ordered array).
ALTER TABLE listings
  ADD COLUMN image_urls TEXT[] NOT NULL DEFAULT '{}';

-- Create a public bucket for listing photos.
-- Public = true so getPublicUrl() works without signed URLs.
INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-images', 'listing-images', true)
ON CONFLICT (id) DO NOTHING;

-- MVP (no auth): allow anonymous uploads to listing-images only.
CREATE POLICY "Anyone can upload listing images"
  ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'listing-images');

-- Public read access for approved marketplace display.
CREATE POLICY "Public can view listing images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'listing-images');
