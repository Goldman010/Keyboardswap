"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getDisplayAuctionStatus,
  getReservePublicLabel,
  getStartingBid,
  parseDate,
} from "@/lib/auction";
import { formatDateTime, formatPrice } from "@/lib/formatListing";
import { cardClass, secondaryButtonClass } from "@/lib/ui";
import type { Listing } from "@/lib/types/listing";

type AuctionSidebarProps = {
  listing: Listing;
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

  if (days > 0) {
    return `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
  }
  if (hours > 0) {
    return `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
  }
  return `${pad(minutes)}m ${pad(seconds)}s`;
}

export function AuctionSidebar({ listing }: AuctionSidebarProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const auctionStatus = getDisplayAuctionStatus(listing);
  const startTime = parseDate(listing.scheduled_start_time);
  const endTime = parseDate(listing.end_time);

  const countdownTarget =
    auctionStatus === "live"
      ? endTime
      : auctionStatus === "scheduled"
        ? startTime
        : null;

  const timeLeft = useCountdown(countdownTarget);

  const currentBid =
    auctionStatus === "scheduled"
      ? getStartingBid(listing)
      : listing.current_price;

  const reserveMet =
    listing.reserve_price != null &&
    listing.current_price >= listing.reserve_price;
  const reserveLabel = getReservePublicLabel(listing, { reserveMet });

  const closeModal = useCallback(() => setModalOpen(false), []);

  useEffect(() => {
    if (!modalOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeModal();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [modalOpen, closeModal]);

  return (
    <>
      <aside className={`${cardClass} flex flex-col gap-5 lg:sticky lg:top-6`}>
        {/* Current / Starting bid */}
        <div>
          <p className="text-sm font-medium text-zinc-500">
            {auctionStatus === "scheduled" ? "Starting Bid" : "Current Bid"}
          </p>
          <p className="mt-1 text-4xl font-bold tracking-tight text-zinc-900">
            {formatPrice(currentBid)}
          </p>
        </div>

        {/* Status badge + countdown */}
        <div className="flex flex-col gap-3">
          <AuctionStatusBadge status={auctionStatus} />

          {timeLeft !== null && timeLeft > 0 && (
            <div className="rounded-lg bg-zinc-50 p-3 text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                {auctionStatus === "live" ? "Time Remaining" : "Starts In"}
              </p>
              <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-zinc-900">
                {formatCountdown(timeLeft)}
              </p>
            </div>
          )}
        </div>

        {/* CTA button */}
        <BidButton
          status={auctionStatus}
          onPlace={() => setModalOpen(true)}
        />

        {/* Auction detail rows */}
        <dl className="flex flex-col gap-3 border-t border-zinc-100 pt-4 text-sm">
          <SidebarRow label="Reserve" value={reserveLabel} />
          {listing.bid_increment != null && (
            <SidebarRow
              label="Bid Increment"
              value={formatPrice(listing.bid_increment)}
            />
          )}
          {listing.scheduled_start_time && (
            <SidebarRow
              label="Starts"
              value={formatDateTime(listing.scheduled_start_time)}
            />
          )}
          {listing.end_time && (
            <SidebarRow
              label="Ends"
              value={formatDateTime(listing.end_time)}
            />
          )}
          <SidebarRow label="Bids" value="0" />
          <SidebarRow label="Watchers" value="—" />
        </dl>
      </aside>

      {/* Bidding coming soon modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-zinc-900/50"
            onClick={closeModal}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="bid-modal-title"
            className="relative w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-lg"
          >
            <h2
              id="bid-modal-title"
              className="text-lg font-semibold text-zinc-900"
            >
              Bidding Coming Soon
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Bidding is coming soon.
            </p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                className={secondaryButtonClass}
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

type BidButtonProps = {
  status: "scheduled" | "live" | "ended";
  onPlace: () => void;
};

function BidButton({ status, onPlace }: BidButtonProps) {
  if (status === "ended") {
    return (
      <button
        type="button"
        disabled
        className="w-full cursor-not-allowed rounded-lg bg-zinc-200 py-3 text-base font-semibold text-zinc-400"
      >
        Auction Ended
      </button>
    );
  }

  if (status === "scheduled") {
    return (
      <button
        type="button"
        disabled
        className="w-full cursor-not-allowed rounded-lg bg-zinc-200 py-3 text-base font-semibold text-zinc-400"
      >
        Bidding Opens Soon
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onPlace}
      className="w-full rounded-lg bg-zinc-900 py-3 text-base font-semibold text-white transition-colors hover:bg-zinc-700"
    >
      Place Bid
    </button>
  );
}

function AuctionStatusBadge({
  status,
}: {
  status: "scheduled" | "live" | "ended";
}) {
  if (status === "live") {
    return (
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        Live
      </span>
    );
  }

  if (status === "scheduled") {
    return (
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
        Scheduled
      </span>
    );
  }

  return (
    <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-600">
      Ended
    </span>
  );
}

function SidebarRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="font-medium text-zinc-500">{label}</dt>
      <dd className="text-right text-zinc-900">{value}</dd>
    </div>
  );
}
