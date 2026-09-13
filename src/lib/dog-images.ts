import { getSupabaseUrl } from "@/lib/supabase/env";

export const DOG_IMAGES_BUCKET = "dog-images";
// Límite del bucket para el archivo final ya comprimido.
export const MAX_DOG_IMAGE_SIZE = 5 * 1024 * 1024;
// Límite del archivo original elegido por el admin, antes de comprimir.
export const MAX_DOG_IMAGE_INPUT_SIZE = 20 * 1024 * 1024;
export const DOG_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

// Nuevos perros: "new/<uuid>.ext". Perros existentes: "<id>/<uuid>.ext".
const DOG_IMAGE_PATH_PATTERN = /^(new|\d+)\/[0-9a-f-]{36}\.(jpg|png|webp)$/;

export function getDogImageUrl(path: string | null) {
  if (!path) return null;
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  return `${getSupabaseUrl()}/storage/v1/object/public/${DOG_IMAGES_BUCKET}/${encodedPath}`;
}

export function getDogImageExtension(mimeType: string) {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  return "jpg";
}

export function isValidDogImagePath(path: string, dogId: number | null) {
  const match = DOG_IMAGE_PATH_PATTERN.exec(path);
  if (!match) return false;
  return match[1] === (dogId === null ? "new" : String(dogId));
}
