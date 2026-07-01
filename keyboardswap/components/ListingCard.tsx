import Link from "next/link";
import type { Listing } from "@/lib/types/listing";
import { formatListedDate, formatPrice } from "@/lib/formatListing";
import { ListingPlaceholderImage } from "@/components/ListingPlaceholderImage";

type ListingCardProps = {
  listing: Listing;
};

type EmptyListingsProps = {
  message?: string;
  action?: { href: string; label: string } | null;
};

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group block overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:border-zinc-300 hover:shadow-md"
    >
      <ListingPlaceholderImage
        src={listing.image_urls?.[0]}
        alt={listing.title}
        aspectClass="aspect-[4/3]"
      />

      <article className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold text-zinc-900 group-hover:text-zinc-700">
            {listing.title}
          </h2>
          <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
            {listing.condition}
          </span>
        </div>

        <p className="text-sm text-zinc-500">
          Listed {formatListedDate(listing.created_at)}
        </p>

        <div className="mt-auto flex items-center justify-between gap-4 border-t border-zinc-100 pt-4 text-sm">
          <span className="text-zinc-500">@{listing.seller_username}</span>
          <span className="text-base font-semibold text-zinc-900">
            {formatPrice(listing.current_price)}
          </span>
        </div>
      </article>
    </Link>
  );
}

export function EmptyListings({
  message = "No approved listings yet.",
  action = { href: "/submit", label: "List the first keyboard" },
}: EmptyListingsProps = {}) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-12 text-center">
      <p className="text-zinc-600">{message}</p>
      {action ? (
        <Link
          href={action.href}
          className="mt-4 inline-block text-sm font-medium text-zinc-900 underline underline-offset-4"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
