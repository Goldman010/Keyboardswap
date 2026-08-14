import Link from "next/link";
import { FeaturedListingCard } from "@/components/FeaturedListingCard";
import { EmptyListings } from "@/components/ListingCard";
import { ListingsBrowse } from "@/components/ListingsBrowse";
import { PageContainer } from "@/components/PageContainer";
import { SiteHeader } from "@/components/SiteHeader";
import { filterBrowsableListings } from "@/lib/auction";
import { supabase } from "@/lib/supabaseClient";
import {
  alertErrorClass,
  alertSuccessClass,
  primaryButtonClass,
} from "@/lib/ui";
import type { Listing } from "@/lib/types/listing";

type HomeProps = {
  searchParams: Promise<{ submitted?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;

  // Fetch all approved listings — active and ended — so the browse
  // component can filter into Active / Sold / Unsold views client-side.
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("status", "approved")
    .order("end_time", { ascending: true, nullsFirst: false });

  const allApproved = (data ?? []) as Listing[];
  const activeListings = filterBrowsableListings(allApproved);

  // Bid counts for every approved listing in one RPC call.
  const bidCounts: Record<string, number> = {};
  const allIds = allApproved.map((l) => l.id);

  if (allIds.length > 0) {
    const { data: bidCountRows } = await supabase.rpc(
      "get_listing_bid_counts",
      { p_listing_ids: allIds },
    );

    for (const row of bidCountRows ?? []) {
      bidCounts[row.listing_id] = Number(row.bid_count);
    }
  }

  // Featured listing is always the first active (non-ended) listing.
  const [featured] = activeListings;

  return (
    <div className="min-h-full bg-zinc-50">
      <SiteHeader />

      <PageContainer>
        {params.submitted === "1" && (
          <div className={`${alertSuccessClass} mb-6`}>
            Listing submitted. It will appear here once approved.
          </div>
        )}

        {/* Page header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
              KeyboardSwap
            </h1>
            <p className="mt-1 text-zinc-600">
              Buy and sell custom mechanical keyboards.
            </p>
          </div>
          <Link href="/submit" className={primaryButtonClass}>
            Sell a keyboard
          </Link>
        </div>

        {error ? (
          <div className={alertErrorClass}>
            Could not load listings: {error.message}
          </div>
        ) : allApproved.length === 0 ? (
          <EmptyListings message="No keyboards are currently listed." />
        ) : (
          <div className="flex flex-col gap-8">
            {/* Featured auction — active listings only */}
            {featured && (
              <section aria-label="Featured auction">
                <FeaturedListingCard
                  listing={featured}
                  bidCount={bidCounts[featured.id] ?? 0}
                />
              </section>
            )}

            {/* Marketplace grid — Active / Sold / Unsold tabs */}
            <section aria-label="All listings">
              <ListingsBrowse listings={allApproved} bidCounts={bidCounts} />
            </section>
          </div>
        )}
      </PageContainer>
    </div>
  );
}
