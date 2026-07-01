import Link from "next/link";
import { EmptyListings, ListingCard } from "@/components/ListingCard";
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
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <Link href="/" className="text-lg font-semibold text-zinc-900">
              KeyboardSwap
            </Link>
            <p className="text-sm text-zinc-500">
              Mechanical keyboard marketplace
            </p>
          </div>
          <Link
            href="/submit"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
          >
            Sell a keyboard
          </Link>
        </div>
      </header>

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
