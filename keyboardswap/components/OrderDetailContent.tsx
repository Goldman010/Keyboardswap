"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ListingPlaceholderImage } from "@/components/ListingPlaceholderImage";
import { supabase } from "@/lib/supabaseClient";
import { formatDateTime, formatPrice } from "@/lib/formatListing";
import {
  alertErrorClass,
  cardClass,
  navLinkClass,
  pageTitleClass,
} from "@/lib/ui";
import type { Order, OrderStatus } from "@/lib/types/order";

// ── Status display ─────────────────────────────────────────────────────────────

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: "Pending Payment",
  paid: "Paid",
  shipped: "Shipped",
  completed: "Completed",
  canceled: "Canceled",
  refunded: "Refunded",
  disputed: "Disputed",
  resolved: "Resolved",
};

const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending_payment: "bg-amber-100 text-amber-800",
  paid: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  completed: "bg-emerald-100 text-emerald-800",
  canceled: "bg-zinc-100 text-zinc-600",
  refunded: "bg-zinc-100 text-zinc-600",
  disputed: "bg-red-100 text-red-800",
  resolved: "bg-zinc-100 text-zinc-700",
};

// ── Types ──────────────────────────────────────────────────────────────────────

type ListingSnippet = {
  title: string;
  image_urls: string[] | null;
};

type LoadError = "unauthenticated" | "not_found";

type Props = { orderId: string };

// ── Component ──────────────────────────────────────────────────────────────────

export function OrderDetailContent({ orderId }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<LoadError | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [listing, setListing] = useState<ListingSnippet | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (cancelled) return;

      if (!session) {
        setError("unauthenticated");
        setLoading(false);
        return;
      }

      setUserId(session.user.id);

      // Fetch order by ID. RLS restricts rows to buyer/seller only;
      // a guessed UUID simply returns null rather than an error.
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .maybeSingle();

      if (cancelled) return;

      if (orderError || !orderData) {
        setError("not_found");
        setLoading(false);
        return;
      }

      setOrder(orderData as Order);

      // Fetch listing title and image separately (public approved listing).
      const { data: listingData } = await supabase
        .from("listings")
        .select("title, image_urls")
        .eq("id", (orderData as Order).listing_id)
        .maybeSingle();

      if (cancelled) return;
      setListing((listingData as ListingSnippet | null) ?? null);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  // ── Loading ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="py-16 text-center text-sm text-zinc-500">
        Loading order…
      </div>
    );
  }

  // ── Error states ─────────────────────────────────────────────────────────────

  if (error === "unauthenticated") {
    return (
      <div className={cardClass}>
        <p className="text-zinc-600">
          Please{" "}
          <Link
            href="/login"
            className="font-medium text-zinc-900 underline underline-offset-4"
          >
            sign in
          </Link>{" "}
          to view your order.
        </p>
      </div>
    );
  }

  if (error === "not_found" || !order) {
    return (
      <div className={alertErrorClass}>
        Order not found. You may not have permission to view this order.
      </div>
    );
  }

  // ── Resolved ─────────────────────────────────────────────────────────────────

  const isBuyer = userId === order.buyer_id;
  const roleLabel = isBuyer ? "Buyer" : "Seller";
  const shortId = order.id.slice(0, 8).toUpperCase();

  return (
    <div className="flex flex-col gap-6">
      {/* Back navigation */}
      <Link
        href={`/listing/${order.listing_id}`}
        className={`${navLinkClass} text-sm`}
      >
        ← Back to listing
      </Link>

      {/* Page heading + status badge */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className={pageTitleClass}>Order #{shortId}</h1>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${ORDER_STATUS_COLORS[order.status]}`}
        >
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>

      {/* Listing summary */}
      <div className={cardClass}>
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Item
        </p>
        <div className="flex gap-4">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg">
            <ListingPlaceholderImage
              src={listing?.image_urls?.[0]}
              alt={listing?.title ?? "Listing"}
              aspectClass="aspect-square"
            />
          </div>
          <div className="flex flex-col justify-center gap-1.5">
            <p className="font-semibold text-zinc-900">
              {listing?.title ?? "—"}
            </p>
            <Link
              href={`/listing/${order.listing_id}`}
              className="text-sm text-zinc-500 underline underline-offset-4 hover:text-zinc-700"
            >
              View listing
            </Link>
          </div>
        </div>
      </div>

      {/* Transaction details */}
      <div className={cardClass}>
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Transaction Details
        </p>
        <dl className="flex flex-col gap-0 divide-y divide-zinc-100 text-sm">
          <DetailRow label="Your role" value={roleLabel} />
          <DetailRow
            label="Final price"
            value={formatPrice(order.final_price)}
            valueClass="text-base font-bold text-zinc-900"
          />
          <div className="flex items-center justify-between gap-4 py-3">
            <dt className="font-medium text-zinc-500">Status</dt>
            <dd>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ORDER_STATUS_COLORS[order.status]}`}
              >
                {ORDER_STATUS_LABELS[order.status]}
              </span>
            </dd>
          </div>
          <DetailRow
            label="Order created"
            value={formatDateTime(order.created_at)}
          />
        </dl>
      </div>

      {/* Payment — placeholder */}
      <div className={cardClass}>
        <h2 className="mb-2 text-lg font-semibold text-zinc-900">Payment</h2>
        <p className="text-sm text-zinc-500">
          Secure payment via Stripe will be available here in a future update.
        </p>
      </div>

      {/* Shipping — placeholder */}
      <div className={cardClass}>
        <h2 className="mb-2 text-lg font-semibold text-zinc-900">Shipping</h2>
        <p className="text-sm text-zinc-500">
          Shipping details and tracking will appear here once payment is
          confirmed.
        </p>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function DetailRow({
  label,
  value,
  valueClass = "text-zinc-700",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="font-medium text-zinc-500">{label}</dt>
      <dd className={valueClass}>{value}</dd>
    </div>
  );
}
