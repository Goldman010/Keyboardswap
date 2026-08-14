// Owner-visible shape for a proxy bid record.
//
// max_amount is the authenticated user's private ceiling.
// This type is ONLY used to display the caller's own proxy state
// (e.g. "Your current maximum: $200" in the auction sidebar).
//
// It must never be returned to other users or included in any
// public-facing query or API response.
export type MyProxyBid = {
  id: string;
  listing_id: string;
  max_amount: number;
  created_at: string;
  updated_at: string;
};
