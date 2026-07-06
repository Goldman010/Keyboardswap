-- Create the bids table as the source of truth for all bid events.
--
-- proxy_max_amount is stored here for future proxy bidding but MUST
-- never be selected in public or seller-visible queries. Protect it
-- at the query layer until a dedicated RPC or view enforces it at the
-- database layer.

CREATE TABLE bids (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id       UUID        NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  bidder_id        UUID        NOT NULL REFERENCES auth.users(id),
  amount           NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  is_proxy_bid     BOOLEAN     NOT NULL DEFAULT false,
  proxy_max_amount NUMERIC(10, 2)
    CHECK (proxy_max_amount IS NULL OR proxy_max_amount >= amount),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX bids_listing_id_created_at_idx ON bids (listing_id, created_at DESC);

ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

-- Public read: anyone may view bids on approved listings.
-- proxy_max_amount is protected at the query layer (never selected publicly).
CREATE POLICY "Anyone can view bids on approved listings"
  ON bids
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = bids.listing_id
        AND listings.status = 'approved'
    )
  );

-- Authenticated users may only insert bids on their own behalf.
CREATE POLICY "Authenticated users can place bids"
  ON bids
  FOR INSERT
  TO authenticated
  WITH CHECK (bidder_id = auth.uid());

-- No UPDATE or DELETE policies: bids are immutable once placed.

NOTIFY pgrst, 'reload schema';
