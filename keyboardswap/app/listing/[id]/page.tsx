import Link from "next/link";
import { notFound } from "next/navigation";
import { ListingDetail } from "@/components/ListingDetail";
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
        <header className="border-b border-zinc-200 bg-white">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-lg font-semibold text-zinc-900">
              KeyboardSwap
            </Link>
          </div>
        </header>

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
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold text-zinc-900">
            KeyboardSwap
          </Link>
          <Link
            href="/submit"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
          >
            Sell a keyboard
          </Link>
        </div>
      </header>

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
