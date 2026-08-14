import { supabase } from "@/lib/supabaseClient";
import type { MyProxyBid } from "@/lib/types/proxy-bid";

export type PlaceProxyBidResult =
  | {
      success: true;
      proxyId: string;
      newPrice: number;
      extended: boolean;
      endTime: string | null;
    }
  | { success: false; error: string };

/**
 * Calls the place_proxy_bid Postgres RPC.
 *
 * Sets or raises the authenticated user's private maximum bid for a listing.
 * The RPC resolves the public price against all competing bids atomically.
 */
export async function placeProxyBid(
  listingId: string,
  maxAmount: number,
): Promise<PlaceProxyBidResult> {
  const { data, error } = await supabase.rpc("place_proxy_bid", {
    p_listing_id: listingId,
    p_max_amount: maxAmount,
  });

  if (error) {
    const raw = error.message ?? "";
    const message =
      raw.replace(/^ERROR:\s+/i, "").trim() ||
      "Failed to set proxy bid. Please try again.";
    return { success: false, error: message };
  }

  const result = data as {
    proxy_id: string;
    new_price: number;
    extended: boolean;
    end_time: string | null;
  };

  return {
    success: true,
    proxyId: result.proxy_id,
    newPrice: result.new_price,
    extended: result.extended,
    endTime: result.end_time,
  };
}

/**
 * Fetches the authenticated user's own proxy bid for a listing.
 * Returns null if the user has no proxy set or is not logged in.
 *
 * Uses the proxy_bids SELECT policy (own rows only); never exposes
 * other users' proxy records.
 */
export async function getMyProxyBid(
  listingId: string,
): Promise<MyProxyBid | null> {
  const { data } = await supabase
    .from("proxy_bids")
    .select("id, listing_id, max_amount, created_at, updated_at")
    .eq("listing_id", listingId)
    .maybeSingle();

  return (data as MyProxyBid | null) ?? null;
}
