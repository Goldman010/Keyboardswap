"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getDisplayAuctionStatus } from "@/lib/auction";
import { statusAfterEdit } from "@/lib/listingStatus";
import type { Listing } from "@/lib/types/listing";

type EditListingFormProps = {
  listing: Listing;
};

export function EditListingForm({ listing }: EditListingFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(form);
    const category = String(formData.get("category") ?? "").trim();
    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const known_flaws = String(formData.get("known_flaws") ?? "").trim();
    const included_items = String(formData.get("included_items") ?? "").trim();
    const condition = String(formData.get("condition") ?? "").trim();
    const starting_price = Number(formData.get("starting_price"));

    if (
      !category ||
      !title ||
      !description ||
      !known_flaws ||
      !condition ||
      Number.isNaN(starting_price) ||
      starting_price < 0
    ) {
      setError("Please fill in all required fields.");
      setIsSubmitting(false);
      return;
    }

    // Defense-in-depth: re-check auction timing here in case the auction went
    // live while the seller had the form open.
    const auctionStatus = getDisplayAuctionStatus(listing);
    if (
      listing.status === "approved" &&
      (auctionStatus === "live" || auctionStatus === "ended")
    ) {
      setError("This listing cannot be edited after the auction has started.");
      setIsSubmitting(false);
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setError("You must be logged in to edit a listing.");
      setIsSubmitting(false);
      return;
    }

    const updatePayload: {
      category: string;
      title: string;
      description: string;
      known_flaws: string;
      included_items: string | null;
      condition: string;
      starting_price: number;
      status: Listing["status"];
      current_price?: number;
    } = {
      category,
      title,
      description,
      known_flaws,
      included_items: included_items || null,
      condition,
      starting_price,
      status: statusAfterEdit(listing.status),
    };

    if (
      listing.current_price == null ||
      listing.current_price < starting_price
    ) {
      updatePayload.current_price = starting_price;
    }

    const { error: updateError } = await supabase
      .from("listings")
      .update(updatePayload)
      .eq("id", listing.id)
      .eq("seller_id", session.user.id);

    setIsSubmitting(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.push("/my-listings");
    router.refresh();
  }

  const willRequireReview =
    listing.status === "approved" || listing.status === "rejected";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
        Category
        <select
          name="category"
          required
          defaultValue={listing.category ?? ""}
          className="rounded-lg border border-zinc-300 px-3 py-2 font-normal text-zinc-900"
        >
          <option value="" disabled>
            Select a category
          </option>
          <option value="full_build">Full Build</option>
          <option value="keycaps">Keycaps</option>
          <option value="components">Components</option>
          <option value="accessories">Accessories</option>
        </select>
      </label>

      <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
        Title
        <input
          name="title"
          required
          defaultValue={listing.title}
          className="rounded-lg border border-zinc-300 px-3 py-2 font-normal text-zinc-900"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
        Description
        <textarea
          name="description"
          required
          rows={5}
          defaultValue={listing.description}
          className="rounded-lg border border-zinc-300 px-3 py-2 font-normal text-zinc-900"
        />
      </label>

      <div className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
        <label htmlFor="edit_known_flaws">Known Flaws / Defects</label>
        <p className="font-normal text-zinc-500">
          Write &ldquo;No known flaws&rdquo; if there are none.
        </p>
        <textarea
          id="edit_known_flaws"
          name="known_flaws"
          required
          rows={3}
          defaultValue={listing.known_flaws ?? ""}
          className="rounded-lg border border-zinc-300 px-3 py-2 font-normal text-zinc-900"
          placeholder="Scratches, missing accessories, broken LEDs, modifications..."
        />
      </div>

      <div className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
        <label htmlFor="edit_included_items">
          Included Items{" "}
          <span className="font-normal text-zinc-400">(optional)</span>
        </label>
        <textarea
          id="edit_included_items"
          name="included_items"
          rows={2}
          defaultValue={listing.included_items ?? ""}
          className="rounded-lg border border-zinc-300 px-3 py-2 font-normal text-zinc-900"
          placeholder="e.g. cable, carrying case, extra keycaps, tools"
        />
      </div>

      <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
        Condition
        <select
          name="condition"
          required
          defaultValue={listing.condition}
          className="rounded-lg border border-zinc-300 px-3 py-2 font-normal text-zinc-900"
        >
          <option value="New">New</option>
          <option value="Like New">Like New</option>
          <option value="Excellent">Excellent</option>
          <option value="Good">Good</option>
          <option value="Fair">Fair</option>
          <option value="For Parts">For Parts</option>
        </select>
      </label>

      <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
        Starting price (USD)
        <input
          name="starting_price"
          type="number"
          min="0"
          step="0.01"
          required
          defaultValue={listing.starting_price}
          className="rounded-lg border border-zinc-300 px-3 py-2 font-normal text-zinc-900"
        />
      </label>

      {willRequireReview ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Saving will set this listing back to pending for admin review.
        </p>
      ) : null}

      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : "Save changes"}
        </button>
        <Link
          href="/my-listings"
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
