import type { ModeratableListingStatus } from "@/lib/listingStatus";

/** Includes `sold` for legacy rows; new listings use pending | approved | rejected. */
export type ListingStatus = ModeratableListingStatus | "sold";

export type Listing = {
  id: string;
  title: string;
  description: string;
  condition: string;
  starting_price: number;
  current_price: number;
  seller_username: string;
  status: ListingStatus;
  created_at: string;
  image_urls: string[];
};

export type NewListing = Pick<
  Listing,
  "title" | "description" | "condition" | "starting_price" | "seller_username"
>;
