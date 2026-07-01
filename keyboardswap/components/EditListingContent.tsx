"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EditListingForm } from "@/components/EditListingForm";
import { supabase } from "@/lib/supabaseClient";
import { alertErrorClass, cardClass, primaryButtonClass } from "@/lib/ui";
import type { Listing } from "@/lib/types/listing";

type EditListingContentProps = {
  listingId: string;
};

export function EditListingContent({ listingId }: EditListingContentProps) {
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingListing, setIsLoadingListing] = useState(false);
  const [listing, setListing] = useState<Listing | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadListing(userId: string) {
      setIsLoadingListing(true);
      setError(null);
      setNotFound(false);

      const { data, error: fetchError } = await supabase
        .from("listings")
        .select("*")
        .eq("id", listingId)
        .eq("seller_id", userId)
        .maybeSingle();

      if (!isMounted) {
        return;
      }

      setIsLoadingListing(false);

      if (fetchError) {
        setError(fetchError.message);
        setListing(null);
        return;
      }

      if (!data) {
        setNotFound(true);
        setListing(null);
        return;
      }

      setListing(data as Listing);
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
        await loadListing(session.user.id);
      }
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session));
      setIsLoadingAuth(false);

      if (session) {
        loadListing(session.user.id);
      } else {
        setListing(null);
        setNotFound(false);
        setError(null);
        setIsLoadingListing(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [listingId]);

  if (isLoadingAuth) {
    return (
      <div className={cardClass}>
        <p className="text-sm text-zinc-500">Checking login status...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={cardClass}>
        <p className="text-zinc-600">
          You must be logged in to edit a listing.
        </p>
        <Link href="/login" className={`${primaryButtonClass} mt-4 inline-block`}>
          Log in to continue
        </Link>
      </div>
    );
  }

  if (isLoadingListing) {
    return (
      <div className={cardClass}>
        <p className="text-sm text-zinc-500">Loading listing...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={alertErrorClass}>
        Could not load listing: {error}
      </div>
    );
  }

  if (notFound || !listing) {
    return (
      <div className={cardClass}>
        <p className="text-zinc-600">
          Listing not found or you don&apos;t have permission to edit it.
        </p>
        <Link
          href="/my-listings"
          className="mt-4 inline-block text-sm font-medium text-zinc-900 underline underline-offset-4"
        >
          Back to my listings
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <EditListingForm listing={listing} />
    </div>
  );
}
