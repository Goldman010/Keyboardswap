import { HeaderSkeleton } from "@/components/HeaderSkeleton";

export default function ListingLoading() {
  return (
    <div className="min-h-full bg-zinc-50">
      <HeaderSkeleton />

      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-6 h-5 w-32 animate-pulse rounded bg-zinc-100" />

        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
          <div className="aspect-[16/10] animate-pulse bg-zinc-100 lg:aspect-[21/9]" />
          <div className="flex gap-2 px-6 pt-3 lg:px-8">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="aspect-[4/3] w-20 shrink-0 animate-pulse rounded-lg bg-zinc-100 sm:w-24"
              />
            ))}
          </div>
          <div className="flex flex-col gap-6 p-6 lg:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="h-9 w-2/3 animate-pulse rounded bg-zinc-100" />
              <div className="h-7 w-20 animate-pulse rounded-full bg-zinc-100" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-zinc-100" />
              <div className="h-4 w-full animate-pulse rounded bg-zinc-100" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-100" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
