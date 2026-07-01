import type { ListingStatus } from "@/lib/types/listing";

export const LISTING_STATUSES = ["pending", "approved", "rejected"] as const;

export type ModeratableListingStatus = (typeof LISTING_STATUSES)[number];

export function isListingStatus(value: string): value is ModeratableListingStatus {
  return (LISTING_STATUSES as readonly string[]).includes(value);
}

export function statusAfterEdit(status: ListingStatus): ListingStatus {
  if (status === "approved" || status === "rejected") {
    return "pending";
  }
  return status;
}
