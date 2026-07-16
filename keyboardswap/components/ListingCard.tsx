"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  AuctionTimingBadge,
} from "@/components/AuctionTimingBadge";
import type { Listing } from "@/lib/types/listing";
import {
  getDisplayAuctionStatus,
  getStartingBid,
  parseDate,
} from "@/lib/auction";
import {
  formatBidCount,
  formatListedDate,
  formatPrice,
} from "@/lib/formatListing";
import { ListingPlaceholderImage } from "@/components/ListingPlaceholderImage";

type ListingCardProps = {
  listing: Listing;
  bidCount?: number;
};

type EmptyListingsProps = {
  message?: string;
  action?: { href: string; label: string } | null;
};

// ── Countdown hook ────────────────────────────────────────────────────────────

function useCountdown(targetDate: Date | null): number | null {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const targetTimestamp = targetDate?.getTime() ?? null;

  useEffect(() => {
    if (targetTimestamp === null) return;
    const ts = targetTimestamp;

    function tick() {
      const diff = ts - Date.now();
      setTimeLeft(diff > 0 ? diff : 0);
    }

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetTimestamp]);

  return timeLeft;
}

/** Compact 2-unit format suitable for a card. */
function formatCardCountdown(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");

  if (days > 0) return `${days}d ${pad(hours)}h`;
  if (hours > 0) return `${pad(hours)}h ${pad(minutes)}m`;
  return `${pad(minutes)}m ${pad(seconds)}s`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ListingCard({ listing, bidCount = 0 }: ListingCardProps) {
  const auctionStatus = getDisplayAuctionStatus(listing);
  const displayPrice =
    auctionStatus === "scheduled"
      ? getStartingBid(listing)
      : listing.current_price;

  const endTime = parseDate(listing.end_time);
  const timeLeft = useCountdown(auctionStatus === "live" ? endTime : null);

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group block overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:border-zinc-300 hover:shadow-md"
    >
      <ListingPlaceholderImage
        src={listing.image_urls?.[0]}
        alt={listing.title}
        aspectClass="aspect-[4/3]"
      />

      <article className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold text-zinc-900 group-hover:text-zinc-700">
            {listing.title}
          </h2>
          <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
            {listing.condition}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <AuctionTimingBadge listing={listing} />
          {/* Live countdown: show timer while time remains, then fall back to listed date */}
          {auctionStatus === "live" && timeLeft !== null && timeLeft > 0 ? (
            <span className="font-mono text-sm tabular-nums text-zinc-500">
              {formatCardCountdown(timeLeft)}
            </span>
          ) : (
            <p className="text-sm text-zinc-500">
              Listed {formatListedDate(listing.created_at)}
            </p>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-4 border-t border-zinc-100 pt-4 text-sm">
          <span className="text-zinc-500">
            {auctionStatus === "live" && listing.end_time
              ? `Ends ${formatListedDate(listing.end_time)}`
              : formatListedDate(listing.created_at)}
          </span>
          <div className="flex items-center gap-3">
            <span className="text-zinc-400">{formatBidCount(bidCount)}</span>
            <span className="text-base font-semibold text-zinc-900">
              {auctionStatus === "scheduled" ? (
                <>Starting {formatPrice(displayPrice)}</>
              ) : (
                formatPrice(displayPrice)
              )}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export function EmptyListings({
  message = "No approved listings yet.",
  action = { href: "/submit", label: "List the first keyboard" },
}: EmptyListingsProps = {}) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-12 text-center">
      <p className="text-zinc-600">{message}</p>
      {action ? (
        <Link
          href={action.href}
          className="mt-4 inline-block text-sm font-medium text-zinc-900 underline underline-offset-4"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
