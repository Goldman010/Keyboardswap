import type { ListingStatus } from "@/lib/types/listing";

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export function formatListedDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatStatus(status: ListingStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function formatSellerLabel(sellerUsername: string | null | undefined) {
  const username = sellerUsername?.trim();
  if (username) {
    return `@${username}`;
  }
  return "Verified seller";
}
