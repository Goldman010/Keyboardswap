import Link from "next/link";
import { notFound } from "next/navigation";
import { ListingDetail } from "@/components/ListingDetail";
import { PageContainer } from "@/components/PageContainer";
import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/lib/supabaseClient";
import { alertErrorClass, navLinkClass } from "@/lib/ui";
import type { Bid } from "@/lib/types/bid";
import type { Listing } from "@/lib/types/listing";

type ListingPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ListingPage({ params }: ListingPageProps) {
  const { id } = await params;

  const [listingResult, bidsResult] = await Promise.all([
    supabase
      .from("listings")
      .select("*")
      .eq("id", id)
      .eq("status", "approved")
      .maybeSingle(),
    // get_listing_bids returns anonymous bid history (no bidder_id, no proxy_max_amount).
    // Direct SELECT on the bids table is not permitted for anon/authenticated.
    supabase.rpc("get_listing_bids", { p_listing_id: id }),
  ]);

  if (listingResult.error) {
    return (
      <div className="min-h-full bg-zinc-50">
        <SiteHeader />

        <PageContainer maxWidth="max-w-6xl">
          <div className={alertErrorClass}>
            Could not load listing: {listingResult.error.message}
          </div>
        </PageContainer>
      </div>
    );
  }

  if (!listingResult.data) {
    notFound();
  }

  const listing = listingResult.data as Listing;
  const bids = (bidsResult.data ?? []) as Bid[];

  return (
    <div className="min-h-full bg-zinc-50">
      <SiteHeader />

      <PageContainer maxWidth="max-w-6xl">
        <Link href="/listings" className={`${navLinkClass} mb-6 inline-block text-sm`}>
          ← Back to listings
        </Link>

        <ListingDetail listing={listing} bids={bids} />
      </PageContainer>
    </div>
  );
}
