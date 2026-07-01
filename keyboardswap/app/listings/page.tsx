import { EmptyListings, ListingCard } from "@/components/ListingCard";
import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/lib/supabaseClient";
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
      <SiteHeader
        subtitle="Mechanical keyboard marketplace"
        showSubmitLink
      />

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
            Browse listings
          </h1>
          <p className="mt-2 text-zinc-600">
            Approved keyboards from the community, newest first.
          </p>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
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
      </main>
    </div>
  );
}
