export default function ListingLoading() {
  return (
    <div className="min-h-full bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="h-6 w-32 animate-pulse rounded bg-zinc-100" />
          <div className="h-9 w-36 animate-pulse rounded-lg bg-zinc-100" />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-6 h-5 w-32 animate-pulse rounded bg-zinc-100" />

        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
          <div className="aspect-[16/10] animate-pulse bg-zinc-100 lg:aspect-[21/9]" />
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
            <div className="grid gap-4 border-t border-zinc-100 pt-6 sm:grid-cols-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index}>
                  <div className="h-4 w-24 animate-pulse rounded bg-zinc-100" />
                  <div className="mt-2 h-6 w-32 animate-pulse rounded bg-zinc-100" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
