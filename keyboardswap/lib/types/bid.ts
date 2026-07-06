// Public shape for a bid event.
//
// proxy_max_amount is intentionally omitted from this type.
// It must never be selected in public, seller-visible, or client-facing
// queries. Only a future authenticated RPC for the bidder themselves
// should ever return that value.
export type Bid = {
  id: string;
  listing_id: string;
  bidder_id: string;
  amount: number;
  is_proxy_bid: boolean;
  created_at: string;
};
