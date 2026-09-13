import type { Metadata } from "next";
import { DogCatalog } from "@/components/dog-catalog";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ScrollReveals } from "@/components/scroll-reveals";
import { getPublishedDogs } from "@/lib/dogs";

export const metadata: Metadata = {
  title: "Perritos en adopción | Protegiendo Huellas",
  description: "Busca por nombre o tamaño entre los perros que esperan un hogar en la Fundación Protegiendo Huellas, y conoce a los que ya fueron adoptados.",
};

// Misma estrategia de caché que la landing (ver src/app/page.tsx).
export const revalidate = 300;

export default async function DogsPage() {
  const dogs = await getPublishedDogs();

  return (
    <>
      <a className="skip-link" href="#main">Saltar al contenido</a>
      <Header />
      <ScrollReveals />
      <main id="main" className="dogs-page">
        <DogCatalog dogs={dogs} variant="full" />
      </main>
      <Footer />
    </>
  );
}
