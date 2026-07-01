"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MyListingCard } from "@/components/MyListingCard";
import { supabase } from "@/lib/supabaseClient";
import type { Listing } from "@/lib/types/listing";

export function MyListingsContent() {
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingListings, setIsLoadingListings] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadListings(userId: string) {
      setIsLoadingListings(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("listings")
        .select("*")
        .eq("seller_id", userId)
        .order("created_at", { ascending: false });

      if (!isMounted) {
        return;
      }

      setIsLoadingListings(false);

      if (fetchError) {
        setError(fetchError.message);
        setListings([]);
        return;
      }

      setListings((data ?? []) as Listing[]);
    }

    async function loadSession() {
      const { data } = await supabase.auth.getSession();
      if (!isMounted) {
        return;
      }

      const session = data.session;
      setIsAuthenticated(Boolean(session));
      setIsLoadingAuth(false);

      if (session) {
        await loadListings(session.user.id);
      }
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session));
      setIsLoadingAuth(false);

      if (session) {
        loadListings(session.user.id);
      } else {
        setListings([]);
        setError(null);
        setIsLoadingListings(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (isLoadingAuth) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-zinc-500">Checking login status...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-zinc-600">
          You must be logged in to view your listings.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
        >
          Log in to continue
        </Link>
      </div>
    );
  }

  if (isLoadingListings) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-zinc-500">Loading your listings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        Could not load your listings: {error}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-12 text-center">
        <p className="text-zinc-600">You haven&apos;t submitted any listings yet.</p>
        <Link
          href="/submit"
          className="mt-4 inline-block text-sm font-medium text-zinc-900 underline underline-offset-4"
        >
          Submit your first listing
        </Link>
      </div>
    );
  }

  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {listings.map((listing) => (
        <li key={listing.id}>
          <MyListingCard listing={listing} />
        </li>
      ))}
    </ul>
  );
}
