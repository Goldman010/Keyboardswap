import type { Listing } from "@/lib/types/listing";
import {
  formatListedDate,
  formatPrice,
  formatStatus,
} from "@/lib/formatListing";
import { ListingPlaceholderImage } from "@/components/ListingPlaceholderImage";

type ListingDetailProps = {
  listing: Listing;
};

export function ListingDetail({ listing }: ListingDetailProps) {
  const images = listing.image_urls ?? [];

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      {images.length > 0 ? (
        <div
          className={
            images.length === 1
              ? "grid"
              : "grid gap-2 sm:grid-cols-2 lg:grid-cols-3"
          }
        >
          {images.map((url, index) => (
            <div
              key={url}
              className={
                index === 0 && images.length > 1
                  ? "sm:col-span-2 lg:col-span-3"
                  : undefined
              }
            >
              <ListingPlaceholderImage
                src={url}
                alt={`${listing.title} — photo ${index + 1}`}
                aspectClass={
                  index === 0 && images.length > 1
                    ? "aspect-[16/10] lg:aspect-[21/9]"
                    : "aspect-[4/3]"
                }
              />
            </div>
          ))}
        </div>
      ) : (
        <ListingPlaceholderImage aspectClass="aspect-[16/10] lg:aspect-[21/9]" />
      )}

      <div className="flex flex-col gap-6 p-6 lg:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
            {listing.title}
          </h1>
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-600">
            {listing.condition}
          </span>
        </div>

        <p className="whitespace-pre-wrap text-base leading-7 text-zinc-600">
          {listing.description}
        </p>

        <dl className="grid gap-4 border-t border-zinc-100 pt-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-zinc-500">Starting price</dt>
            <dd className="mt-1 text-lg font-semibold text-zinc-900">
              {formatPrice(listing.starting_price)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-zinc-500">Current price</dt>
            <dd className="mt-1 text-lg font-semibold text-zinc-900">
              {formatPrice(listing.current_price)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-zinc-500">Seller</dt>
            <dd className="mt-1 text-base text-zinc-900">
              @{listing.seller_username}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-zinc-500">Status</dt>
            <dd className="mt-1 text-base text-zinc-900">
              {formatStatus(listing.status)}
            </dd>
          </div>
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
