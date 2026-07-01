"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ListingPlaceholderImage } from "@/components/ListingPlaceholderImage";
import { formatListedDate, formatPrice, formatSellerLabel } from "@/lib/formatListing";
import { supabase } from "@/lib/supabaseClient";
import type { Listing } from "@/lib/types/listing";

type AdminPendingListingRowProps = {
  listing: Listing;
};

export function AdminPendingListingRow({ listing }: AdminPendingListingRowProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  async function updateStatus(status: "approved" | "rejected") {
    setError(null);
    setIsUpdating(true);

    const { error: updateError } = await supabase
      .from("listings")
      .update({ status })
      .eq("id", listing.id)
      .eq("status", "pending");

    setIsUpdating(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.refresh();
  }

  return (
    <article className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
        <div className="w-full shrink-0 sm:w-40">
          <ListingPlaceholderImage
            src={listing.image_urls?.[0]}
            alt={listing.title}
            aspectClass="aspect-[4/3]"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="text-lg font-semibold text-zinc-900">{listing.title}</h2>
            <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
              {listing.condition}
            </span>
          </div>

          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-zinc-500">Seller</dt>
              <dd className="font-medium text-zinc-900">
                {formatSellerLabel(listing.seller_username)}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">Price</dt>
              <dd className="font-medium text-zinc-900">
                {formatPrice(listing.current_price)}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-zinc-500">Submitted</dt>
              <dd className="font-medium text-zinc-900">
                {formatListedDate(listing.created_at)}
              </dd>
            </div>
          </dl>

          {error ? (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => updateStatus("approved")}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Approve
            </button>
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => updateStatus("rejected")}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
