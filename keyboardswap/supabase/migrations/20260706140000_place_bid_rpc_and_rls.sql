-- Defense-in-depth: prevent sellers from bidding on their own listings at the
-- RLS layer even before the RPC runs. AS RESTRICTIVE combines with AND against
-- the existing permissive INSERT policy.
CREATE POLICY "Sellers cannot bid on their own listings"
  ON bids
  FOR INSERT
  AS RESTRICTIVE
  TO authenticated
  WITH CHECK (
    NOT EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = bids.listing_id
        AND listings.seller_id = auth.uid()
    )
  );

-- place_bid: validates all business rules and atomically inserts a bid while
-- updating listings.current_price. SECURITY DEFINER is required so the function
-- can write to listings.current_price regardless of who the caller is.
-- SET search_path = public prevents search-path hijacking.
CREATE OR REPLACE FUNCTION place_bid(
  p_listing_id UUID,
  p_amount     NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_listing listings%ROWTYPE;
  v_min_bid NUMERIC;
  v_bid_id  UUID;
  v_now     TIMESTAMPTZ := now();
BEGIN
  -- Must be authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'You must be logged in.';
  END IF;

  -- Lock the row to prevent concurrent bids from racing on current_price
  SELECT * INTO v_listing
  FROM listings
  WHERE id = p_listing_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Listing not found.';
  END IF;

  IF v_listing.status != 'approved' THEN
    RAISE EXCEPTION 'Listing is not active.';
  END IF;

  -- Seller cannot bid on their own listing
  IF v_listing.seller_id = auth.uid() THEN
    RAISE EXCEPTION 'You cannot bid on your own listing.';
  END IF;

  -- Auction must have started
  IF v_listing.scheduled_start_time IS NOT NULL
     AND v_listing.scheduled_start_time > v_now THEN
    RAISE EXCEPTION 'Auction has not started.';
  END IF;

  -- Auction must not have ended
  IF v_listing.end_time IS NOT NULL AND v_listing.end_time <= v_now THEN
    RAISE EXCEPTION 'Auction has ended.';
  END IF;

  -- Minimum bid = max(current_price + increment, starting_bid).
  -- Guarantees the first bid can never be placed below the starting bid.
  v_min_bid := GREATEST(
    v_listing.current_price + COALESCE(v_listing.bid_increment, 1),
    COALESCE(v_listing.starting_bid, v_listing.starting_price)
  );

  IF p_amount < v_min_bid THEN
    RAISE EXCEPTION 'Bid amount is below the minimum allowed.';
  END IF;

  -- Insert bid (manual, non-proxy)
  INSERT INTO bids (listing_id, bidder_id, amount, is_proxy_bid)
  VALUES (p_listing_id, auth.uid(), p_amount, false)
  RETURNING id INTO v_bid_id;

  -- Reflect new price on the listing
  UPDATE listings
  SET current_price = p_amount
  WHERE id = p_listing_id;

  RETURN jsonb_build_object(
    'bid_id', v_bid_id,
    'amount', p_amount
  );
END;
$$;

-- Allow authenticated users to call the function via PostgREST RPC
GRANT EXECUTE ON FUNCTION place_bid(UUID, NUMERIC) TO authenticated;

NOTIFY pgrst, 'reload schema';
