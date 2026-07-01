export default function MyListingsLoading() {
  return (
    <div className="min-h-full bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <div className="h-6 w-32 animate-pulse rounded bg-zinc-100" />
            <div className="mt-1 h-4 w-24 animate-pulse rounded bg-zinc-100" />
          </div>
          <div className="h-9 w-36 animate-pulse rounded-lg bg-zinc-100" />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <div className="h-9 w-48 animate-pulse rounded bg-zinc-100" />
            <div className="mt-2 h-5 w-72 animate-pulse rounded bg-zinc-100" />
          </div>
          <div className="h-9 w-44 animate-pulse rounded-lg bg-zinc-100" />
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm"
            >
              <div className="aspect-[4/3] animate-pulse bg-zinc-100" />
              <div className="space-y-3 p-5">
                <div className="h-5 w-2/3 animate-pulse rounded bg-zinc-100" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-zinc-100" />
                <div className="h-5 w-1/3 animate-pulse rounded bg-zinc-100" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
