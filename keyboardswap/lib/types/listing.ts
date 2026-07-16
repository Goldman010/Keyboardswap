import type { ModeratableListingStatus } from "@/lib/listingStatus";
import type {
  AuctionStatus,
  ListingType,
} from "@/lib/auction";

/** Includes `sold` for legacy rows; new listings use pending | approved | rejected. */
export type ListingStatus = ModeratableListingStatus | "sold";

export type Listing = {
  id: string;
  title: string;
  description: string;
  condition: string;
  starting_price: number;
  current_price: number;
  seller_username: string | null;
  seller_id: string | null;
  status: ListingStatus;
  created_at: string;
  image_urls: string[];
  listing_type: ListingType;
  starting_bid: number | null;
  reserve_price: number | null;
  buy_it_now_price: number | null;
  bid_increment: number | null;
  scheduled_start_time: string | null;
  end_time: string | null;
  auction_status: AuctionStatus | null;
  category: string | null;
  known_flaws: string | null;
  included_items: string | null;
  is_extended: boolean;
};

export type NewListing = Pick<
  Listing,
  "title" | "description" | "condition" | "starting_price" | "seller_id"
>;
