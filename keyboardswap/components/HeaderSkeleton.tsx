export function HeaderSkeleton() {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div className="h-6 w-32 animate-pulse rounded bg-zinc-100" />
        <div className="flex gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-4 w-16 animate-pulse rounded bg-zinc-100"
            />
          ))}
        </div>
        <div className="h-9 w-24 animate-pulse rounded-lg bg-zinc-100" />
      </div>
    </header>
  );
}
