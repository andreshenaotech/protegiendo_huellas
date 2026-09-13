import type { Metadata } from "next";
import Link from "next/link";
import { AdoptionForm } from "@/components/adoption-form";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { isAdopted } from "@/lib/dog-content";
import { getPublishedDogs } from "@/lib/dogs";

export const metadata: Metadata = {
  title: "Solicitud de adopción | Protegiendo Huellas",
  description: "Completa tu solicitud para adoptar un perrito de la Fundación Protegiendo Huellas y envíala por WhatsApp.",
};

// Misma estrategia de caché que la landing: la lista de perritos se revalida
// al editar desde el panel.
export const revalidate = 300;

export default async function AdoptionRequestPage() {
  const dogs = (await getPublishedDogs())
    .filter((dog) => !isAdopted(dog))
    .map((dog) => ({ id: dog.id, name: dog.name }))
    .sort((a, b) => a.name.localeCompare(b.name, "es"));

  return (
    <>
      <a className="skip-link" href="#main">Saltar al contenido</a>
      <Header />

      <main id="main" className="adoption-request-page">
        <div className="container adoption-request">
          <div className="adoption-request-heading">
            <Link className="adoption-back-link" href="/adopciones">← Volver al proceso de adopción</Link>
            <p className="eyebrow">Solicitud de adopción</p>
            <h1>Cuéntanos sobre ti y tu futuro perrito</h1>
            <p>Responde cada pregunta y acepta los compromisos. Al enviar, se abrirá WhatsApp con toda tu información lista para mandarla a la fundación.</p>
          </div>

          <div className="adoption-request-layout">
            <AdoptionForm dogs={dogs} />

            <aside className="adoption-request-aside" aria-label="Qué pasa después de enviar">
              <p className="eyebrow">Después de enviar</p>
              <ol>
                <li>
                  <strong>Revisamos tu solicitud</strong>
                  <span>Cuando envíes el video y estés de acuerdo con los requisitos, revisamos tu caso y te confirmamos si fue aprobado, en máximo 24 horas.</span>
                </li>
                <li>
                  <strong>¡Bienvenido a casa!</strong>
                  <span>Si quedas seleccionado(a), te enviamos los documentos para firmar y coordinamos la entrega en el refugio o en un punto acordado en Paipa (Boyacá) o alrededores.</span>
                </li>
              </ol>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
