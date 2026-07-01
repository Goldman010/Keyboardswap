import Link from "next/link";
import { notFound } from "next/navigation";
import { ListingDetail } from "@/components/ListingDetail";
import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/lib/supabaseClient";
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
        <SiteHeader maxWidth="max-w-4xl" showSubmitLink />

        <main className="mx-auto max-w-4xl px-6 py-10">
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Could not load listing: {error.message}
          </div>
        </main>
      </div>
    );
  }

  if (!data) {
    notFound();
  }

  const listing = data as Listing;

  return (
    <div className="min-h-full bg-zinc-50">
      <SiteHeader maxWidth="max-w-4xl" showSubmitLink />

      <main className="mx-auto max-w-4xl px-6 py-10">
        <Link
          href="/listings"
          className="mb-6 inline-block text-sm font-medium text-zinc-600 hover:text-zinc-900"
        >
          ← Back to listings
        </Link>

        <ListingDetail listing={listing} />
      </main>
    </div>
  );
}
