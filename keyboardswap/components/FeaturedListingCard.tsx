"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  getDisplayAuctionStatus,
  getReservePublicLabel,
  getStartingBid,
  parseDate,
} from "@/lib/auction";
import { formatBidCount, formatPrice } from "@/lib/formatListing";
import { ListingPlaceholderImage } from "@/components/ListingPlaceholderImage";
import type { Listing } from "@/lib/types/listing";

type FeaturedListingCardProps = {
  listing: Listing;
  bidCount?: number;
};

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

function formatCountdown(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  if (days > 0) return `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
  if (hours > 0) return `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
  return `${pad(minutes)}m ${pad(seconds)}s`;
}

export function FeaturedListingCard({ listing, bidCount = 0 }: FeaturedListingCardProps) {
  const auctionStatus = getDisplayAuctionStatus(listing);
  const endTime = parseDate(listing.end_time);
  const startTime = parseDate(listing.scheduled_start_time);
  const countdownTarget =
    auctionStatus === "live"
      ? endTime
      : auctionStatus === "scheduled"
        ? startTime
        : null;
  const timeLeft = useCountdown(countdownTarget);

  const reserveMet =
    listing.reserve_price != null &&
    listing.current_price >= listing.reserve_price;
  const reserveLabel = getReservePublicLabel(listing, { reserveMet });
  const currentBid =
    auctionStatus === "scheduled" ? getStartingBid(listing) : listing.current_price;

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group block overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:border-zinc-300 hover:shadow-md"
    >
      <div className="lg:flex">
        {/* Panoramic image — ~half the height of 16/9 */}
        <div className="min-w-0 lg:flex-1">
          <ListingPlaceholderImage
            src={listing.image_urls?.[0]}
            alt={listing.title}
            aspectClass="aspect-[3/1]"
          />
        </div>

        {/* Info panel */}
        <div className="flex flex-col gap-3 p-5 lg:w-64 lg:shrink-0 lg:border-l lg:border-zinc-100">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-zinc-900 px-2.5 py-1 text-xs font-semibold text-white">
              Featured
            </span>
            {auctionStatus === "live" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Live
              </span>
            )}
            {auctionStatus === "scheduled" && (
              <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800">
                Scheduled
              </span>
            )}
            {auctionStatus === "ended" && (
              <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
                Ended
              </span>
            )}
          </div>

          {/* Title */}
          <h2 className="text-lg font-semibold leading-snug text-zinc-900 group-hover:text-zinc-700">
            {listing.title}
          </h2>

          {/* Current bid */}
          <div>
            <p className="text-xs font-medium text-zinc-500">
              {auctionStatus === "scheduled" ? "Starting Bid" : "Current Bid"}
            </p>
            <p className="mt-0.5 text-2xl font-bold tracking-tight text-zinc-900">
              {formatPrice(currentBid)}
            </p>
          </div>

          {/* Countdown */}
          {timeLeft !== null && timeLeft > 0 && (
            <div className="rounded-lg bg-zinc-50 px-3 py-2">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                {auctionStatus === "live" ? "Time Remaining" : "Starts In"}
              </p>
              <p className="mt-0.5 font-mono text-base font-semibold tabular-nums text-zinc-900">
                {formatCountdown(timeLeft)}
              </p>
            </div>
          )}

          {/* Bid count + reserve */}
          <div className="mt-auto flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-zinc-500">
              {formatBidCount(bidCount)}
            </span>
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">
              {reserveLabel}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
