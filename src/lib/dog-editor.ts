import { type DogActionResult, saveDog } from "@/lib/dog-actions";
import type { DogValues } from "@/lib/dog-content";
import { DOG_IMAGES_BUCKET } from "@/lib/dog-images";
import { uploadImage, validateImageFile } from "@/lib/image-upload";

// Flujo compartido de edición de perros para el panel y la landing.

export const validateDogImageFile = validateImageFile;

type SubmitDogInput = {
  id: number | null;
  values: DogValues;
  imageFile: File | null;
  removeImage?: boolean;
};

export async function submitDog({ id, values, imageFile, removeImage = false }: SubmitDogInput): Promise<DogActionResult> {
  let uploadedImagePath: string | null = null;

  try {
    if (imageFile) uploadedImagePath = (await uploadImage(DOG_IMAGES_BUCKET, id, imageFile)).path;
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "No fue posible subir la imagen." };
  }

  try {
    // Si la acción rechaza el guardado, el servidor ya elimina la imagen subida.
    // Ante un error de red no se borra nada: el servidor pudo haber guardado la
    // fila y un archivo huérfano es preferible a una ficha sin imagen.
    return await saveDog({ id, values, uploadedImagePath, removeImage });
  } catch {
    return { ok: false, error: "No fue posible completar el guardado. Recarga la página y verifica los cambios." };
  }
}
