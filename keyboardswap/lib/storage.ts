import { supabase } from "@/lib/supabaseClient";

export const LISTING_IMAGES_BUCKET = "listing-images";
export const MAX_LISTING_IMAGES = 5;
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

function getFileExtension(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && fromName.length <= 5) {
    return fromName;
  }

  switch (file.type) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "jpg";
  }
}

export async function uploadListingImages(files: File[]): Promise<string[]> {
  const urls: string[] = [];

  for (const file of files) {
    const path = `${crypto.randomUUID()}.${getFileExtension(file)}`;

    const { error: uploadError } = await supabase.storage
      .from(LISTING_IMAGES_BUCKET)
      .upload(path, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
    }

    const { data } = supabase.storage
      .from(LISTING_IMAGES_BUCKET)
      .getPublicUrl(path);

    urls.push(data.publicUrl);
  }

  return urls;
}

const PUBLIC_URL_MARKER = `/storage/v1/object/public/${LISTING_IMAGES_BUCKET}/`;

export function getListingImageStoragePath(publicUrl: string): string | null {
  const index = publicUrl.indexOf(PUBLIC_URL_MARKER);
  if (index === -1) {
    return null;
  }

  return decodeURIComponent(publicUrl.slice(index + PUBLIC_URL_MARKER.length));
}

export async function deleteListingImages(
  urls: string[],
): Promise<string | null> {
  const paths = urls
    .map(getListingImageStoragePath)
    .filter((path): path is string => path !== null);

  if (paths.length === 0) {
    return null;
  }

  const { error } = await supabase.storage
    .from(LISTING_IMAGES_BUCKET)
    .remove(paths);

  if (error) {
    return error.message;
  }

  return null;
}
