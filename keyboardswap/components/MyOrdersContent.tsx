"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { formatDateTime, formatPrice } from "@/lib/formatListing";
import { supabase } from "@/lib/supabaseClient";
import { alertErrorClass, cardClass, navLinkClass } from "@/lib/ui";
import type { Order } from "@/lib/types/order";

type OrderSummary = Pick<Order, "id" | "buyer_id" | "seller_id" | "final_price" | "status" | "created_at"> & {
  listings: { title: string } | null;
};

type OrdersState =
  | { kind: "loading" | "signed-out" | "error" }
  | { kind: "ready"; userId: string; orders: OrderSummary[] };

export function MyOrdersContent() {
  const [state, setState] = useState<OrdersState>({ kind: "loading" });

  useEffect(() => {
    let controller: AbortController | undefined;
    let currentUserId: string | null | undefined;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const userId = session?.user.id ?? null;
        if (currentUserId === userId) return;
        currentUserId = userId;
        controller?.abort();
        if (!userId) {
          setState({ kind: "signed-out" });
          return;
        }

        setState({ kind: "loading" });
        controller = new AbortController();
        const { signal } = controller;
        // Run after the auth callback releases the client lock.
        setTimeout(async () => {
          if (signal.aborted) return;
          const { data, error } = await supabase
            .from("orders")
            .select("id, buyer_id, seller_id, final_price, status, created_at, listings(title)")
            .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
            .order("created_at", { ascending: false })
            .abortSignal(signal)
            .overrideTypes<OrderSummary[], { merge: false }>();

          if (signal.aborted) return;
          setState(error ? { kind: "error" } : { kind: "ready", userId, orders: data });
        }, 0);
      },
    );
    return () => {
      controller?.abort();
      subscription.unsubscribe();
    };
  }, []);

  if (state.kind === "loading") return <p role="status">Loading orders…</p>;
  if (state.kind === "signed-out") {
    return <p className={cardClass}><Link href="/login" className={navLinkClass}>Sign in</Link> to see your orders.</p>;
  }
  if (state.kind === "error") {
    return <p role="alert" className={alertErrorClass}>Could not load your orders. Refresh the page to try again.</p>;
  }
  if (state.kind !== "ready") return null;
  if (state.orders.length === 0) {
    return <p className={cardClass}>You haven’t won or sold any auctions yet.</p>;
  }

  return (
    <ul className="space-y-3">
      {state.orders.map((order) => (
        <li key={order.id}>
          <Link href={`/orders/${order.id}`} className={`${cardClass} flex flex-wrap items-center justify-between gap-3 hover:border-zinc-400`}>
            <div>
              <p className="font-semibold text-zinc-900">{order.listings?.title ?? `Order #${order.id.slice(0, 8).toUpperCase()}`}</p>
              <p className="mt-1 text-sm text-zinc-600">
                {order.buyer_id === state.userId ? "Purchase" : "Sale"} · {formatDateTime(order.created_at)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold">{formatPrice(order.final_price)}</span>
              <OrderStatusBadge status={order.status} />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
