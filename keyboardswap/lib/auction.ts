import type { Listing } from "@/lib/types/listing";

export const LISTING_TYPES = [
  "auction",
  "buy_it_now",
  "auction_buy_it_now",
] as const;

export type ListingType = (typeof LISTING_TYPES)[number];

export const BID_INCREMENTS = [1, 2, 5, 10, 25] as const;

export type BidIncrement = (typeof BID_INCREMENTS)[number];

export const AUCTION_STATUSES = [
  "scheduled",
  "live",
  "ended",
  "unsold",
] as const;

export type AuctionStatus = (typeof AUCTION_STATUSES)[number];

export type DisplayAuctionStatus = "scheduled" | "live" | "ended";

export type ReservePublicLabel = "No Reserve" | "Reserve Not Met" | "Reserve Met";

export const LISTING_TYPE_LABELS: Record<ListingType, string> = {
  auction: "Auction",
  buy_it_now: "Buy It Now",
  auction_buy_it_now: "Auction + Buy It Now",
};

export const DEFAULT_AUCTION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export function defaultAuctionEndTime(start: Date): Date {
  return new Date(start.getTime() + DEFAULT_AUCTION_DURATION_MS);
}

export function parseDate(value: string | null | undefined): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function isListingEnded(listing: Listing, now: Date = new Date()): boolean {
  const endTime = parseDate(listing.end_time);
  return endTime !== null && endTime <= now;
}

export function isListingScheduled(listing: Listing, now: Date = new Date()): boolean {
  const startTime = parseDate(listing.scheduled_start_time);
  return startTime !== null && startTime > now;
}

export function isListingLive(listing: Listing, now: Date = new Date()): boolean {
  if (listing.status !== "approved") {
    return false;
  }

  if (isListingEnded(listing, now)) {
    return false;
  }

  const startTime = parseDate(listing.scheduled_start_time);
  if (!startTime) {
    return true;
  }

  return startTime <= now;
}

/** Approved listings that are live or upcoming (not ended). */
export function isListingBrowsable(listing: Listing, now: Date = new Date()): boolean {
  if (listing.status !== "approved") {
    return false;
  }

  return !isListingEnded(listing, now);
}

export function getDisplayAuctionStatus(
  listing: Listing,
  now: Date = new Date(),
): DisplayAuctionStatus {
  if (isListingEnded(listing, now)) {
    return "ended";
  }

  if (isListingScheduled(listing, now)) {
    return "scheduled";
  }

  return "live";
}

export function getStartingBid(listing: Listing): number {
  return listing.starting_bid ?? listing.starting_price;
}

export function getReservePublicLabel(
  listing: Listing,
  options: { reserveMet?: boolean } = {},
): ReservePublicLabel {
  if (listing.reserve_price == null) {
    return "No Reserve";
  }

  return options.reserveMet ? "Reserve Met" : "Reserve Not Met";
}

export function filterBrowsableListings(
  listings: Listing[],
  now: Date = new Date(),
): Listing[] {
  return listings.filter((listing) => isListingBrowsable(listing, now));
}

export function toDatetimeLocalValue(date: Date): string {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

export function parseDatetimeLocalValue(value: string): Date | null {
  if (!value.trim()) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function listingTypeAllowsBuyItNow(listingType: ListingType): boolean {
  return listingType === "buy_it_now" || listingType === "auction_buy_it_now";
}
