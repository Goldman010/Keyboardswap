"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/formatListing";
import { getMyProxyBid } from "@/lib/placeProxyBid";
import { supabase } from "@/lib/supabaseClient";
import { alertSuccessClass } from "@/lib/ui";
import type { Listing } from "@/lib/types/listing";
import type { MyProxyBid } from "@/lib/types/proxy-bid";
import { ProxyBidModal } from "@/components/ProxyBidModal";

type ProxyBidSectionProps = {
  listing: Listing;
};

type AuthState = "loading" | "unauthenticated" | "authenticated";

export function ProxyBidSection({ listing }: ProxyBidSectionProps) {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>("loading");
  const [userId, setUserId] = useState<string | null>(null);
  const [myProxy, setMyProxy] = useState<MyProxyBid | null | undefined>(
    undefined,
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const id = data.session?.user.id ?? null;
      setUserId(id);
      if (id) {
        setAuthState("authenticated");
        getMyProxyBid(listing.id).then(setMyProxy);
      } else {
        setAuthState("unauthenticated");
        setMyProxy(null);
      }
    });
  }, [listing.id]);

  // Auto-clear success banner after 5 s
  useEffect(() => {
    if (!successMsg) return;
    const id = setTimeout(() => setSuccessMsg(null), 5000);
    return () => clearTimeout(id);
  }, [successMsg]);

  function handleSuccess() {
    setModalOpen(false);
    // Re-fetch the updated proxy record and refresh listing data.
    getMyProxyBid(listing.id).then(setMyProxy);
    router.refresh();
    setSuccessMsg(
      myProxy
        ? "Your proxy maximum has been raised."
        : "Your max bid is set. We'll bid for you automatically.",
    );
  }

  // Don't render while auth or proxy state is still loading.
  if (authState === "loading" || myProxy === undefined) return null;
  // Not logged in: no proxy section shown (Place Bid modal handles sign-in prompt).
  if (authState === "unauthenticated") return null;
  // Sellers cannot bid on their own listings.
  if (userId === listing.seller_id) return null;

  const isRaise = myProxy !== null;

  return (
    <>
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Max Bid
        </p>

        {isRaise ? (
          <div className="mt-2 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-zinc-500">Your maximum</p>
              <p className="text-base font-semibold text-zinc-900">
                {formatPrice(myProxy.max_amount)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="shrink-0 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:bg-white"
            >
              Raise
            </button>
          </div>
        ) : (
          <div className="mt-2">
            <p className="mb-2 text-xs text-zinc-500">
              Bid automatically up to your limit. Your maximum stays private.
            </p>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="w-full rounded-lg border border-zinc-300 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:bg-white"
            >
              Set Max Bid
            </button>
          </div>
        )}

        {successMsg && (
          <p className={`${alertSuccessClass} mt-3`}>{successMsg}</p>
        )}
      </div>

      <ProxyBidModal
        listing={listing}
        currentProxy={myProxy}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
}
