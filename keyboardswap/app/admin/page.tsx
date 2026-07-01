import Link from "next/link";
import { AdminPendingListingRow } from "@/components/AdminPendingListingRow";
import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/lib/supabaseClient";
import type { Listing } from "@/lib/types/listing";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const listings = (data ?? []) as Listing[];

  return (
    <div className="min-h-full bg-zinc-50">
      <SiteHeader maxWidth="max-w-4xl" subtitle="Admin" />

      <main className="mx-auto max-w-4xl px-6 py-10">
        <Link
          href="/listings"
          className="mb-6 inline-block text-sm font-medium text-zinc-600 hover:text-zinc-900"
        >
          View listings
        </Link>
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Temporary admin page — auth required before launch.
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
            Pending listings
          </h1>
          <p className="mt-2 text-zinc-600">
            Review submissions and approve or reject them.
          </p>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Could not load pending listings: {error.message}
          </div>
        ) : listings.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-12 text-center">
            <p className="text-zinc-600">No pending listings to review.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-5">
            {listings.map((listing) => (
              <li key={listing.id}>
                <AdminPendingListingRow listing={listing} />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
