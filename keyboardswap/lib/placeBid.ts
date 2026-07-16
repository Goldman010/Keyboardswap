import { supabase } from "@/lib/supabaseClient";
import type { Listing } from "@/lib/types/listing";

/**
 * Minimum valid bid for a listing.
 *
 * = max(current_price + bid_increment, starting_bid)
 *
 * Mirrors the validation inside the place_bid Postgres RPC so the UI can
 * show the correct minimum before the user submits.
 */
export function getMinimumBid(listing: Listing): number {
  const increment = listing.bid_increment ?? 1;
  const fromIncrement = listing.current_price + increment;
  const startingBid = listing.starting_bid ?? listing.starting_price;
  return Math.max(fromIncrement, startingBid);
}

export type PlaceBidResult =
  | { success: true; bidId: string; amount: number }
  | { success: false; error: string };

/**
 * Calls the place_bid Postgres RPC.
 *
 * The RPC raises user-friendly exception messages that are safe to display
 * directly to the user (e.g. "Auction has ended.", "You must be logged in.").
 * Only falls back to a generic message for unexpected low-level errors.
 */
export async function placeBid(
  listingId: string,
  amount: number,
): Promise<PlaceBidResult> {
  const { data, error } = await supabase.rpc("place_bid", {
    p_listing_id: listingId,
    p_amount: amount,
  });

  if (error) {
    // PostgREST may prefix the message with "ERROR: " — strip it so we can
    // display the user-friendly text from RAISE EXCEPTION verbatim.
    const raw = error.message ?? "";
    const message =
      raw.replace(/^ERROR:\s+/i, "").trim() ||
      "Failed to place bid. Please try again.";
    return { success: false, error: message };
  }

  const result = data as { bid_id: string; amount: number };
  return { success: true, bidId: result.bid_id, amount: result.amount };
}
