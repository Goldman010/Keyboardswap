"use client";

import { useMemo, useState } from "react";
import { ListingCard } from "@/components/ListingCard";
import type { Listing } from "@/lib/types/listing";
import {
  cardClass,
  formInputClass,
  formLabelClass,
  secondaryButtonClass,
} from "@/lib/ui";

const LISTING_CONDITIONS = [
  "New",
  "Like New",
  "Excellent",
  "Good",
  "Fair",
  "For Parts",
] as const;

type ListingsBrowseProps = {
  listings: Listing[];
};

function parsePrice(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}

function matchesSearch(listing: Listing, query: string): boolean {
  if (!query) {
    return true;
  }

  const normalized = query.toLowerCase();
  return (
    listing.title.toLowerCase().includes(normalized) ||
    listing.description.toLowerCase().includes(normalized)
  );
}

export function ListingsBrowse({ listings }: ListingsBrowseProps) {
  const [search, setSearch] = useState("");
  const [condition, setCondition] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const hasActiveFilters =
    search.trim() !== "" ||
    condition !== "" ||
    minPrice.trim() !== "" ||
    maxPrice.trim() !== "";

  const filteredListings = useMemo(() => {
    const searchQuery = search.trim();
    const min = parsePrice(minPrice);
    const max = parsePrice(maxPrice);

    return listings.filter((listing) => {
      if (!matchesSearch(listing, searchQuery)) {
        return false;
      }

      if (condition && listing.condition !== condition) {
        return false;
      }

      if (min !== null && listing.current_price < min) {
        return false;
      }

      if (max !== null && listing.current_price > max) {
        return false;
      }

      return true;
    });
  }, [listings, search, condition, minPrice, maxPrice]);

  function clearFilters() {
    setSearch("");
    setCondition("");
    setMinPrice("");
    setMaxPrice("");
  }

  return (
    <>
      <div className={`${cardClass} mb-8`}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className={`${formLabelClass} sm:col-span-2 lg:col-span-4`}>
            Search
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search title or description..."
              className={formInputClass}
            />
          </label>

          <label className={formLabelClass}>
            Condition
            <select
              value={condition}
              onChange={(event) => setCondition(event.target.value)}
              className={formInputClass}
            >
              <option value="">All conditions</option>
              {LISTING_CONDITIONS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>

          <label className={formLabelClass}>
            Min price (USD)
            <input
              type="number"
              min={0}
              step="0.01"
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              placeholder="Any"
              className={formInputClass}
            />
          </label>

          <label className={formLabelClass}>
            Max price (USD)
            <input
              type="number"
              min={0}
              step="0.01"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              placeholder="Any"
              className={formInputClass}
            />
          </label>
        </div>

        {hasActiveFilters ? (
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={clearFilters}
              className={secondaryButtonClass}
            >
              Clear filters
            </button>
          </div>
        ) : null}
      </div>

      {filteredListings.length === 0 && hasActiveFilters ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-12 text-center">
          <p className="text-zinc-600">
            No listings match your search or filters.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className={`${secondaryButtonClass} mt-4`}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </>
  );
}
