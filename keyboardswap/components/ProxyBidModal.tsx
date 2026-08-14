"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { formatPrice } from "@/lib/formatListing";
import { placeProxyBid } from "@/lib/placeProxyBid";
import {
  alertErrorClass,
  formInputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/lib/ui";
import type { Listing } from "@/lib/types/listing";
import type { MyProxyBid } from "@/lib/types/proxy-bid";

type ProxyBidModalProps = {
  listing: Listing;
  /** The caller's existing proxy, if any. */
  currentProxy: MyProxyBid | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

// Outer gate: returning null unmounts the inner component so it gets
// fresh state every time the modal opens.
export function ProxyBidModal(props: ProxyBidModalProps) {
  if (!props.isOpen) return null;
  return <ProxyBidContent {...props} />;
}

function ProxyBidContent({
  listing,
  currentProxy,
  onClose,
  onSuccess,
}: ProxyBidModalProps) {
  const isRaise = currentProxy !== null;
  const minAmount = isRaise
    ? currentProxy.max_amount + 1
    : Math.max(
        listing.current_price + (listing.bid_increment ?? 1),
        listing.starting_bid ?? listing.starting_price,
      );

  const [amount, setAmount] = useState(String(minAmount));
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleClose = useCallback(() => {
    if (!isSubmitting) onClose();
  }, [isSubmitting, onClose]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [handleClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = Number(amount);

    if (!Number.isFinite(parsed)) {
      setError("Please enter a valid amount.");
      return;
    }

    if (isRaise && parsed <= currentProxy.max_amount) {
      setError(
        `New maximum must be above your current maximum of ${formatPrice(currentProxy.max_amount)}.`,
      );
      return;
    }

    if (!isRaise && parsed < minAmount) {
      setError(`Minimum proxy maximum is ${formatPrice(minAmount)}.`);
      return;
    }

    setIsSubmitting(true);
    const result = await placeProxyBid(listing.id, parsed);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    onSuccess();
  }

  const title = isRaise ? "Raise Max Bid" : "Set Max Bid";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-zinc-900/50"
        onClick={handleClose}
        disabled={isSubmitting}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="proxy-modal-title"
        className="relative w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-lg"
      >
        <h2
          id="proxy-modal-title"
          className="text-lg font-semibold text-zinc-900"
        >
          {title}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          We&apos;ll automatically bid for you up to your maximum. Your limit
          stays private.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          {/* Summary rows */}
          <div className="divide-y divide-zinc-100 rounded-lg bg-zinc-50 text-sm">
            <div className="flex items-center justify-between px-4 py-2.5">
              <span className="text-zinc-500">Current bid</span>
              <span className="font-medium text-zinc-900">
                {formatPrice(listing.current_price)}
              </span>
            </div>
            {isRaise && (
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-zinc-500">Your current maximum</span>
                <span className="font-medium text-zinc-900">
                  {formatPrice(currentProxy.max_amount)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between px-4 py-2.5">
              <span className="text-zinc-500">
                {isRaise ? "New minimum" : "Minimum maximum"}
              </span>
              <span className="font-semibold text-zinc-900">
                {formatPrice(minAmount)}
              </span>
            </div>
          </div>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
            {isRaise ? "New maximum (USD)" : "Your maximum (USD)"}
            <input
              ref={inputRef}
              type="number"
              step="0.01"
              min={minAmount}
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError(null);
              }}
              disabled={isSubmitting}
              className={formInputClass}
            />
          </label>

          {error && <p className={alertErrorClass}>{error}</p>}

          {/* Binding acknowledgement */}
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-zinc-200 p-3 text-sm text-zinc-700 hover:bg-zinc-50">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              disabled={isSubmitting}
              className="mt-0.5 h-4 w-4 shrink-0 accent-zinc-900"
            />
            I understand this is a binding commitment if my proxy wins.
          </label>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className={secondaryButtonClass}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!confirmed || isSubmitting}
              className={`${primaryButtonClass} disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {isSubmitting ? "Saving…" : isRaise ? "Raise Max Bid" : "Set Max Bid"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
