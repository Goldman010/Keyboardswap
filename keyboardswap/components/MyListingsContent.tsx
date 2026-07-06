"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { MyListingCard } from "@/components/MyListingCard";
import { deleteListing } from "@/lib/deleteListing";
import { supabase } from "@/lib/supabaseClient";
import {
  alertErrorClass,
  alertSuccessClass,
  cardClass,
  primaryButtonClass,
} from "@/lib/ui";
import type { Listing } from "@/lib/types/listing";

export function MyListingsContent() {
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingListings, setIsLoadingListings] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [listingToDelete, setListingToDelete] = useState<Listing | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  function handleDeleteClick(listing: Listing) {
    setDeleteError(null);
    setListingToDelete(listing);
  }

  function handleCloseDeleteDialog() {
    if (isDeleting) {
      return;
    }

    setListingToDelete(null);
    setDeleteError(null);
  }

  async function handleConfirmDelete() {
    if (!listingToDelete) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    const result = await deleteListing(listingToDelete);

    setIsDeleting(false);

    if (!result.success) {
      setDeleteError(result.error);
      return;
    }

    setListings((current) =>
      current.filter((listing) => listing.id !== listingToDelete.id),
    );
    setListingToDelete(null);
    setSuccessMessage("Listing deleted successfully.");

    if (result.storageCleanupError) {
      console.error(
        "Storage cleanup failed after listing deletion:",
        result.storageCleanupError,
      );
    }
  }

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
          You must be logged in to view your listings.
        </p>
        <Link href="/login" className={`${primaryButtonClass} mt-4 inline-block`}>
          Log in to continue
        </Link>
      </div>
    );
  }

  if (isLoadingListings) {
    return (
      <div className={cardClass}>
        <p className="text-sm text-zinc-500">Loading your listings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={alertErrorClass}>
        Could not load your listings: {error}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <>
        {successMessage ? (
          <div className={`${alertSuccessClass} mb-6`}>{successMessage}</div>
        ) : null}

        <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-12 text-center">
          <p className="text-zinc-600">You haven&apos;t submitted any listings yet.</p>
          <Link
            href="/submit"
            className="mt-4 inline-block text-sm font-medium text-zinc-900 underline underline-offset-4"
          >
            Submit your first listing
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      {successMessage ? (
        <div className={`${alertSuccessClass} mb-6`}>{successMessage}</div>
      ) : null}

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => (
          <li key={listing.id}>
            <MyListingCard
              listing={listing}
              onDeleteClick={handleDeleteClick}
            />
          </li>
        ))}
      </ul>

      <ConfirmDialog
        isOpen={listingToDelete !== null}
        message={
          "Are you sure you want to permanently delete this listing?\nThis action cannot be undone."
        }
        confirmLabel="Delete Listing"
        isLoading={isDeleting}
        error={deleteError}
        onConfirm={handleConfirmDelete}
        onClose={handleCloseDeleteDialog}
      />
    </>
  );
}
