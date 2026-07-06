import type { Listing } from "@/lib/types/listing";
import { LISTING_TYPE_LABELS } from "@/lib/auction";
import { AuctionSidebar } from "@/components/AuctionSidebar";
import { ListingDetailTabs } from "@/components/ListingDetailTabs";
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

      {/* Two-column: gallery (left) + sticky auction sidebar (right) */}
      <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
        <ListingImageGallery
          images={listing.image_urls ?? []}
          title={listing.title}
        />
        <AuctionSidebar listing={listing} />
      </div>

      {/* Details / Bid History / Questions tabs */}
      <ListingDetailTabs listing={listing} />
    </div>
  );
}
