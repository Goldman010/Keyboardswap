import Link from "next/link";
import type { Listing } from "@/lib/types/listing";
import {
  getDerivedListingStatus,
  getDisplayAuctionStatus,
  type DerivedListingStatus,
} from "@/lib/auction";
import { ListingPlaceholderImage } from "@/components/ListingPlaceholderImage";
import {
  formatDateTime,
  formatListedDate,
  formatPrice,
} from "@/lib/formatListing";

type MyListingCardProps = {
  listing: Listing;
  bidCount?: number;
  onDeleteClick?: (listing: Listing) => void;
};

const DERIVED_STATUS_BADGE: Record<
  DerivedListingStatus,
  { label: string; className: string }
> = {
  pending:   { label: "Pending",   className: "bg-amber-100 text-amber-800" },
  rejected:  { label: "Rejected",  className: "bg-red-100 text-red-800" },
  scheduled: { label: "Scheduled", className: "bg-blue-100 text-blue-800" },
  live:      { label: "Live",      className: "bg-emerald-100 text-emerald-800" },
  sold:      { label: "Sold",      className: "bg-zinc-100 text-zinc-700" },
  unsold:    { label: "Unsold",    className: "bg-amber-100 text-amber-800" },
};

export function MyListingCard({
  listing,
  bidCount = 0,
  onDeleteClick,
}: MyListingCardProps) {
  const derivedStatus = getDerivedListingStatus(listing, bidCount);
  const auctionStatus = getDisplayAuctionStatus(listing);

  // Sellers cannot edit a listing once the auction is live or ended.
  const canEdit =
    listing.status !== "approved" ||
    (auctionStatus !== "live" && auctionStatus !== "ended");

  const canDelete = listing.status !== "sold";

  const { label, className } = DERIVED_STATUS_BADGE[derivedStatus];

  return (
    <article className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <ListingPlaceholderImage
        src={listing.image_urls?.[0]}
        alt={listing.title}
        aspectClass="aspect-[4/3]"
      />

      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold text-zinc-900">{listing.title}</h2>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${className}`}
          >
            {label}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
            {listing.condition}
          </span>
          <span className="text-zinc-500">
            Listed {formatListedDate(listing.created_at)}
          </span>
        </div>

        {/* Auction timing info */}
        {listing.status === "approved" && (
          <>
            {auctionStatus === "scheduled" && listing.scheduled_start_time && (
              <p className="text-sm text-blue-800">
                Starts {formatDateTime(listing.scheduled_start_time)}
              </p>
            )}
            {auctionStatus === "live" && listing.end_time && (
              <p className="text-sm text-emerald-700">
                Ends {formatDateTime(listing.end_time)}
              </p>
            )}
            {auctionStatus === "ended" && listing.end_time && (
              <p className="text-sm text-zinc-500">
                Ended {formatDateTime(listing.end_time)}
              </p>
            )}
          </>
        )}

        <div className="flex items-center justify-between gap-4 border-t border-zinc-100 pt-4">
          <span className="text-base font-semibold text-zinc-900">
            {formatPrice(listing.current_price)}
          </span>

          <div className="flex flex-wrap items-center justify-end gap-3">
            {canEdit ? (
              <Link
                href={`/my-listings/${listing.id}/edit`}
                className="text-sm font-medium text-zinc-600 underline underline-offset-4 hover:text-zinc-900"
              >
                Edit
              </Link>
            ) : (
              <span className="text-sm text-zinc-300">Edit</span>
            )}

            {listing.status === "approved" ? (
              <Link
                href={`/listing/${listing.id}`}
                className="text-sm font-medium text-zinc-600 underline underline-offset-4 hover:text-zinc-900"
              >
                View listing
              </Link>
            ) : (
              <span className="text-sm text-zinc-400">Not public</span>
            )}

            {canDelete && onDeleteClick ? (
              <button
                type="button"
                onClick={() => onDeleteClick(listing)}
                className="text-sm font-medium text-red-600 underline underline-offset-4 hover:text-red-700"
              >
                Delete
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
