"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_LISTING_IMAGES,
  uploadListingImages,
} from "@/lib/storage";

type CreateListingFormProps = {
  onSuccess?: "inline" | "redirect";
};

type SelectedImage = {
  file: File;
  previewUrl: string;
};

export function CreateListingForm({ onSuccess = "redirect" }: CreateListingFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);

  useEffect(() => {
    return () => {
      for (const image of selectedImages) {
        URL.revokeObjectURL(image.previewUrl);
      }
    };
  }, [selectedImages]);

  function clearSelectedImages() {
    for (const image of selectedImages) {
      URL.revokeObjectURL(image.previewUrl);
    }
    setSelectedImages([]);
  }

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) {
      return;
    }

    const combinedCount = selectedImages.length + files.length;
    if (combinedCount > MAX_LISTING_IMAGES) {
      setError(`You can upload up to ${MAX_LISTING_IMAGES} images.`);
      event.target.value = "";
      return;
    }

    for (const file of files) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
        setError("Images must be JPEG, PNG, WebP, or GIF.");
        event.target.value = "";
        return;
      }

      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        setError("Each image must be 5 MB or smaller.");
        event.target.value = "";
        return;
      }
    }

    const nextImages = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setSelectedImages((current) => [...current, ...nextImages]);
    event.target.value = "";
  }

  function removeImage(index: number) {
    setSelectedImages((current) => {
      const next = [...current];
      const [removed] = next.splice(index, 1);
      if (removed) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      return next;
    });
  }

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
      setError("You must be logged in to submit a listing.");
      setIsSubmitting(false);
      return;
    }

    let image_urls: string[] = [];

    try {
      if (selectedImages.length > 0) {
        image_urls = await uploadListingImages(
          selectedImages.map((image) => image.file),
        );
      }
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Failed to upload images.",
      );
      setIsSubmitting(false);
      return;
    }

    const { error: insertError } = await supabase.from("listings").insert({
      title,
      description,
      condition,
      seller_id: session.user.id,
      starting_price,
      current_price: starting_price,
      starting_bid: starting_price,
      listing_type: "auction",
      status: "pending",
      image_urls,
    });

    setIsSubmitting(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    clearSelectedImages();
    form.reset();

    if (onSuccess === "inline") {
      setSubmitted(true);
      return;
    }

    router.push("/?submitted=1");
    router.refresh();
  }

  if (submitted) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Listing submitted successfully. It will appear on the marketplace once
          approved.
        </div>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="self-start text-sm font-medium text-zinc-600 underline underline-offset-4 hover:text-zinc-900"
        >
          Submit another listing
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
        Title
        <input
          name="title"
          required
          className="rounded-lg border border-zinc-300 px-3 py-2 font-normal text-zinc-900"
          placeholder="GMK Olivia V3 — Base Kit"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
        Description
        <textarea
          name="description"
          required
          rows={5}
          className="rounded-lg border border-zinc-300 px-3 py-2 font-normal text-zinc-900"
          placeholder="Switch type, mods, included extras, shipping notes..."
        />
      </label>

      <label className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
        Condition
        <select
          name="condition"
          required
          className="rounded-lg border border-zinc-300 px-3 py-2 font-normal text-zinc-900"
          defaultValue=""
        >
          <option value="" disabled>
            Select condition
          </option>
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
          className="rounded-lg border border-zinc-300 px-3 py-2 font-normal text-zinc-900"
          placeholder="149.00"
        />
      </label>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="listing-images"
          className="text-sm font-medium text-zinc-700"
        >
          Photos (optional, up to {MAX_LISTING_IMAGES})
        </label>
        <input
          id="listing-images"
          type="file"
          accept={ALLOWED_IMAGE_TYPES.join(",")}
          multiple
          disabled={selectedImages.length >= MAX_LISTING_IMAGES || isSubmitting}
          onChange={handleImageChange}
          className="block w-full text-sm text-zinc-600 file:mr-4 file:rounded-lg file:border-0 file:bg-zinc-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-zinc-900 hover:file:bg-zinc-200"
        />
        <p className="text-sm text-zinc-500">
          JPEG, PNG, WebP, or GIF. Max 5 MB each.
        </p>

        {selectedImages.length > 0 ? (
          <ul className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {selectedImages.map((image, index) => (
              <li
                key={image.previewUrl}
                className="relative overflow-hidden rounded-lg border border-zinc-200"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.previewUrl}
                  alt={`Selected ${index + 1}`}
                  className="aspect-[4/3] w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute right-2 top-2 rounded-full bg-zinc-900/80 px-2 py-1 text-xs font-medium text-white hover:bg-zinc-900"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Submitting..." : "Submit listing"}
      </button>

      <p className="text-sm text-zinc-500">
        Listings are reviewed before appearing on the marketplace.
      </p>
    </form>
  );
}
