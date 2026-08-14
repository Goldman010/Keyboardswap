-- place_bid v5 -- consecutive-bid leader check fix (see 20260814120000)

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
  v_listing       listings%ROWTYPE;
  v_min_bid       NUMERIC;
  v_bid_id        UUID;
  v_last_bidder   UUID;
  v_now           TIMESTAMPTZ := now();
  v_new_end       TIMESTAMPTZ;
  v_sniped        BOOLEAN := false;
  v_best_proxy    proxy_bids%ROWTYPE;
  v_counter_price NUMERIC;
  v_counter_id    UUID;
  v_outbid        BOOLEAN := false;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'You must be logged in.';
  END IF;

  SELECT * INTO v_listing FROM listings WHERE id = p_listing_id FOR UPDATE;

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

  v_min_bid := GREATEST(
    v_listing.current_price + COALESCE(v_listing.bid_increment, 1),
    COALESCE(v_listing.starting_bid, v_listing.starting_price)
  );

  IF p_amount < v_min_bid THEN
    RAISE EXCEPTION 'Bid amount is below the minimum allowed.';
  END IF;

  -- amount DESC ensures the proxy counter (always higher) is returned as
  -- the leader even when it shares a created_at with the manual bid that
  -- triggered it (both inserted in the same prior transaction).
  SELECT bidder_id INTO v_last_bidder
  FROM bids
  WHERE listing_id = p_listing_id
  ORDER BY amount DESC, created_at DESC
  LIMIT 1;

  IF FOUND AND v_last_bidder = auth.uid() THEN
    RAISE EXCEPTION 'You are already the highest bidder.';
  END IF;

  INSERT INTO bids (listing_id, bidder_id, amount, is_proxy_bid)
  VALUES (p_listing_id, auth.uid(), p_amount, false)
  RETURNING id INTO v_bid_id;

  UPDATE listings SET current_price = p_amount WHERE id = p_listing_id;

  -- Proxy counter: exclude caller's own proxy so it never bids against them.
  SELECT * INTO v_best_proxy
  FROM proxy_bids
  WHERE listing_id = p_listing_id AND bidder_id != auth.uid()
  ORDER BY max_amount DESC, created_at ASC
  LIMIT 1;

  IF FOUND AND v_best_proxy.max_amount >= p_amount THEN
    v_counter_price := LEAST(
      v_best_proxy.max_amount,
      p_amount + COALESCE(v_listing.bid_increment, 1)
    );
    IF v_counter_price > p_amount THEN
      INSERT INTO bids (listing_id, bidder_id, amount, is_proxy_bid)
      VALUES (p_listing_id, v_best_proxy.bidder_id, v_counter_price, true)
      RETURNING id INTO v_counter_id;
      UPDATE listings SET current_price = v_counter_price WHERE id = p_listing_id;
      v_outbid := true;
    END IF;
  END IF;

  v_new_end := v_listing.end_time;

  IF v_listing.end_time IS NOT NULL
     AND v_now >= v_listing.end_time - interval '30 seconds' THEN
    v_new_end := GREATEST(
      v_listing.end_time + interval '2 minutes',
      v_now              + interval '2 minutes'
    );
    UPDATE listings SET end_time = v_new_end, is_extended = true WHERE id = p_listing_id;
    v_sniped := true;
  END IF;

  RETURN jsonb_build_object(
    'bid_id',          v_bid_id,
    'amount',          p_amount,
    'end_time',        v_new_end,
    'extended',        v_sniped,
    'outbid_by_proxy', v_outbid,
    'counter_amount',  v_counter_price
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION place_bid(UUID, NUMERIC) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION place_bid(UUID, NUMERIC) TO authenticated;

NOTIFY pgrst, 'reload schema';
