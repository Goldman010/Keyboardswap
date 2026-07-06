-- Auction foundation fields for scheduled listings.
ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS listing_type TEXT NOT NULL DEFAULT 'auction'
    CHECK (listing_type IN ('auction', 'buy_it_now', 'auction_buy_it_now'));

ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS starting_bid NUMERIC(10, 2)
    CHECK (starting_bid IS NULL OR starting_bid >= 0);

ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS reserve_price NUMERIC(10, 2)
    CHECK (reserve_price IS NULL OR reserve_price >= 0);

ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS buy_it_now_price NUMERIC(10, 2)
    CHECK (buy_it_now_price IS NULL OR buy_it_now_price >= 0);

ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS bid_increment NUMERIC(10, 2)
    CHECK (bid_increment IS NULL OR bid_increment IN (1, 2, 5, 10, 25));

ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS scheduled_start_time TIMESTAMPTZ;

ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS end_time TIMESTAMPTZ;

ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS auction_status TEXT
    CHECK (
      auction_status IS NULL
      OR auction_status IN ('scheduled', 'live', 'ended', 'unsold')
    );

UPDATE listings
SET starting_bid = starting_price
WHERE starting_bid IS NULL;

NOTIFY pgrst, 'reload schema';
