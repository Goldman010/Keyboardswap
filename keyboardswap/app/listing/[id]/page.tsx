import Link from "next/link";
import { notFound } from "next/navigation";
import { ListingDetail } from "@/components/ListingDetail";
import { PageContainer } from "@/components/PageContainer";
import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/lib/supabaseClient";
import { alertErrorClass, navLinkClass } from "@/lib/ui";
import type { Listing } from "@/lib/types/listing";

type ListingPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ListingPage({ params }: ListingPageProps) {
  const { id } = await params;

  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .eq("status", "approved")
    .maybeSingle();

  if (error) {
    return (
      <div className="min-h-full bg-zinc-50">
        <SiteHeader />

        <PageContainer maxWidth="max-w-4xl">
          <div className={alertErrorClass}>
            Could not load listing: {error.message}
          </div>
        </PageContainer>
      </div>
    );
  }

  if (!data) {
    notFound();
  }

  const listing = data as Listing;

  return (
    <div className="min-h-full bg-zinc-50">
      <SiteHeader />

      <PageContainer maxWidth="max-w-4xl">
        <Link href="/listings" className={`${navLinkClass} mb-6 inline-block text-sm`}>
          ← Back to listings
        </Link>

        <ListingDetail listing={listing} />
      </PageContainer>
    </div>
  );
}
