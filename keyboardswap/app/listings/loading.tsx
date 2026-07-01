import { HeaderSkeleton } from "@/components/HeaderSkeleton";

function ListingCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="aspect-[4/3] animate-pulse bg-zinc-100" />
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="h-5 w-2/3 animate-pulse rounded bg-zinc-100" />
          <div className="h-6 w-16 animate-pulse rounded-full bg-zinc-100" />
        </div>
        <div className="h-4 w-24 animate-pulse rounded bg-zinc-100" />
        <div className="flex items-center justify-between border-t border-zinc-100 pt-4">
          <div className="h-4 w-20 animate-pulse rounded bg-zinc-100" />
          <div className="h-5 w-16 animate-pulse rounded bg-zinc-100" />
        </div>
      </div>
    </div>
  );
}

export default function ListingsLoading() {
  return (
    <div className="min-h-full bg-zinc-50">
      <HeaderSkeleton />

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <div className="h-9 w-48 animate-pulse rounded bg-zinc-100" />
          <div className="mt-2 h-5 w-72 animate-pulse rounded bg-zinc-100" />
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <ListingCardSkeleton key={index} />
          ))}
        </div>
      </main>
    </div>
  );
}
