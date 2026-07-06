"use client";

import { useMemo, useState } from "react";
import { ListingCard } from "@/components/ListingCard";
import { getDisplayAuctionStatus, parseDate } from "@/lib/auction";
import type { Listing } from "@/lib/types/listing";
import { formInputClass, secondaryButtonClass } from "@/lib/ui";

// ── Constants ──────────────────────────────────────────────────────────────────

type SortOption = "ending_soon" | "newly_listed" | "no_reserve";

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: "ending_soon", label: "Ending Soon" },
  { id: "newly_listed", label: "Newly Listed" },
  { id: "no_reserve", label: "No Reserve" },
];

const CATEGORY_OPTIONS = [
  { id: "", label: "All" },
  { id: "full_build", label: "Full Builds" },
  { id: "keycaps", label: "Keycaps" },
  { id: "components", label: "Components" },
  { id: "accessories", label: "Accessories" },
] as const;

// ── Sort helpers ───────────────────────────────────────────────────────────────

function sortByEndingSoon(listings: Listing[]): Listing[] {
  return [...listings].sort((a, b) => {
    const statusA = getDisplayAuctionStatus(a);
    const statusB = getDisplayAuctionStatus(b);
    const priority = { live: 0, scheduled: 1, ended: 2 } as const;
    const diff = priority[statusA] - priority[statusB];
    if (diff !== 0) return diff;
    const endA = parseDate(a.end_time);
    const endB = parseDate(b.end_time);
    if (endA && endB) return endA.getTime() - endB.getTime();
    if (endA) return -1;
    if (endB) return 1;
    return 0;
  });
}

function sortListings(listings: Listing[], sort: SortOption): Listing[] {
  switch (sort) {
    case "ending_soon":
      return sortByEndingSoon(listings);
    case "newly_listed":
      return [...listings].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    case "no_reserve":
      return sortByEndingSoon(listings.filter((l) => l.reserve_price == null));
    default:
      return listings;
  }
}

// ── Component ──────────────────────────────────────────────────────────────────

type ListingsBrowseProps = {
  listings: Listing[];
};

export function ListingsBrowse({ listings }: ListingsBrowseProps) {
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState<SortOption>("ending_soon");

  const displayedListings = useMemo(() => {
    const byCat = category
      ? listings.filter((l) => l.category === category)
      : listings;
    return sortListings(byCat, sort);
  }, [listings, category, sort]);

  return (
    <div className="flex flex-col gap-5">
      {/* Control bar: category dropdown (left) + sort pills + count (right) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={`${formInputClass} w-auto`}
          aria-label="Filter by category"
        >
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>

        <div className="flex flex-wrap items-center gap-2">
          {SORT_OPTIONS.map((option) => {
            const isActive = sort === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setSort(option.id)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  isActive
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                {option.label}
              </button>
            );
          })}
          <span className="pl-1 text-sm text-zinc-400">
            {displayedListings.length}{" "}
            {displayedListings.length === 1 ? "listing" : "listings"}
          </span>
        </div>
      </div>

      {/* Grid */}
      {displayedListings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-12 text-center">
          <p className="text-zinc-600">No listings in this category yet.</p>
          {category && (
            <button
              type="button"
              onClick={() => setCategory("")}
              className={`${secondaryButtonClass} mt-4`}
            >
              View all listings
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {displayedListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
