import Link from "next/link";
import type { Listing } from "@/lib/types/listing";
import { ListingStatusBadge } from "@/components/ListingStatusBadge";
import { ListingPlaceholderImage } from "@/components/ListingPlaceholderImage";
import { formatListedDate, formatPrice } from "@/lib/formatListing";

type MyListingCardProps = {
  listing: Listing;
};

export function MyListingCard({ listing }: MyListingCardProps) {
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
          <ListingStatusBadge status={listing.status} />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
            {listing.condition}
          </span>
          <span className="text-zinc-500">
            Listed {formatListedDate(listing.created_at)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-zinc-100 pt-4">
          <span className="text-base font-semibold text-zinc-900">
            {formatPrice(listing.current_price)}
          </span>

          <div className="flex items-center gap-3">
            <Link
              href={`/my-listings/${listing.id}/edit`}
              className="text-sm font-medium text-zinc-600 underline underline-offset-4 hover:text-zinc-900"
            >
              Edit
            </Link>

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
          </div>
        </div>
      </div>
    </article>
  );
}
