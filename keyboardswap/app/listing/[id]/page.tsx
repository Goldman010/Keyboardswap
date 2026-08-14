import Link from "next/link";
import { notFound } from "next/navigation";
import { ListingDetail } from "@/components/ListingDetail";
import { PageContainer } from "@/components/PageContainer";
import { SiteHeader } from "@/components/SiteHeader";
import { isListingEnded } from "@/lib/auction";
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

  // Trigger order creation for ended listings. finalize_auction is idempotent
  // (UNIQUE on listing_id) and SECURITY DEFINER. Its return value contains no
  // private identifiers and is intentionally discarded here — buyer/seller
  // discover their order client-side via get_my_order_for_listing (authenticated).
  if (isListingEnded(listing)) {
    await supabase.rpc("finalize_auction", { p_listing_id: id });
  }

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
