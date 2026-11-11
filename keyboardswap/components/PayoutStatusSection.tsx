"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { isPayoutReady } from "@/lib/isPayoutReady";
import { cardClass, primaryButtonClass } from "@/lib/ui";
import type { SellerPaymentAccount } from "@/lib/types/seller-payment-account";

type LoadState = "loading" | "unauthenticated" | "loaded";

export function PayoutStatusSection() {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [account, setAccount] = useState<SellerPaymentAccount | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setLoadState("unauthenticated");
        return;
      }

      const { data } = await supabase
        .from("seller_payment_accounts")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      setAccount((data as SellerPaymentAccount | null) ?? null);
      setLoadState("loaded");
    }

    load();
  }, []);

  if (loadState !== "loaded") return null;

  const ready = isPayoutReady(account);
  const hasAccount = !!account?.stripe_account_id;
  const incomplete = hasAccount && !ready;

  async function handleSetup() {
    setIsSubmitting(true);
    setError(null);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setError("Please sign in first.");
      setIsSubmitting(false);
      return;
    }

    const res = await fetch("/api/stripe/connect/create-account", {
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as {
        error?: string;
        detail?: string;
      };
      setError(body.detail ?? body.error ?? "Something went wrong. Please try again.");
      setIsSubmitting(false);
      return;
    }

    const { url } = (await res.json()) as { url: string };
    window.location.href = url;
  }

  return (
    <div className={`${cardClass} mb-6 flex flex-wrap items-center justify-between gap-4`}>
      <div>
        <p className="text-sm font-semibold text-zinc-700">Seller payouts</p>
        <div className="mt-1.5 flex items-center gap-2">
          {ready ? (
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
              Ready for payouts
            </span>
          ) : incomplete ? (
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
              Setup incomplete
            </span>
          ) : (
            <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
              Not set up
            </span>
          )}
        </div>
        {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
      </div>

      {!ready && (
        <button
          type="button"
          onClick={handleSetup}
          disabled={isSubmitting}
          className={`${primaryButtonClass} disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {isSubmitting
            ? "Loading…"
            : incomplete
              ? "Continue setup"
              : "Set up payouts"}
        </button>
      )}
    </div>
  );
}
