import Link from "next/link";
import { MyListingsContent } from "@/components/MyListingsContent";
import { SiteHeader } from "@/components/SiteHeader";

export default function MyListingsPage() {
  return (
    <div className="min-h-full bg-zinc-50">
      <SiteHeader
        subtitle="Your listings"
        showSubmitLink
        maxWidth="max-w-6xl"
      />

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
              My listings
            </h1>
            <p className="mt-2 text-zinc-600">
              Track pending, approved, rejected, and sold submissions.
            </p>
          </div>
          <Link
            href="/submit"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
          >
            Submit another listing
          </Link>
        </div>

        <MyListingsContent />
      </main>
    </div>
  );
}
