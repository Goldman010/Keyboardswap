"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ListingPlaceholderImage } from "@/components/ListingPlaceholderImage";
import {
  BID_INCREMENTS,
  defaultAuctionEndTime,
  getStartingBid,
  LISTING_TYPES,
  LISTING_TYPE_LABELS,
  listingTypeAllowsBuyItNow,
  parseDatetimeLocalValue,
  toDatetimeLocalValue,
  type ListingType,
} from "@/lib/auction";
import {
  formatListedDate,
  formatPrice,
  formatSellerLabel,
} from "@/lib/formatListing";
import { supabase } from "@/lib/supabaseClient";
import {
  formInputClass,
  formLabelClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/lib/ui";
import type { Listing } from "@/lib/types/listing";

type AdminPendingListingRowProps = {
  listing: Listing;
};

function getDefaultStartTime(): Date {
  const start = new Date();
  start.setMinutes(0, 0, 0);
  start.setHours(start.getHours() + 1);
  return start;
}

export function AdminPendingListingRow({ listing }: AdminPendingListingRowProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [listingType, setListingType] = useState<ListingType>(
    listing.listing_type ?? "auction",
  );
  const [startingBid, setStartingBid] = useState(
    String(getStartingBid(listing)),
  );
  const [reservePrice, setReservePrice] = useState(
    listing.reserve_price != null ? String(listing.reserve_price) : "",
  );
  const [buyItNowPrice, setBuyItNowPrice] = useState(
    listing.buy_it_now_price != null ? String(listing.buy_it_now_price) : "",
  );
  const [bidIncrement, setBidIncrement] = useState("10");
  const [scheduledStart, setScheduledStart] = useState(() =>
    toDatetimeLocalValue(getDefaultStartTime()),
  );
  const [endTime, setEndTime] = useState(() =>
    toDatetimeLocalValue(defaultAuctionEndTime(getDefaultStartTime())),
  );

  function handleStartTimeChange(value: string) {
    setScheduledStart(value);
    const start = parseDatetimeLocalValue(value);
    if (start) {
      setEndTime(toDatetimeLocalValue(defaultAuctionEndTime(start)));
    }
  }

  async function rejectListing() {
    setError(null);
    setIsUpdating(true);

    const { error: updateError } = await supabase
      .from("listings")
      .update({ status: "rejected" })
      .eq("id", listing.id)
      .eq("status", "pending");

    setIsUpdating(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.refresh();
  }

  async function approveAndSchedule(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsUpdating(true);

    const parsedStartingBid = Number(startingBid);
    const parsedReserve = reservePrice.trim()
      ? Number(reservePrice)
      : null;
    const parsedBuyItNow = buyItNowPrice.trim()
      ? Number(buyItNowPrice)
      : null;
    const parsedIncrement = Number(bidIncrement);
    const start = parseDatetimeLocalValue(scheduledStart);
    const end = parseDatetimeLocalValue(endTime);

    if (
      Number.isNaN(parsedStartingBid) ||
      parsedStartingBid < 0 ||
      !start ||
      !end ||
      end <= start
    ) {
      setError("Enter a valid starting bid, start time, and end time.");
      setIsUpdating(false);
      return;
    }

    if (
      listingType !== "buy_it_now" &&
      (Number.isNaN(parsedIncrement) ||
        !BID_INCREMENTS.includes(parsedIncrement as (typeof BID_INCREMENTS)[number]))
    ) {
      setError("Select a valid bid increment.");
      setIsUpdating(false);
      return;
    }

    if (parsedReserve !== null && (Number.isNaN(parsedReserve) || parsedReserve < 0)) {
      setError("Reserve price must be a valid amount.");
      setIsUpdating(false);
      return;
    }

    if (
      parsedBuyItNow !== null &&
      (Number.isNaN(parsedBuyItNow) || parsedBuyItNow < 0)
    ) {
      setError("Buy It Now price must be a valid amount.");
      setIsUpdating(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("listings")
      .update({
        status: "approved",
        listing_type: listingType,
        starting_bid: parsedStartingBid,
        reserve_price: parsedReserve,
        buy_it_now_price: listingTypeAllowsBuyItNow(listingType)
          ? parsedBuyItNow
          : null,
        bid_increment: listingType === "buy_it_now" ? null : parsedIncrement,
        scheduled_start_time: start.toISOString(),
        end_time: end.toISOString(),
        auction_status: "scheduled",
      })
      .eq("id", listing.id)
      .eq("status", "pending");

    setIsUpdating(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.refresh();
  }

  return (
    <article className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
        <div className="w-full shrink-0 sm:w-40">
          <ListingPlaceholderImage
            src={listing.image_urls?.[0]}
            alt={listing.title}
            aspectClass="aspect-[4/3]"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="text-lg font-semibold text-zinc-900">{listing.title}</h2>
            <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
              {listing.condition}
            </span>
          </div>

          <p className="mt-3 line-clamp-3 text-sm text-zinc-600">
            {listing.description}
          </p>

          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-zinc-500">Seller</dt>
              <dd className="font-medium text-zinc-900">
                {formatSellerLabel(listing.seller_username)}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">Submitted price</dt>
              <dd className="font-medium text-zinc-900">
                {formatPrice(listing.starting_price)}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-zinc-500">Submitted</dt>
              <dd className="font-medium text-zinc-900">
                {formatListedDate(listing.created_at)}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <form
        onSubmit={approveAndSchedule}
        className="border-t border-zinc-100 p-5"
      >
        <h3 className="text-sm font-semibold text-zinc-900">
          Approve &amp; schedule auction
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          Set auction details before the listing goes public.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className={formLabelClass}>
            Listing type
            <select
              value={listingType}
              onChange={(event) =>
                setListingType(event.target.value as ListingType)
              }
              className={formInputClass}
            >
              {LISTING_TYPES.map((type) => (
                <option key={type} value={type}>
                  {LISTING_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </label>

          <label className={formLabelClass}>
            Starting bid (USD)
            <input
              type="number"
              min="0"
              step="0.01"
              required
              value={startingBid}
              onChange={(event) => setStartingBid(event.target.value)}
              className={formInputClass}
            />
          </label>

          <label className={formLabelClass}>
            Reserve price (USD, optional)
            <input
              type="number"
              min="0"
              step="0.01"
              value={reservePrice}
              onChange={(event) => setReservePrice(event.target.value)}
              placeholder="No reserve"
              className={formInputClass}
            />
          </label>

          {listingTypeAllowsBuyItNow(listingType) ? (
            <label className={formLabelClass}>
              Buy It Now price (USD, optional)
              <input
                type="number"
                min="0"
                step="0.01"
                value={buyItNowPrice}
                onChange={(event) => setBuyItNowPrice(event.target.value)}
                placeholder="Optional"
                className={formInputClass}
              />
            </label>
          ) : null}

          {listingType !== "buy_it_now" ? (
            <label className={formLabelClass}>
              Bid increment
              <select
                value={bidIncrement}
                onChange={(event) => setBidIncrement(event.target.value)}
                required
                className={formInputClass}
              >
                {BID_INCREMENTS.map((increment) => (
                  <option key={increment} value={increment}>
                    ${increment}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <label className={formLabelClass}>
            Scheduled start
            <input
              type="datetime-local"
              required
              value={scheduledStart}
              onChange={(event) => handleStartTimeChange(event.target.value)}
              className={formInputClass}
            />
          </label>

          <label className={formLabelClass}>
            End time
            <input
              type="datetime-local"
              required
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
              className={formInputClass}
            />
          </label>
        </div>

        {error ? (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={isUpdating}
            className={primaryButtonClass}
          >
            {isUpdating ? "Saving..." : "Approve & schedule"}
          </button>
          <button
            type="button"
            disabled={isUpdating}
            onClick={rejectListing}
            className={secondaryButtonClass}
          >
            Reject
          </button>
        </div>
      </form>
    </article>
  );
}
