// Public shape returned by the get_listing_bids RPC.
//
// bidder_id and proxy_max_amount are intentionally omitted.
// The database assigns bidder_number server-side via DENSE_RANK()
// so that no client query ever exposes user identity or proxy ceilings.
export type Bid = {
  id: string;
  listing_id: string;
  amount: number;
  is_proxy_bid: boolean;
  created_at: string;
  /** Stable 1-based number assigned by order of first bid within this listing. */
  bidder_number: number;
};
