import Link from "next/link";
import { cardClass, pageDescriptionClass, primaryButtonClass } from "@/lib/ui";

export function HomeHero() {
  return (
    <section className="mb-12">
      <div className="mb-10">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
          Buy and sell custom mechanical keyboards
        </h1>
        <p className={`${pageDescriptionClass} max-w-2xl text-lg`}>
          KeyboardSwap is a curated marketplace for enthusiast keyboards —
          inspired by clean auction-style listings, built for the community.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <article className={cardClass}>
          <h2 className="text-lg font-semibold text-zinc-900">
            Browse keyboards
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Explore approved listings from sellers across the community.
          </p>
          <Link href="/listings" className={`${primaryButtonClass} mt-4 inline-block`}>
            Browse listings
          </Link>
        </article>

        <article className={cardClass}>
          <h2 className="text-lg font-semibold text-zinc-900">
            Sell your keyboard
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Submit photos and details to list your board for sale.
          </p>
          <Link href="/submit" className={`${primaryButtonClass} mt-4 inline-block`}>
            Sell a keyboard
          </Link>
        </article>

        <article className={cardClass}>
          <h2 className="text-lg font-semibold text-zinc-900">
            Reviewed before going live
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Every listing is checked before it appears on the marketplace —
            so buyers can shop with confidence.
          </p>
        </article>
      </div>
    </section>
  );
}
