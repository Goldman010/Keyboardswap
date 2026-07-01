import Link from "next/link";
import { HomeHero } from "@/components/HomeHero";
import { EmptyListings, ListingCard } from "@/components/ListingCard";
import { PageContainer } from "@/components/PageContainer";
import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/lib/supabaseClient";
import {
  alertErrorClass,
  alertSuccessClass,
  pageDescriptionClass,
  pageTitleClass,
  primaryButtonClass,
} from "@/lib/ui";
import type { Listing } from "@/lib/types/listing";

type HomeProps = {
  searchParams: Promise<{ submitted?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(3);

  const listings = (data ?? []) as Listing[];

  return (
    <div className="min-h-full bg-zinc-50">
      <SiteHeader />

      <PageContainer>
        {params.submitted === "1" ? (
          <div className={`${alertSuccessClass} mb-6`}>
            Listing submitted. It will appear here once approved.
          </div>
        ) : null}

        <HomeHero />

        <section>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className={pageTitleClass}>Latest listings</h2>
              <p className={pageDescriptionClass}>
                The newest approved keyboards on KeyboardSwap.
              </p>
            </div>
            <Link href="/listings" className={primaryButtonClass}>
              Browse all listings
            </Link>
          </div>

          {error ? (
            <div className={alertErrorClass}>
              Could not load listings: {error.message}
            </div>
          ) : listings.length === 0 ? (
            <EmptyListings message="No keyboards are currently listed." />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </section>
      </PageContainer>
    </div>
  );
}
