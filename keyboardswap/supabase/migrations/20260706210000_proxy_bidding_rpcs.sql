-- ============================================================
-- place_proxy_bid
--
-- Sets or raises a bidder's private maximum on a listing and
-- immediately resolves the public price against all competing bids.
--
-- Algorithm (all under a listings FOR UPDATE lock):
--
--   1. Standard validation (auth, status, seller, timing).
--   2. Validate p_max_amount against the current state:
--        - No bids yet          → must be >= starting_bid
--        - Caller is leader     → must be >= current_price (their own bid)
--        - Someone else leads   → must be >= current_price + increment
--   3. Upsert proxy record (raise-only; lowering is rejected).
--   4. Find the best competing proxy (highest max, earliest on tie).
--   5. Compute v_competition = GREATEST(current_price, competing_proxy.max)
--      This unifies the public price and private ceilings into one value.
--   6. Resolve:
--        CASE caller is already the public leader:
--          a) caller.max > competitor   → still winning, no price change
--          b) caller.max = competitor   → tie but caller was first → no change
--          c) caller.max < competitor   → competitor wins; fire proxy counter-bid
--        CASE caller is NOT the public leader:
--          a) no bids yet (first proxy) → caller bids at starting_bid
--          b) caller.max > competition  → caller wins at competition + increment
--          c) caller.max = competitor   → earlier proxy (competitor) wins
--          d) caller.max < competition  → competitor fires counter to caller.max + increment
--   7. Anti-snipe any bid that fires in the final 30 s.
-- ============================================================

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
  v_listing           listings%ROWTYPE;
  v_now               TIMESTAMPTZ := now();
  v_current_leader    UUID;
  v_my_proxy          proxy_bids%ROWTYPE;
  v_best_other        proxy_bids%ROWTYPE;
  v_best_other_found  BOOLEAN := false;
  v_competition       NUMERIC;
  v_new_price         NUMERIC;
  v_proxy_bid_id      UUID;
  v_triggered_bid_id  UUID;
  v_new_end           TIMESTAMPTZ;
  v_sniped            BOOLEAN := false;
  v_starting_bid      NUMERIC;
  v_increment         NUMERIC;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'You must be logged in.';
  END IF;

  -- Lock the listing row — all proxy resolution happens inside this transaction.
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

  v_starting_bid := COALESCE(v_listing.starting_bid, v_listing.starting_price);
  v_increment    := COALESCE(v_listing.bid_increment, 1);
  v_new_end      := v_listing.end_time;

  -- Determine the current public leader from the most-recent bid.
  SELECT bidder_id INTO v_current_leader
  FROM bids
  WHERE listing_id = p_listing_id
  ORDER BY created_at DESC
  LIMIT 1;

  -- Validate minimum proxy max against current auction state.
  IF v_current_leader IS NOT NULL AND v_current_leader = auth.uid() THEN
    -- Caller is already the public leader; proxy must at least cover their own bid.
    IF p_max_amount < v_listing.current_price THEN
      RAISE EXCEPTION 'Proxy maximum cannot be below your current bid of %.', v_listing.current_price;
    END IF;
  ELSIF v_current_leader IS NOT NULL THEN
    -- Someone else leads; caller must be able to outbid them by at least one increment.
    IF p_max_amount < v_listing.current_price + v_increment THEN
      RAISE EXCEPTION 'Your proxy maximum must be at least % to take the lead.',
        (v_listing.current_price + v_increment);
    END IF;
  ELSE
    -- No bids yet; must cover starting bid.
    IF p_max_amount < v_starting_bid THEN
      RAISE EXCEPTION 'Your proxy maximum must be at least the starting bid of %.', v_starting_bid;
    END IF;
  END IF;

  -- Upsert the caller's proxy record (raise-only).
  SELECT * INTO v_my_proxy
  FROM proxy_bids
  WHERE listing_id = p_listing_id AND bidder_id = auth.uid();

  IF FOUND THEN
    IF p_max_amount <= v_my_proxy.max_amount THEN
      RAISE EXCEPTION 'Your new maximum must be higher than your current proxy maximum of %.', v_my_proxy.max_amount;
    END IF;
    UPDATE proxy_bids
    SET max_amount = p_max_amount,
        updated_at = v_now
    WHERE id = v_my_proxy.id;
    v_proxy_bid_id := v_my_proxy.id;
  ELSE
    INSERT INTO proxy_bids (listing_id, bidder_id, max_amount)
    VALUES (p_listing_id, auth.uid(), p_max_amount)
    RETURNING id INTO v_proxy_bid_id;
  END IF;

  -- Find the best competing proxy (exclude caller, highest max, earliest on tie).
  SELECT * INTO v_best_other
  FROM proxy_bids
  WHERE listing_id = p_listing_id
    AND bidder_id != auth.uid()
  ORDER BY max_amount DESC, created_at ASC
  LIMIT 1;

  v_best_other_found := FOUND;

  -- v_competition unifies the public price and any competing proxy ceiling.
  v_competition := GREATEST(
    v_listing.current_price,
    CASE WHEN v_best_other_found THEN v_best_other.max_amount ELSE 0 END
  );

  -- ---- Resolution ----

  IF v_current_leader IS NOT NULL AND v_current_leader = auth.uid() THEN
    -- Caller is already the public leader.
    IF NOT v_best_other_found OR p_max_amount > v_best_other.max_amount THEN
      -- Still winning (or no competitor). Proxy ceiling raised — no price change.
      NULL;

    ELSIF p_max_amount = v_best_other.max_amount THEN
      -- Tie at the caller's raised max. Caller was already leading (earlier public bid),
      -- so caller retains the lead. No price change.
      NULL;

    ELSE
      -- Caller raised but not enough; competing proxy takes the lead.
      v_new_price := LEAST(v_best_other.max_amount, p_max_amount + v_increment);
      v_new_price := GREATEST(v_new_price, v_listing.current_price);

      IF v_new_price > v_listing.current_price THEN
        INSERT INTO bids (listing_id, bidder_id, amount, is_proxy_bid)
        VALUES (p_listing_id, v_best_other.bidder_id, v_new_price, true)
        RETURNING id INTO v_triggered_bid_id;

        UPDATE listings SET current_price = v_new_price WHERE id = p_listing_id;
      END IF;
    END IF;

  ELSE
    -- Caller is NOT the current public leader.

    IF v_current_leader IS NULL THEN
      -- No bids yet: first proxy bid fires at starting_bid.
      v_new_price := v_starting_bid;

      INSERT INTO bids (listing_id, bidder_id, amount, is_proxy_bid)
      VALUES (p_listing_id, auth.uid(), v_new_price, true)
      RETURNING id INTO v_triggered_bid_id;

      UPDATE listings SET current_price = v_new_price WHERE id = p_listing_id;

    ELSIF p_max_amount > v_competition THEN
      -- Caller wins. Bid at competition + increment, capped by caller's max.
      v_new_price := LEAST(p_max_amount, v_competition + v_increment);

      INSERT INTO bids (listing_id, bidder_id, amount, is_proxy_bid)
      VALUES (p_listing_id, auth.uid(), v_new_price, true)
      RETURNING id INTO v_triggered_bid_id;

      UPDATE listings SET current_price = v_new_price WHERE id = p_listing_id;

    ELSIF p_max_amount = v_competition
          AND v_best_other_found
          AND v_best_other.max_amount = p_max_amount THEN
      -- Exact tie with a competing proxy. The competitor was earlier (ORDER BY created_at ASC),
      -- so they win. Price advances to the tied max if not already there.
      v_new_price := v_competition;

      IF v_new_price > v_listing.current_price THEN
        INSERT INTO bids (listing_id, bidder_id, amount, is_proxy_bid)
        VALUES (p_listing_id, v_best_other.bidder_id, v_new_price, true)
        RETURNING id INTO v_triggered_bid_id;

        UPDATE listings SET current_price = v_new_price WHERE id = p_listing_id;
      END IF;

    ELSE
      -- Caller's max < competition. A competing proxy (if any) fires a counter
      -- at caller.max + increment to defend the lead.
      IF v_best_other_found THEN
        v_new_price := LEAST(v_best_other.max_amount, p_max_amount + v_increment);
        v_new_price := GREATEST(v_new_price, v_listing.current_price);

        IF v_new_price > v_listing.current_price THEN
          INSERT INTO bids (listing_id, bidder_id, amount, is_proxy_bid)
          VALUES (p_listing_id, v_best_other.bidder_id, v_new_price, true)
          RETURNING id INTO v_triggered_bid_id;

          UPDATE listings SET current_price = v_new_price WHERE id = p_listing_id;
        END IF;
      END IF;
      -- If no competing proxy (manual bidder leads), no auto-counter is fired.
    END IF;
  END IF;

  -- Anti-sniping: extend the auction if any bid fires in the final 30 s.
  IF v_triggered_bid_id IS NOT NULL
     AND v_listing.end_time IS NOT NULL
     AND v_now >= v_listing.end_time - interval '30 seconds' THEN
    v_new_end := GREATEST(
      v_listing.end_time + interval '2 minutes',
      v_now              + interval '2 minutes'
    );
    UPDATE listings
    SET end_time    = v_new_end,
        is_extended = true
    WHERE id = p_listing_id;
    v_sniped := true;
  END IF;

  RETURN jsonb_build_object(
    'proxy_id',        v_proxy_bid_id,
    'triggered_bid_id', v_triggered_bid_id,
    'new_price',       COALESCE(v_new_price, v_listing.current_price),
    'extended',        v_sniped,
    'end_time',        v_new_end
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION place_proxy_bid(UUID, NUMERIC) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION place_proxy_bid(UUID, NUMERIC) TO authenticated;


-- ============================================================
-- place_bid v4 (supersedes v3 / 160000)
--
-- Adds proxy counter-bid logic to the manual bid flow:
-- After the manual bid is recorded, the function checks for
-- any competing proxy that can beat the manual bid and fires
-- an automatic counter-bid if one exists.
--
-- A user's OWN proxy is explicitly excluded from countering
-- their own manual bid (bidder_id != auth.uid()).
--
-- Preserves: auth check, row lock, seller restriction,
-- timing validation, minimum bid, consecutive-bid prevention,
-- anti-sniping.
-- ============================================================

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

  -- Lock the listing row to serialise concurrent bids.
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
  v_min_bid := GREATEST(
    v_listing.current_price + COALESCE(v_listing.bid_increment, 1),
    COALESCE(v_listing.starting_bid, v_listing.starting_price)
  );

  IF p_amount < v_min_bid THEN
    RAISE EXCEPTION 'Bid amount is below the minimum allowed.';
  END IF;

  -- Consecutive-bid prevention.
  SELECT bidder_id INTO v_last_bidder
  FROM bids
  WHERE listing_id = p_listing_id
  ORDER BY created_at DESC
  LIMIT 1;

  IF FOUND AND v_last_bidder = auth.uid() THEN
    RAISE EXCEPTION 'You are already the highest bidder.';
  END IF;

  -- Insert the manual bid.
  INSERT INTO bids (listing_id, bidder_id, amount, is_proxy_bid)
  VALUES (p_listing_id, auth.uid(), p_amount, false)
  RETURNING id INTO v_bid_id;

  UPDATE listings SET current_price = p_amount WHERE id = p_listing_id;

  -- Proxy counter: find the best competing proxy that can beat this manual bid.
  -- Exclude the caller's own proxy (a bidder's proxy must never auto-bid against themselves).
  SELECT * INTO v_best_proxy
  FROM proxy_bids
  WHERE listing_id = p_listing_id
    AND bidder_id != auth.uid()
  ORDER BY max_amount DESC, created_at ASC
  LIMIT 1;

  IF FOUND AND v_best_proxy.max_amount >= p_amount THEN
    v_counter_price := LEAST(
      v_best_proxy.max_amount,
      p_amount + COALESCE(v_listing.bid_increment, 1)
    );

    -- Only fire the counter if it actually outbids the manual bid.
    IF v_counter_price > p_amount THEN
      INSERT INTO bids (listing_id, bidder_id, amount, is_proxy_bid)
      VALUES (p_listing_id, v_best_proxy.bidder_id, v_counter_price, true)
      RETURNING id INTO v_counter_id;

      UPDATE listings SET current_price = v_counter_price WHERE id = p_listing_id;
      v_outbid := true;
    END IF;
  END IF;

  -- Anti-sniping: extend if the manual bid lands in the final 30 s.
  v_new_end := v_listing.end_time;

  IF v_listing.end_time IS NOT NULL
     AND v_now >= v_listing.end_time - interval '30 seconds' THEN
    v_new_end := GREATEST(
      v_listing.end_time + interval '2 minutes',
      v_now              + interval '2 minutes'
    );
    UPDATE listings
    SET end_time    = v_new_end,
        is_extended = true
    WHERE id = p_listing_id;
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
