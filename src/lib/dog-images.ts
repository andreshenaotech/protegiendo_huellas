import { getSupabaseUrl } from "@/lib/supabase/env";

// Utilidades de imágenes en Storage compartidas por perros y eventos.

export const DOG_IMAGES_BUCKET = "dog-images";
export const EVENT_FLYERS_BUCKET = "event-flyers";
// Límite de los buckets para el archivo final ya comprimido.
export const MAX_DOG_IMAGE_SIZE = 5 * 1024 * 1024;
// Límite del archivo original elegido por el admin, antes de comprimir.
export const MAX_DOG_IMAGE_INPUT_SIZE = 20 * 1024 * 1024;
export const DOG_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

// Registros nuevos: "new/<uuid>.ext". Registros existentes: "<id>/<uuid>.ext".
const IMAGE_PATH_PATTERN = /^(new|\d+)\/[0-9a-f-]{36}\.(jpg|png|webp)$/;

export function getPublicImageUrl(bucket: string, path: string | null) {
  if (!path) return null;
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  return `${getSupabaseUrl()}/storage/v1/object/public/${bucket}/${encodedPath}`;
}

export function getDogImageUrl(path: string | null) {
  return getPublicImageUrl(DOG_IMAGES_BUCKET, path);
}

export function getDogImageExtension(mimeType: string) {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  return "jpg";
}

export function isValidImagePath(path: string, ownerId: number | null) {
  const match = IMAGE_PATH_PATTERN.exec(path);
  if (!match) return false;
  return match[1] === (ownerId === null ? "new" : String(ownerId));
}

export const isValidDogImagePath = isValidImagePath;
