import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SubmitContent } from "@/components/SubmitContent";

export default function SubmitPage() {
  return (
    <div className="min-h-full bg-zinc-50">
      <SiteHeader maxWidth="max-w-3xl" />

      <main className="mx-auto max-w-3xl px-6 py-10">
        <Link
          href="/listings"
          className="mb-6 inline-block text-sm font-medium text-zinc-600 hover:text-zinc-900"
        >
          ← Back to listings
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
            Submit a listing
          </h1>
          <p className="mt-2 text-zinc-600">
            Fill in the details below. Your listing will be reviewed before it
            goes live.
          </p>
        </div>

        <SubmitContent />
      </main>
    </div>
  );
}
