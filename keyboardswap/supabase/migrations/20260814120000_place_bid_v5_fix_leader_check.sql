-- place_bid v5 + place_proxy_bid v2
--
-- Fix: ORDER BY amount DESC, created_at DESC for leader determination.
--
-- Root cause: place_bid v4 inserts a manual bid and a proxy counter-bid
-- inside the same transaction. PostgreSQL now() returns the transaction
-- start time, so both rows share an identical created_at. The previous
-- ORDER BY created_at DESC LIMIT 1 was nondeterministic, returning
-- either row. Sorting by amount DESC first is safe because no two bids
-- on the same listing can share an amount (increment >= 1 enforced),
-- and the proxy counter always has a strictly higher amount than the
-- manual bid that triggered it.

CREATE OR REPLACE FUNCTION place_proxy_bid(
  p_listing_id UUID,
  p_max_amount NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_listing          listings%ROWTYPE;
  v_now              TIMESTAMPTZ := now();
  v_current_leader   UUID;
  v_my_proxy         proxy_bids%ROWTYPE;
  v_best_other       proxy_bids%ROWTYPE;
  v_best_other_found BOOLEAN := false;
  v_competition      NUMERIC;
  v_new_price        NUMERIC;
  v_proxy_bid_id     UUID;
  v_triggered_bid_id UUID;
  v_new_end          TIMESTAMPTZ;
  v_sniped           BOOLEAN := false;
  v_starting_bid     NUMERIC;
  v_increment        NUMERIC;
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

  v_starting_bid := COALESCE(v_listing.starting_bid, v_listing.starting_price);
  v_increment    := COALESCE(v_listing.bid_increment, 1);
  v_new_end      := v_listing.end_time;

  -- amount DESC ensures the proxy counter (always higher) wins over a
  -- same-created_at manual bid when determining the effective leader.
  SELECT bidder_id INTO v_current_leader
  FROM bids
  WHERE listing_id = p_listing_id
  ORDER BY amount DESC, created_at DESC
  LIMIT 1;

  IF v_current_leader IS NOT NULL AND v_current_leader = auth.uid() THEN
    IF p_max_amount < v_listing.current_price THEN
      RAISE EXCEPTION 'Proxy maximum cannot be below your current bid of %.', v_listing.current_price;
    END IF;
  ELSIF v_current_leader IS NOT NULL THEN
    IF p_max_amount < v_listing.current_price + v_increment THEN
      RAISE EXCEPTION 'Your proxy maximum must be at least % to take the lead.',
        (v_listing.current_price + v_increment);
    END IF;
  ELSE
    IF p_max_amount < v_starting_bid THEN
      RAISE EXCEPTION 'Your proxy maximum must be at least the starting bid of %.', v_starting_bid;
    END IF;
  END IF;

  SELECT * INTO v_my_proxy
  FROM proxy_bids
  WHERE listing_id = p_listing_id AND bidder_id = auth.uid();

  IF FOUND THEN
    IF p_max_amount <= v_my_proxy.max_amount THEN
      RAISE EXCEPTION 'Your new maximum must be higher than your current proxy maximum of %.', v_my_proxy.max_amount;
    END IF;
    UPDATE proxy_bids SET max_amount = p_max_amount, updated_at = v_now WHERE id = v_my_proxy.id;
    v_proxy_bid_id := v_my_proxy.id;
  ELSE
    INSERT INTO proxy_bids (listing_id, bidder_id, max_amount)
    VALUES (p_listing_id, auth.uid(), p_max_amount)
    RETURNING id INTO v_proxy_bid_id;
  END IF;

  SELECT * INTO v_best_other
  FROM proxy_bids
  WHERE listing_id = p_listing_id AND bidder_id != auth.uid()
  ORDER BY max_amount DESC, created_at ASC
  LIMIT 1;

  v_best_other_found := FOUND;

  v_competition := GREATEST(
    v_listing.current_price,
    CASE WHEN v_best_other_found THEN v_best_other.max_amount ELSE 0 END
  );

  IF v_current_leader IS NOT NULL AND v_current_leader = auth.uid() THEN
    IF NOT v_best_other_found OR p_max_amount > v_best_other.max_amount THEN
      NULL;
    ELSIF p_max_amount = v_best_other.max_amount THEN
      NULL;
    ELSE
      v_new_price := GREATEST(LEAST(v_best_other.max_amount, p_max_amount + v_increment), v_listing.current_price);
      IF v_new_price > v_listing.current_price THEN
        INSERT INTO bids (listing_id, bidder_id, amount, is_proxy_bid)
        VALUES (p_listing_id, v_best_other.bidder_id, v_new_price, true)
        RETURNING id INTO v_triggered_bid_id;
        UPDATE listings SET current_price = v_new_price WHERE id = p_listing_id;
      END IF;
    END IF;
  ELSE
    IF v_current_leader IS NULL THEN
      v_new_price := v_starting_bid;
      INSERT INTO bids (listing_id, bidder_id, amount, is_proxy_bid)
      VALUES (p_listing_id, auth.uid(), v_new_price, true)
      RETURNING id INTO v_triggered_bid_id;
      UPDATE listings SET current_price = v_new_price WHERE id = p_listing_id;
    ELSIF p_max_amount > v_competition THEN
      v_new_price := LEAST(p_max_amount, v_competition + v_increment);
      INSERT INTO bids (listing_id, bidder_id, amount, is_proxy_bid)
      VALUES (p_listing_id, auth.uid(), v_new_price, true)
      RETURNING id INTO v_triggered_bid_id;
      UPDATE listings SET current_price = v_new_price WHERE id = p_listing_id;
    ELSIF p_max_amount = v_competition
          AND v_best_other_found
          AND v_best_other.max_amount = p_max_amount THEN
      v_new_price := v_competition;
      IF v_new_price > v_listing.current_price THEN
        INSERT INTO bids (listing_id, bidder_id, amount, is_proxy_bid)
        VALUES (p_listing_id, v_best_other.bidder_id, v_new_price, true)
        RETURNING id INTO v_triggered_bid_id;
        UPDATE listings SET current_price = v_new_price WHERE id = p_listing_id;
      END IF;
    ELSE
      IF v_best_other_found THEN
        v_new_price := GREATEST(LEAST(v_best_other.max_amount, p_max_amount + v_increment), v_listing.current_price);
        IF v_new_price > v_listing.current_price THEN
          INSERT INTO bids (listing_id, bidder_id, amount, is_proxy_bid)
          VALUES (p_listing_id, v_best_other.bidder_id, v_new_price, true)
          RETURNING id INTO v_triggered_bid_id;
          UPDATE listings SET current_price = v_new_price WHERE id = p_listing_id;
        END IF;
      END IF;
    END IF;
  END IF;

  IF v_triggered_bid_id IS NOT NULL
     AND v_listing.end_time IS NOT NULL
     AND v_now >= v_listing.end_time - interval '30 seconds' THEN
    v_new_end := GREATEST(
      v_listing.end_time + interval '2 minutes',
      v_now              + interval '2 minutes'
    );
    UPDATE listings SET end_time = v_new_end, is_extended = true WHERE id = p_listing_id;
    v_sniped := true;
  END IF;

  RETURN jsonb_build_object(
    'proxy_id',         v_proxy_bid_id,
    'triggered_bid_id', v_triggered_bid_id,
    'new_price',        COALESCE(v_new_price, v_listing.current_price),
    'extended',         v_sniped,
    'end_time',         v_new_end
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION place_proxy_bid(UUID, NUMERIC) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION place_proxy_bid(UUID, NUMERIC) TO authenticated;

NOTIFY pgrst, 'reload schema';
