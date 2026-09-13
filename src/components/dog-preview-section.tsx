import { DogCatalog } from "@/components/dog-catalog";
import { isAdopted } from "@/lib/dog-content";
import { getPublishedDogs } from "@/lib/dogs";

// Vista corta "Conoce a nuestra gran familia" con enlace a /perritos.
// Lee el catálogo cacheado, así que la página que lo use debe declarar
// `revalidate` como la landing.
export async function DogPreviewSection() {
  const dogs = (await getPublishedDogs()).filter((dog) => !isAdopted(dog));
  return <DogCatalog dogs={dogs} variant="preview" />;
}
