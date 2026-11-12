import type { OrderStatus } from "@/lib/types/order";

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

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${ORDER_STATUS_COLORS[status] ?? "bg-zinc-100 text-zinc-700"}`}>
      {ORDER_STATUS_LABELS[status] ?? status}
    </span>
  );
}
