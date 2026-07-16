import { getDisplayAuctionStatus } from "@/lib/auction";
import { formatDateTime } from "@/lib/formatListing";
import type { Listing } from "@/lib/types/listing";

type AuctionTimingBadgeProps = {
  listing: Listing;
};

export function AuctionTimingBadge({ listing }: AuctionTimingBadgeProps) {
  const status = getDisplayAuctionStatus(listing);

  if (status === "scheduled" && listing.scheduled_start_time) {
    return (
      <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800">
        Starts {formatDateTime(listing.scheduled_start_time)}
      </span>
    );
  }

  if (status === "live") {
    // Extended is persistent DB state — safe to show as a static badge.
    // Real-time "Ending Soon" lives in AuctionSidebar where a countdown
    // timer already runs; a stale snapshot on a card would be misleading.
    if (listing.is_extended) {
      return (
        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
          Extended
        </span>
      );
    }

    return (
      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800">
        Live
      </span>
    );
  }

  return null;
}
