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

export function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
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

export function formatBidCount(count: number): string {
  if (count === 1) return "1 bid";
  return `${count} bids`;
}

export function formatRelativeTime(date: string): string {
  const diffMs = Date.now() - new Date(date).getTime();
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
