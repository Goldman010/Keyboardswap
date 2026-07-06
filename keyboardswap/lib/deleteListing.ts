import { deleteListingImages } from "@/lib/storage";
import { supabase } from "@/lib/supabaseClient";
import type { Listing } from "@/lib/types/listing";

export type DeleteListingResult =
  | { success: true; storageCleanupError?: string }
  | { success: false; error: string };

export async function deleteListing(
  listing: Listing,
): Promise<DeleteListingResult> {
  if (listing.status === "sold") {
    return { success: false, error: "Sold listings cannot be deleted." };
  }

  const { data, error } = await supabase
    .from("listings")
    .delete()
    .eq("id", listing.id)
    .select("id");

  if (error) {
    return { success: false, error: error.message };
  }

  if (!data || data.length === 0) {
    return {
      success: false,
      error: "Could not delete listing. You may not have permission.",
    };
  }

  const storageCleanupError = await deleteListingImages(
    listing.image_urls ?? [],
  );

  if (storageCleanupError) {
    console.error(
      `Listing ${listing.id} deleted but image cleanup failed:`,
      storageCleanupError,
    );
  }

  return {
    success: true,
    storageCleanupError: storageCleanupError ?? undefined,
  };
}
