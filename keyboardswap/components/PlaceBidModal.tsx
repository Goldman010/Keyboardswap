"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { formatPrice } from "@/lib/formatListing";
import { getMinimumBid, placeBid } from "@/lib/placeBid";
import {
  alertErrorClass,
  formInputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/lib/ui";
import type { Listing } from "@/lib/types/listing";

type PlaceBidModalProps = {
  listing: Listing;
  isOpen: boolean;
  onClose: () => void;
  /** Called after a successful bid so the parent can refresh listing data. */
  onSuccess: () => void;
};

// Outer gate: returning null unmounts the inner component, giving it fresh
// state every time the modal opens — avoids resetting state inside an effect.
export function PlaceBidModal(props: PlaceBidModalProps) {
  if (!props.isOpen) return null;
  return <BidModalContent {...props} />;
}

type SessionState =
  | { status: "loading" }
  | { status: "logged_out" }
  | { status: "logged_in"; userId: string };

function BidModalContent({ listing, onClose, onSuccess }: PlaceBidModalProps) {
  const minimumBid = getMinimumBid(listing);

  const [session, setSession] = useState<SessionState>({ status: "loading" });
  const [amount, setAmount] = useState(String(minimumBid));
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isOwnListing =
    session.status === "logged_in" && session.userId === listing.seller_id;

  // Load the current session once on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const userId = data.session?.user.id;
      setSession(
        userId ? { status: "logged_in", userId } : { status: "logged_out" },
      );
    });
  }, []);

  // Focus amount input once the form is ready
  useEffect(() => {
    if (session.status === "logged_in" && !isOwnListing) {
      inputRef.current?.focus();
    }
  }, [session.status, isOwnListing]);

  const handleClose = useCallback(() => {
    if (!isSubmitting) onClose();
  }, [isSubmitting, onClose]);

  // Escape key
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
    if (!Number.isFinite(parsed) || parsed < minimumBid) {
      setError(`Minimum bid is ${formatPrice(minimumBid)}.`);
      return;
    }

    setIsSubmitting(true);
    const result = await placeBid(listing.id, parsed);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    onSuccess();
  }

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
        aria-labelledby="bid-modal-title"
        className="relative w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-lg"
      >
        <h2
          id="bid-modal-title"
          className="text-lg font-semibold text-zinc-900"
        >
          Place Bid
        </h2>

        {/* Loading session */}
        {session.status === "loading" && (
          <p className="mt-4 text-sm text-zinc-400">Checking session…</p>
        )}

        {/* Not logged in */}
        {session.status === "logged_out" && (
          <div className="mt-4 flex flex-col gap-4">
            <p className="text-sm text-zinc-600">
              You must be logged in to place a bid.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className={secondaryButtonClass}
              >
                Cancel
              </button>
              <Link
                href="/login"
                onClick={onClose}
                className={primaryButtonClass}
              >
                Log in
              </Link>
            </div>
          </div>
        )}

        {/* Own listing */}
        {session.status === "logged_in" && isOwnListing && (
          <div className="mt-4 flex flex-col gap-4">
            <p className="text-sm text-zinc-600">
              You cannot bid on your own listing.
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className={secondaryButtonClass}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Bid form */}
        {session.status === "logged_in" && !isOwnListing && (
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
            {/* Current bid / minimum summary */}
            <div className="divide-y divide-zinc-100 rounded-lg bg-zinc-50 text-sm">
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-zinc-500">Current bid</span>
                <span className="font-medium text-zinc-900">
                  {formatPrice(listing.current_price)}
                </span>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-zinc-500">Minimum bid</span>
                <span className="font-semibold text-zinc-900">
                  {formatPrice(minimumBid)}
                </span>
              </div>
            </div>

            <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
              Your bid (USD)
              <input
                ref={inputRef}
                type="number"
                step="0.01"
                min={minimumBid}
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

            {/* Binding bid acknowledgement */}
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-zinc-200 p-3 text-sm text-zinc-700 hover:bg-zinc-50">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                disabled={isSubmitting}
                className="mt-0.5 h-4 w-4 shrink-0 accent-zinc-900"
              />
              I understand this bid is binding if I win.
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
                {isSubmitting ? "Confirming…" : "Confirm Bid"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
