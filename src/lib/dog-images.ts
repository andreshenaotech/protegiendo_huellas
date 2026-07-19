import { getSupabaseUrl } from "@/lib/supabase/env";

export const DOG_IMAGES_BUCKET = "dog-images";
export const MAX_DOG_IMAGE_SIZE = 5 * 1024 * 1024;
export const DOG_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export function getDogImageUrl(path: string | null) {
  if (!path) return null;
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  return `${getSupabaseUrl()}/storage/v1/object/public/${DOG_IMAGES_BUCKET}/${encodedPath}`;
}

export function getDogImageExtension(file: File) {
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}
