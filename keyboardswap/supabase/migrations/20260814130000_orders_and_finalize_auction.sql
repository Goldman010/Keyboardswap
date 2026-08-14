-- ============================================================
-- orders table
--
-- One row per successfully finalized auction. All fields are
-- populated exclusively by finalize_auction; no direct client
-- INSERT / UPDATE / DELETE is permitted.
-- ============================================================

CREATE TABLE orders (
  id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id   UUID          NOT NULL UNIQUE REFERENCES listings(id),
  buyer_id     UUID          NOT NULL REFERENCES auth.users(id),
  seller_id    UUID          NOT NULL REFERENCES auth.users(id),
  final_price  NUMERIC(10,2) NOT NULL CHECK (final_price > 0),
  status       TEXT          NOT NULL DEFAULT 'pending_payment'
                             CHECK (status IN (
                               'pending_payment', 'paid', 'shipped',
                               'completed', 'canceled', 'refunded',
                               'disputed', 'resolved'
                             )),
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Buyer and seller may read their own order. UUID guessing by
-- third parties returns nothing because auth.uid() will not match.
--
-- Admin access is intentionally postponed: the project does not yet
-- have a secure admin authorization model (see migration
-- 20250703120000 which uses an open "anyone can moderate" policy).
-- Add a separate admin SELECT policy here when is_admin() exists.
CREATE POLICY "order_buyer_seller_select"
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- No direct INSERT / UPDATE / DELETE from clients.
GRANT SELECT ON orders TO authenticated;


-- ============================================================
-- finalize_auction(p_listing_id UUID)
--
-- Creates one order for a successfully ended auction. If called
-- again after the order already exists, returns immediately
-- without inserting a duplicate (idempotent). UNIQUE(listing_id)
-- is the database-level backstop.
--
-- SECURITY: SECURITY DEFINER so the function can query bids and
-- insert into orders using the function owner's privileges.
-- The return value contains NO private identifiers — no order_id,
-- no buyer_id, no seller_id.
--
-- Granted to anon temporarily so any page visit to a public sold
-- listing triggers finalization without requiring a login. When a
-- scheduled/service-role job replaces this, the anon grant can be
-- revoked without changing this function's logic.
-- ============================================================

CREATE OR REPLACE FUNCTION finalize_auction(p_listing_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
DECLARE
  v_listing     listings%ROWTYPE;
  v_now         TIMESTAMPTZ := now();
  v_winner_id   UUID;
  v_final_price NUMERIC;
  v_order_exists BOOLEAN;
BEGIN
  -- Lock listing row to serialise concurrent finalization attempts.
  SELECT * INTO v_listing
  FROM listings
  WHERE id = p_listing_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Listing not found.';
  END IF;

  -- Only approved, ended listings are eligible.
  IF v_listing.status <> 'approved' THEN
    RAISE EXCEPTION 'Listing is not an approved auction.';
  END IF;

  IF v_listing.end_time IS NULL OR v_listing.end_time > v_now THEN
    RAISE EXCEPTION 'Auction has not ended yet.';
  END IF;

  IF v_listing.seller_id IS NULL THEN
    RAISE EXCEPTION 'Listing has no seller.';
  END IF;

  -- Idempotency check: return immediately if an order already exists.
  SELECT EXISTS (SELECT 1 FROM orders WHERE listing_id = p_listing_id)
  INTO v_order_exists;

  IF v_order_exists THEN
    RETURN jsonb_build_object(
      'finalized',       true,
      'outcome',         'sold',
      'already_existed', true
    );
  END IF;

  -- Find the winning bidder: highest effective public bid.
  -- Tie-broken by created_at DESC to match the logic in place_bid / place_proxy_bid.
  SELECT bidder_id, amount
  INTO v_winner_id, v_final_price
  FROM bids
  WHERE listing_id = p_listing_id
  ORDER BY amount DESC, created_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'finalized',       false,
      'outcome',         'no_bids',
      'already_existed', false
    );
  END IF;

  -- Reserve condition.
  IF v_listing.reserve_price IS NOT NULL
     AND v_final_price < v_listing.reserve_price THEN
    RETURN jsonb_build_object(
      'finalized',       false,
      'outcome',         'reserve_not_met',
      'already_existed', false
    );
  END IF;

  -- Sanity guard: winner must not be the seller (should be prevented
  -- upstream by place_bid, but checked here as defence-in-depth).
  IF v_winner_id = v_listing.seller_id THEN
    RAISE EXCEPTION 'Winner cannot be the seller.';
  END IF;

  -- Create the order. UNIQUE(listing_id) is the final idempotency backstop.
  INSERT INTO orders (listing_id, buyer_id, seller_id, final_price, status)
  VALUES (p_listing_id, v_winner_id, v_listing.seller_id, v_final_price, 'pending_payment');

  RETURN jsonb_build_object(
    'finalized',       true,
    'outcome',         'sold',
    'already_existed', false
  );
END;
$func$;

REVOKE EXECUTE ON FUNCTION finalize_auction(UUID) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION finalize_auction(UUID) TO anon;
GRANT  EXECUTE ON FUNCTION finalize_auction(UUID) TO authenticated;


-- ============================================================
-- get_my_order_for_listing(p_listing_id UUID)
--
-- Returns the order for this listing only when the caller is the
-- buyer or the seller. Returns NULL for all other authenticated
-- users and raises an exception for unauthenticated callers.
--
-- The SECURITY DEFINER bypass allows reading the orders table
-- without granting table-level SELECT to all roles; the result
-- is still scoped exclusively to auth.uid().
--
-- Authenticated only — never grant to anon.
-- ============================================================

CREATE OR REPLACE FUNCTION get_my_order_for_listing(p_listing_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
DECLARE
  v_uid   UUID := auth.uid();
  v_order orders%ROWTYPE;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'You must be logged in.';
  END IF;

  SELECT * INTO v_order
  FROM orders
  WHERE listing_id = p_listing_id
    AND (buyer_id = v_uid OR seller_id = v_uid);

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  RETURN jsonb_build_object(
    'id',          v_order.id,
    'listing_id',  v_order.listing_id,
    'buyer_id',    v_order.buyer_id,
    'seller_id',   v_order.seller_id,
    'final_price', v_order.final_price,
    'status',      v_order.status,
    'created_at',  v_order.created_at,
    'updated_at',  v_order.updated_at
  );
END;
$func$;

REVOKE EXECUTE ON FUNCTION get_my_order_for_listing(UUID) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION get_my_order_for_listing(UUID) TO authenticated;


NOTIFY pgrst, 'reload schema';
