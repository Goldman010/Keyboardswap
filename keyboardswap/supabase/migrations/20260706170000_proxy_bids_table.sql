-- proxy_bids stores each bidder's private maximum per listing.
-- max_amount is NEVER returned in any public query or shared with other users.
-- All mutations (INSERT, UPDATE) must go through place_proxy_bid (SECURITY DEFINER).
-- Direct INSERT/UPDATE/DELETE from the client are blocked: no policies grant them.

CREATE TABLE proxy_bids (
  id         UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID           NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  bidder_id  UUID           NOT NULL REFERENCES auth.users(id),
  max_amount NUMERIC(10, 2) NOT NULL CHECK (max_amount > 0),
  created_at TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ    NOT NULL DEFAULT now(),
  UNIQUE (listing_id, bidder_id)
);

CREATE INDEX proxy_bids_listing_id_idx ON proxy_bids (listing_id);

ALTER TABLE proxy_bids ENABLE ROW LEVEL SECURITY;

-- Bidders may SELECT only their own proxy record.
-- No INSERT / UPDATE / DELETE policies — all mutations go through place_proxy_bid.
CREATE POLICY "Users can view their own proxy bids"
  ON proxy_bids
  FOR SELECT
  TO authenticated
  USING (bidder_id = auth.uid());

-- Minimum privilege required for the RLS SELECT policy to evaluate.
GRANT SELECT ON proxy_bids TO authenticated;

NOTIFY pgrst, 'reload schema';
