"use client";

import { useEffect, useState } from "react";

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

export default function AdminPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let active = true;
    let request = 0;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const current = ++request;
        const canModerate = session?.user.app_metadata?.role === "admin";
        setIsAdmin(canModerate);
        setListings([]);
        setError(null);
        setLoading(canModerate);

        if (canModerate) {
          // Defer the query until the auth callback has released the client lock.
          setTimeout(async () => {
            if (!active || current !== request) return;
            const { data, error } = await supabase
              .from("listings")
              .select("*")
              .eq("status", "pending")
              .order("created_at", { ascending: false });

            if (!active || current !== request) return;
            setListings(data ?? []);
            setError(error?.message ?? null);
            setLoading(false);
          }, 0);
        }
      },
    );

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-full bg-zinc-50">
      <SiteHeader />

      <PageContainer maxWidth="max-w-4xl">
        <div className="mb-8">
          <h1 className={pageTitleClass}>Pending listings</h1>
          <p className={pageDescriptionClass}>
            Review submissions and approve or reject them.
          </p>
        </div>

        {loading ? (
          <p>Loading pending listings…</p>
        ) : !isAdmin ? (
          <p>Sign in with an administrator account to review listings.</p>
        ) : error ? (
          <div className={alertErrorClass}>
            Could not load pending listings: {error}
          </div>
        ) : listings.length === 0 ? (
          <div className={`${cardClass} border-dashed bg-zinc-50 py-12 text-center`}>
            <p className="text-zinc-600">No pending listings to review.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-5">
            {listings.map((listing) => (
              <li key={listing.id}>
                <AdminPendingListingRow
                  listing={listing}
                  onReviewed={() => setListings((rows) => rows.filter((row) => row.id !== listing.id))}
                />
              </li>
            ))}
          </ul>
        )}
      </PageContainer>
    </div>
  );
}
