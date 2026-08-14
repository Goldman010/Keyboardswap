-- ============================================================
-- STEP 1: Remove all direct public access to the bids table.
--
-- The previous permissive SELECT and INSERT policies allowed any
-- authenticated user to query bidder_id and proxy_max_amount directly
-- via the Supabase REST API. This migration eliminates that exposure.
--
-- All bid reads must now go through get_listing_bids (anonymous history)
-- or get_listing_bid_counts (counts only). All bid writes must go through
-- place_bid or place_proxy_bid (both SECURITY DEFINER, applied later).
-- ============================================================

DROP POLICY IF EXISTS "Anyone can view bids on approved listings" ON bids;
DROP POLICY IF EXISTS "Authenticated users can place bids" ON bids;
DROP POLICY IF EXISTS "Sellers cannot bid on their own listings" ON bids;
-- Catch any alternate names used in earlier migrations
DROP POLICY IF EXISTS "Public bids are viewable by everyone." ON bids;
DROP POLICY IF EXISTS "Users can create bids." ON bids;

-- Revoke all direct table access from PostgREST roles.
-- SECURITY DEFINER functions run as the function owner and bypass these grants.
REVOKE SELECT, INSERT, UPDATE, DELETE ON bids FROM anon;
REVOKE SELECT, INSERT, UPDATE, DELETE ON bids FROM authenticated;

-- RLS remains ENABLED as defense-in-depth. With no permissive policies
-- and no table privileges, nothing can reach the table except the owner.


-- ============================================================
-- STEP 2: get_listing_bids — anonymous public bid history
--
-- Returns bid events for a single approved listing, replacing
-- bidder_id with a stable sequential bidder_number (1, 2, 3 …)
-- scoped to the listing. Never returns bidder_id, proxy_max_amount,
-- or any other identity-revealing column.
-- ============================================================

CREATE OR REPLACE FUNCTION get_listing_bids(p_listing_id UUID)
RETURNS TABLE (
  id            UUID,
  listing_id    UUID,
  amount        NUMERIC,
  is_proxy_bid  BOOLEAN,
  created_at    TIMESTAMPTZ,
  bidder_number BIGINT
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH bidder_order AS (
    SELECT
      b.listing_id,
      b.bidder_id,
      DENSE_RANK() OVER (
        PARTITION BY b.listing_id
        ORDER BY MIN(b.created_at)
      ) AS bidder_number
    FROM bids b
    WHERE b.listing_id = p_listing_id
    GROUP BY b.listing_id, b.bidder_id
  )
  SELECT
    b.id,
    b.listing_id,
    b.amount,
    b.is_proxy_bid,
    b.created_at,
    bo.bidder_number
  FROM bids b
  JOIN bidder_order bo
    ON bo.listing_id = b.listing_id
   AND bo.bidder_id  = b.bidder_id
  WHERE b.listing_id = p_listing_id
    AND EXISTS (
      SELECT 1 FROM listings l
      WHERE l.id = p_listing_id
        AND l.status = 'approved'
    )
  ORDER BY b.created_at DESC;
$$;

REVOKE EXECUTE ON FUNCTION get_listing_bids(UUID) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION get_listing_bids(UUID) TO anon, authenticated;


-- ============================================================
-- STEP 3: get_listing_bid_counts — batch bid counts
--
-- Accepts an array of listing IDs and returns one row per listing
-- that has at least one bid. Missing rows mean zero bids. Filters
-- to approved listings only. Never returns bidder identity.
-- ============================================================

CREATE OR REPLACE FUNCTION get_listing_bid_counts(p_listing_ids UUID[])
RETURNS TABLE (
  listing_id UUID,
  bid_count  BIGINT
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    b.listing_id,
    COUNT(*)::BIGINT AS bid_count
  FROM bids b
  JOIN listings l ON l.id = b.listing_id
  WHERE b.listing_id = ANY(p_listing_ids)
    AND l.status = 'approved'
  GROUP BY b.listing_id;
$$;

REVOKE EXECUTE ON FUNCTION get_listing_bid_counts(UUID[]) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION get_listing_bid_counts(UUID[]) TO anon, authenticated;


NOTIFY pgrst, 'reload schema';
