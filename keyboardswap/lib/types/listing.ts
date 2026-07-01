export type ListingStatus = "pending" | "approved" | "sold";

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
