import { AdminPendingListingRow } from "@/components/AdminPendingListingRow";
import { PageContainer } from "@/components/PageContainer";
import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/lib/supabaseClient";
import {
  alertErrorClass,
  cardClass,
  pageDescriptionClass,
  pageTitleClass,
} from "@/lib/ui";
import type { Listing } from "@/lib/types/listing";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const listings = (data ?? []) as Listing[];

  return (
    <div className="min-h-full bg-zinc-50">
      <SiteHeader />

      <PageContainer maxWidth="max-w-4xl">
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Temporary admin page — auth required before launch.
        </div>

        <div className="mb-8">
          <h1 className={pageTitleClass}>Pending listings</h1>
          <p className={pageDescriptionClass}>
            Review submissions and approve or reject them.
          </p>
        </div>

        {error ? (
          <div className={alertErrorClass}>
            Could not load pending listings: {error.message}
          </div>
        ) : listings.length === 0 ? (
          <div className={`${cardClass} border-dashed bg-zinc-50 py-12 text-center`}>
            <p className="text-zinc-600">No pending listings to review.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-5">
            {listings.map((listing) => (
              <li key={listing.id}>
                <AdminPendingListingRow listing={listing} />
              </li>
            ))}
          </ul>
        )}
      </PageContainer>
    </div>
  );
}
