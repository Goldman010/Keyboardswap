import type { Listing } from "@/lib/types/listing";
import {
  getDisplayAuctionStatus,
  getReservePublicLabel,
  getStartingBid,
  LISTING_TYPE_LABELS,
} from "@/lib/auction";
import {
  formatDateTime,
  formatListedDate,
  formatPrice,
  formatSellerLabel,
} from "@/lib/formatListing";
import { AuctionTimingBadge } from "@/components/AuctionTimingBadge";
import { ListingImageGallery } from "@/components/ListingImageGallery";

type ListingDetailProps = {
  listing: Listing;
};

export function ListingDetail({ listing }: ListingDetailProps) {
  const auctionStatus = getDisplayAuctionStatus(listing);
  const reserveLabel = getReservePublicLabel(listing);

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <ListingImageGallery
        images={listing.image_urls ?? []}
        title={listing.title}
      />

      <div className="flex flex-col gap-6 p-6 lg:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
            {listing.title}
          </h1>
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-600">
            {listing.condition}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <AuctionTimingBadge listing={listing} />
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-600">
            {LISTING_TYPE_LABELS[listing.listing_type ?? "auction"]}
          </span>
        </div>

        <p className="whitespace-pre-wrap text-base leading-7 text-zinc-600">
          {listing.description}
        </p>

        <dl className="grid gap-4 border-t border-zinc-100 pt-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-zinc-500">Starting bid</dt>
            <dd className="mt-1 text-lg font-semibold text-zinc-900">
              {formatPrice(getStartingBid(listing))}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-zinc-500">Current bid</dt>
            <dd className="mt-1 text-lg font-semibold text-zinc-900">
              {auctionStatus === "scheduled"
                ? "Not started"
                : formatPrice(listing.current_price)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-zinc-500">Reserve</dt>
            <dd className="mt-1 text-base text-zinc-900">{reserveLabel}</dd>
          </div>
          {listing.bid_increment != null ? (
            <div>
              <dt className="text-sm font-medium text-zinc-500">Bid increment</dt>
              <dd className="mt-1 text-base text-zinc-900">
                {formatPrice(listing.bid_increment)}
              </dd>
            </div>
          ) : null}
          {listing.buy_it_now_price != null ? (
            <div>
              <dt className="text-sm font-medium text-zinc-500">Buy It Now</dt>
              <dd className="mt-1 text-base text-zinc-900">
                {formatPrice(listing.buy_it_now_price)}
              </dd>
            </div>
          ) : null}
          <div>
            <dt className="text-sm font-medium text-zinc-500">Seller</dt>
            <dd className="mt-1 text-base text-zinc-900">
              {formatSellerLabel(listing.seller_username)}
            </dd>
          </div>
          {listing.scheduled_start_time ? (
            <div>
              <dt className="text-sm font-medium text-zinc-500">Starts</dt>
              <dd className="mt-1 text-base text-zinc-900">
                {formatDateTime(listing.scheduled_start_time)}
              </dd>
            </div>
          ) : null}
          {listing.end_time ? (
            <div>
              <dt className="text-sm font-medium text-zinc-500">Ends</dt>
              <dd className="mt-1 text-base text-zinc-900">
                {formatDateTime(listing.end_time)}
              </dd>
            </div>
          ) : null}
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-zinc-500">Listed</dt>
            <dd className="mt-1 text-base text-zinc-900">
              {formatListedDate(listing.created_at)}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
