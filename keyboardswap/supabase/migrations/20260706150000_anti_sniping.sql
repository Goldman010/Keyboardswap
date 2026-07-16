-- Track whether an auction has been extended by anti-sniping at least once.
-- Used by the UI to show the "Extended" badge.
ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS is_extended BOOLEAN NOT NULL DEFAULT false;

-- Replace place_bid with the anti-sniping version.
-- All prior validation logic is preserved; the only addition is the
-- post-bid check that extends end_time when a bid lands in the final 30 s.
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
  v_listing     listings%ROWTYPE;
  v_min_bid     NUMERIC;
  v_bid_id      UUID;
  v_now         TIMESTAMPTZ := now();
  v_new_end     TIMESTAMPTZ;
  v_sniped      BOOLEAN := false;
BEGIN
  -- Must be authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'You must be logged in.';
  END IF;

  -- Lock the row to prevent concurrent bids from racing on current_price / end_time
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

  IF v_listing.seller_id = auth.uid() THEN
    RAISE EXCEPTION 'You cannot bid on your own listing.';
  END IF;

  IF v_listing.scheduled_start_time IS NOT NULL
     AND v_listing.scheduled_start_time > v_now THEN
    RAISE EXCEPTION 'Auction has not started.';
  END IF;

  IF v_listing.end_time IS NOT NULL AND v_listing.end_time <= v_now THEN
    RAISE EXCEPTION 'Auction has ended.';
  END IF;

  -- Minimum bid = max(current_price + increment, starting_bid).
  -- Mirrors the client-side getMinimumBid() in lib/placeBid.ts.
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

  -- Anti-sniping: if the bid lands within the final 30 seconds, extend the
  -- auction end time. Use GREATEST so we never accidentally shorten the
  -- auction (e.g. if end_time was already far out for some edge-case reason).
  v_new_end := v_listing.end_time;

  IF v_listing.end_time IS NOT NULL
     AND v_now >= v_listing.end_time - interval '30 seconds' THEN

    v_new_end := GREATEST(
      v_listing.end_time    + interval '2 minutes',
      v_now                 + interval '2 minutes'
    );

    UPDATE listings
    SET end_time    = v_new_end,
        is_extended = true
    WHERE id = p_listing_id;

    v_sniped := true;
  END IF;

  RETURN jsonb_build_object(
    'bid_id',   v_bid_id,
    'amount',   p_amount,
    'end_time', v_new_end,
    'extended', v_sniped
  );
END;
$$;

-- Grant is inherited from the previous migration; re-stating for clarity.
GRANT EXECUTE ON FUNCTION place_bid(UUID, NUMERIC) TO authenticated;

NOTIFY pgrst, 'reload schema';
