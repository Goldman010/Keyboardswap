"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
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
    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const condition = String(formData.get("condition") ?? "").trim();
    const starting_price = Number(formData.get("starting_price"));

    if (
      !title ||
      !description ||
      !condition ||
      Number.isNaN(starting_price) ||
      starting_price < 0
    ) {
      setError("Please fill in all fields with valid values.");
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
      title: string;
      description: string;
      condition: string;
      starting_price: number;
      status: Listing["status"];
      current_price?: number;
    } = {
      title,
      description,
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
