import { EmptyListings, ListingCard } from "@/components/ListingCard";
import { PageContainer } from "@/components/PageContainer";
import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/lib/supabaseClient";
import {
  alertErrorClass,
  pageDescriptionClass,
  pageTitleClass,
} from "@/lib/ui";
import type { Listing } from "@/lib/types/listing";

export default async function ListingsPage() {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  const listings = (data ?? []) as Listing[];

  return (
    <div className="min-h-full bg-zinc-50">
      <SiteHeader />

      <PageContainer>
        <div className="mb-8">
          <h1 className={pageTitleClass}>Browse listings</h1>
          <p className={pageDescriptionClass}>
            Approved keyboards from the community, newest first.
          </p>
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
      </PageContainer>
    </div>
  );
}
