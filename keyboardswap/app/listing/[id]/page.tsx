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

// Columns explicitly listed so proxy_max_amount is never sent to the client.
const BID_PUBLIC_COLUMNS =
  "id, listing_id, bidder_id, amount, is_proxy_bid, created_at" as const;

export default async function ListingPage({ params }: ListingPageProps) {
  const { id } = await params;

  const [listingResult, bidsResult] = await Promise.all([
    supabase
      .from("listings")
      .select("*")
      .eq("id", id)
      .eq("status", "approved")
      .maybeSingle(),
    supabase
      .from("bids")
      .select(BID_PUBLIC_COLUMNS)
      .eq("listing_id", id)
      .order("created_at", { ascending: false }),
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
