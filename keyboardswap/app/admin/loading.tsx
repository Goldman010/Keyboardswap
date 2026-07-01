import { HeaderSkeleton } from "@/components/HeaderSkeleton";

export default function AdminLoading() {
  return (
    <div className="min-h-full bg-zinc-50">
      <HeaderSkeleton />

      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-6 h-12 animate-pulse rounded-lg bg-amber-50" />

        <div className="mb-8">
          <div className="h-9 w-56 animate-pulse rounded bg-zinc-100" />
          <div className="mt-2 h-5 w-72 animate-pulse rounded bg-zinc-100" />
        </div>

        <ul className="flex flex-col gap-5">
          {Array.from({ length: 3 }).map((_, index) => (
            <li
              key={index}
              className="overflow-hidden rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="aspect-[4/3] w-full animate-pulse rounded-lg bg-zinc-100 sm:w-40" />
                <div className="flex-1 space-y-3">
                  <div className="h-6 w-2/3 animate-pulse rounded bg-zinc-100" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-zinc-100" />
                  <div className="h-4 w-1/3 animate-pulse rounded bg-zinc-100" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
