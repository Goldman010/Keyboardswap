import type { ListingStatus } from "@/lib/types/listing";

const STATUS_STYLES: Record<ListingStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
  sold: "bg-zinc-100 text-zinc-700",
};

type ListingStatusBadgeProps = {
  status: ListingStatus;
};

export function ListingStatusBadge({ status }: ListingStatusBadgeProps) {
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}
