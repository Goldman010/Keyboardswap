import type { Listing } from "@/lib/types/listing";
import { LISTING_TYPE_LABELS } from "@/lib/auction";
import { formatListedDate, formatPrice, formatSellerLabel } from "@/lib/formatListing";
import { AuctionSidebar } from "@/components/AuctionSidebar";
import { ListingImageGallery } from "@/components/ListingImageGallery";

type ListingDetailProps = {
  listing: Listing;
};

export function ListingDetail({ listing }: ListingDetailProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Title + meta badges */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          {listing.title}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-600">
            {listing.condition}
          </span>
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-600">
            {LISTING_TYPE_LABELS[listing.listing_type ?? "auction"]}
          </span>
        </div>
      </div>

      {/* Two-column: gallery (left) + auction sidebar (right) */}
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <ListingImageGallery
          images={listing.image_urls ?? []}
          title={listing.title}
        />
        <AuctionSidebar listing={listing} />
      </div>

      {/* Description + listing details */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-zinc-900">Description</h2>
        <p className="mt-3 whitespace-pre-wrap text-base leading-7 text-zinc-600">
          {listing.description}
        </p>

        <dl className="mt-6 grid gap-4 border-t border-zinc-100 pt-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-zinc-500">Seller</dt>
            <dd className="mt-1 text-base text-zinc-900">
              {formatSellerLabel(listing.seller_username)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-zinc-500">Listed</dt>
            <dd className="mt-1 text-base text-zinc-900">
              {formatListedDate(listing.created_at)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-zinc-500">Starting Bid</dt>
            <dd className="mt-1 text-base text-zinc-900">
              {formatPrice(listing.starting_bid ?? listing.starting_price)}
            </dd>
          </div>
          {listing.buy_it_now_price != null && (
            <div>
              <dt className="text-sm font-medium text-zinc-500">Buy It Now</dt>
              <dd className="mt-1 text-base text-zinc-900">
                {formatPrice(listing.buy_it_now_price)}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
