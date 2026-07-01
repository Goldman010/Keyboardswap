import Link from "next/link";

export default function ListingNotFound() {
  return (
    <div className="min-h-full bg-zinc-50">
      <main className="mx-auto max-w-4xl px-6 py-24 text-center">
        <p className="text-sm font-medium text-zinc-500">404</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
          Listing not found
        </h1>
        <p className="mt-3 text-zinc-600">
          This listing may have been removed or is not yet approved.
        </p>
        <Link
          href="/listings"
          className="mt-8 inline-block text-sm font-medium text-zinc-900 underline underline-offset-4"
        >
          Back to listings
        </Link>
      </main>
    </div>
  );
}
