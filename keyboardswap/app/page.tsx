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

  const [{ data, error }, { data: bidRows }] = await Promise.all([
    supabase
      .from("listings")
      .select("*")
      .eq("status", "approved")
      .order("end_time", { ascending: true, nullsFirst: false }),
    supabase.from("bids").select("listing_id"),
  ]);

  const listings = filterBrowsableListings((data ?? []) as Listing[]);
  const [featured] = listings;

  // Aggregate per-listing bid counts without exposing any bidder data
  const bidCounts = (bidRows ?? []).reduce<Record<string, number>>(
    (acc, row) => {
      acc[row.listing_id] = (acc[row.listing_id] ?? 0) + 1;
      return acc;
    },
    {},
  );

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
        ) : listings.length === 0 ? (
          <EmptyListings message="No keyboards are currently listed." />
        ) : (
          <div className="flex flex-col gap-8">
            {/* Featured auction */}
            {featured && (
              <section aria-label="Featured auction">
                <FeaturedListingCard
                  listing={featured}
                  bidCount={bidCounts[featured.id] ?? 0}
                />
              </section>
            )}

            {/* Marketplace grid */}
            <section aria-label="All listings">
              <ListingsBrowse listings={listings} bidCounts={bidCounts} />
            </section>
          </div>
        )}
      </PageContainer>
    </div>
  );
}
