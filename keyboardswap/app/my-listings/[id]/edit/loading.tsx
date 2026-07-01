import { HeaderSkeleton } from "@/components/HeaderSkeleton";

export default function EditListingLoading() {
  return (
    <div className="min-h-full bg-zinc-50">
      <HeaderSkeleton />

      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-6 h-5 w-40 animate-pulse rounded bg-zinc-100" />
        <div className="mb-8">
          <div className="h-9 w-48 animate-pulse rounded bg-zinc-100" />
          <div className="mt-2 h-5 w-full animate-pulse rounded bg-zinc-100" />
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="space-y-5">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index}>
                <div className="mb-2 h-4 w-20 animate-pulse rounded bg-zinc-100" />
                <div className="h-10 w-full animate-pulse rounded-lg bg-zinc-100" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
