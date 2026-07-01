-- Fix Storage RLS for anonymous uploads to listing-images (development / MVP, no auth).
-- Safe to re-run: drops and recreates policies.

INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-images', 'listing-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Anyone can upload listing images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view listing images" ON storage.objects;
DROP POLICY IF EXISTS "anon upload listing images" ON storage.objects;
DROP POLICY IF EXISTS "anon read listing images" ON storage.objects;
DROP POLICY IF EXISTS "public read listing images bucket" ON storage.buckets;

-- Unauthenticated app users connect as the anon role (not the Postgres "public" role).
CREATE POLICY "anon upload listing images"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'listing-images');

CREATE POLICY "anon read listing images"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'listing-images');

-- Lets the client resolve bucket metadata when using the anon key.
CREATE POLICY "public read listing images bucket"
  ON storage.buckets
  FOR SELECT
  TO anon, authenticated
  USING (id = 'listing-images');
