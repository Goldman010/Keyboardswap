-- Listing approval workflow
CREATE TYPE listing_status AS ENUM ('pending', 'approved', 'sold');

CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (char_length(trim(title)) > 0),
  description TEXT NOT NULL CHECK (char_length(trim(description)) > 0),
  condition TEXT NOT NULL CHECK (char_length(trim(condition)) > 0),
  starting_price NUMERIC(10, 2) NOT NULL CHECK (starting_price >= 0),
  current_price NUMERIC(10, 2) NOT NULL CHECK (current_price >= 0),
  seller_username TEXT NOT NULL CHECK (char_length(trim(seller_username)) > 0),
  status listing_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT current_price_gte_starting CHECK (current_price >= starting_price)
);

CREATE INDEX listings_status_created_at_idx ON listings (status, created_at DESC);

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Public marketplace: only approved listings are visible
CREATE POLICY "Anyone can view approved listings"
  ON listings
  FOR SELECT
  USING (status = 'approved');

-- MVP: no auth yet — anyone can submit a listing (always starts as pending)
CREATE POLICY "Anyone can create listings"
  ON listings
  FOR INSERT
  WITH CHECK (status = 'pending');
