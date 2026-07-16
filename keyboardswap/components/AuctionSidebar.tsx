"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getDisplayAuctionStatus,
  getReservePublicLabel,
  getStartingBid,
  parseDate,
} from "@/lib/auction";
import { formatDateTime, formatPrice } from "@/lib/formatListing";
import { alertSuccessClass, cardClass } from "@/lib/ui";
import type { Listing } from "@/lib/types/listing";
import { PlaceBidModal } from "@/components/PlaceBidModal";

type AuctionSidebarProps = {
  listing: Listing;
  bidCount: number;
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

export function AuctionSidebar({ listing, bidCount }: AuctionSidebarProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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

  function handleBidSuccess() {
    setModalOpen(false);
    setSuccessMsg("Your bid was placed successfully.");
    router.refresh();
  }

  // Auto-clear success banner after 5 s
  useEffect(() => {
    if (!successMsg) return;
    const id = setTimeout(() => setSuccessMsg(null), 5000);
    return () => clearTimeout(id);
  }, [successMsg]);

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
          <AuctionStatusBadge
            status={auctionStatus}
            isExtended={listing.is_extended}
            timeLeft={timeLeft}
          />

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

        {/* Success banner */}
        {successMsg && <p className={alertSuccessClass}>{successMsg}</p>}

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
          <SidebarRow label="Bids" value={String(bidCount)} />
          <SidebarRow label="Watchers" value="—" />
        </dl>
      </aside>

      <PlaceBidModal
        listing={listing}
        isOpen={modalOpen}
        onClose={closeModal}
        onSuccess={handleBidSuccess}
      />
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

const ENDING_SOON_MS = 2 * 60 * 1000; // 2 minutes

function AuctionStatusBadge({
  status,
  isExtended,
  timeLeft,
}: {
  status: "scheduled" | "live" | "ended";
  isExtended: boolean;
  timeLeft: number | null;
}) {
  if (status === "live") {
    // Extended takes precedence over Ending Soon
    if (isExtended) {
      return (
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          Extended
        </span>
      );
    }

    if (timeLeft !== null && timeLeft <= ENDING_SOON_MS) {
      return (
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
          <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
          Ending Soon
        </span>
      );
    }

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
