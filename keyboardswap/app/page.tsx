import { EmptyListings, ListingCard } from "@/components/ListingCard";
import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/lib/supabaseClient";
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
    .order("created_at", { ascending: false });

  const listings = (data ?? []) as Listing[];

  return (
    <div className="min-h-full bg-zinc-50">
      <SiteHeader
        subtitle="Mechanical keyboard marketplace"
        showSubmitLink
      />

      <main className="mx-auto max-w-6xl px-6 py-10">
        {params.submitted === "1" ? (
          <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Listing submitted. It will appear here once approved.
          </div>
        ) : null}

        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
            Listings
          </h1>
          <p className="mt-2 text-zinc-600">
            Browse approved keyboards from the community.
          </p>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Could not load listings: {error.message}
          </div>
        ) : listings.length === 0 ? (
          <EmptyListings />
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
