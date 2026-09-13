import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { DogPreviewSection } from "@/components/dog-preview-section";
import { ExploreLinksSection } from "@/components/explore-links-section";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ArrowIcon, ChatIcon, HeartIcon } from "@/components/icons";
import { ScrollReveals } from "@/components/scroll-reveals";
import { adoptionCommitments, adoptionQuestions } from "@/lib/adoption";
import { whatsappUrl } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Adopciones | Protegiendo Huellas",
  description: "Conoce las recomendaciones y los pasos para adoptar un perrito de la Fundación Protegiendo Huellas en Paipa, Boyacá.",
};

// La vista de perritos al final lee el catálogo cacheado (ver src/app/page.tsx).
export const revalidate = 300;

const MEET_WHATSAPP_URL = whatsappUrl("Hola, quiero agendar una cita para conocer a un perrito antes de adoptarlo.");

const recommendations = [
  "Un perrito es un compromiso a largo plazo. Será tu compañero de aventuras por muchos años, te recibirá feliz cada día y a cambio solo necesita tu amor, tu tiempo y un lugar en tu familia.",
  "Es necesario que puedas cubrir económicamente los cuidados básicos del perrito que vayas a adoptar: comida, vacunas, desparasitación y baño.",
  "Es necesario que cuentes con un espacio adecuado dentro de casa donde el perrito pueda resguardarse y estar tranquilo, o un espacio bien dotado fuera que respete su integridad y salud (no recomendamos tener cachorros fuera de casa, siempre deben estar en un lugar seguro, cómodo, limpio y tranquilo junto a su mamá).",
  "Es necesario que te comprometas a esterilizar al perrito, si aún no lo está.",
];

export default function AdoptionsPage() {
  return (
    <>
      <a className="skip-link" href="#main">Saltar al contenido</a>
      <Header />
      <ScrollReveals />

      <main id="main">
        <section className="adoption-hero">
          <div className="container adoption-hero-grid">
            <div className="adoption-hero-copy">
              <p className="eyebrow">Adopciones</p>
              <h1>Recuerda antes de <span className="highlight">adoptar</span></h1>
              <p className="hero-copy">Sigue estas recomendaciones antes de iniciar tu solicitud. Así nos aseguramos de que cada perrito llegue a un hogar donde estará seguro y feliz.</p>
              <div className="hero-actions">
                <Link className="btn btn-primary" href="/adopciones/solicitud">Iniciar solicitud <ArrowIcon /></Link>
                <Link className="btn btn-outline" href="/perritos">Conocer perritos</Link>
              </div>
            </div>

            {/* Imagen provisional: reemplazar por una foto propia de adopciones. */}
            <div className="adoption-hero-photo" data-reveal="up">
              <Image
                src="/dog1.png"
                alt="Perrito de la Fundación Protegiendo Huellas esperando un hogar"
                fill
                preload
                sizes="(max-width: 820px) calc(100vw - 28px), 580px"
              />
            </div>
          </div>
        </section>

        <section className="adoption-recommendations-section">
          <div className="container">
            <div data-reveal="up">
              <p className="eyebrow">Antes de adoptar</p>
              <h2 className="section-title">Recuerda seguir estas recomendaciones antes de adoptar</h2>
            </div>
            <ol className="adoption-recommendations" data-reveal="up">
              {recommendations.map((recommendation) => <li key={recommendation}>{recommendation}</li>)}
            </ol>
          </div>
        </section>

        <section className="adoption-steps-section" id="pasos">
          <div className="container adoption-steps-layout">
            <div className="adoption-steps-heading" data-reveal="up">
              <p className="eyebrow">Proceso de adopción</p>
              <h2 className="section-title">Paso a paso para llevarlo a casa</h2>
              <p className="section-copy">Sabemos que son varios pasos, pero cada uno existe para que esta historia termine bien.</p>
              <Link className="btn btn-primary adoption-steps-button" href="/adopciones/solicitud">Envíanos las respuestas a WhatsApp <ChatIcon /></Link>
            </div>

            <ol className="adoption-timeline">
              <li className="adoption-step" data-reveal="up">
                <span className="adoption-step-marker" aria-hidden="true">1</span>
                <div className="adoption-step-body">
                  <p className="adoption-step-label">Paso 1</p>
                  <h3>Cuéntanos sobre ti</h3>
                  <ul className="adoption-questions">
                    {adoptionQuestions.map((question) => (
                      <li key={question.id}>{question.label}</li>
                    ))}
                  </ul>
                </div>
              </li>

              <li className="adoption-step" data-reveal="up">
                <span className="adoption-step-marker" aria-hidden="true">2</span>
                <div className="adoption-step-body">
                  <p className="adoption-step-label">Paso 2</p>
                  <h3>Tus compromisos como adoptante</h3>
                  <ul className="check-list">
                    {adoptionCommitments.map((commitment) => <li key={commitment.text}>{commitment.text}</li>)}
                  </ul>
                  <p className="adoption-step-note">Te hacemos las preguntas y te pedimos un video no para complicarte, sino para asegurarnos de que tu peludo estará seguro y feliz.</p>
                </div>
              </li>

              <li className="adoption-step" data-reveal="up">
                <span className="adoption-step-marker" aria-hidden="true">3</span>
                <div className="adoption-step-body">
                  <p className="adoption-step-label">Paso 3</p>
                  <h3>Revisamos tu solicitud</h3>
                  <p>Cuando envíes el video y estés de acuerdo con los requisitos, revisamos tu caso y te confirmamos si fue aprobado, en <strong>máximo 24 horas</strong>.</p>
                </div>
              </li>

              <li className="adoption-step" data-reveal="up">
                <span className="adoption-step-marker" aria-hidden="true"><HeartIcon /></span>
                <div className="adoption-step-body">
                  <p className="adoption-step-label">Paso 4</p>
                  <h3>¡Bienvenido a casa!</h3>
                  <p>Si quedas seleccionado(a) para adoptar, te enviamos los documentos para firmar y coordinamos la entrega en el refugio o en un punto acordado en Paipa (Boyacá) o alrededores. Si estás en Bogotá, se requiere un aporte económico para organizar la entrega allí.</p>
                </div>
              </li>
            </ol>
          </div>

          <div className="container">
            <p className="adoption-support" data-reveal="up">
              <HeartIcon />
              <span><strong>No estás solo en el proceso.</strong> Estamos aquí para acompañarte.</span>
            </p>
          </div>
        </section>

        <section className="adoption-meet-section">
          <div className="container">
            <div className="adoption-meet" data-reveal="up">
              {/* Imagen provisional: reemplazar por una foto propia de adopciones. */}
              <div className="adoption-meet-photo">
                <Image src="/dog1.png" alt="Perrito de la Fundación Protegiendo Huellas" fill sizes="(max-width: 820px) calc(100vw - 28px), 460px" />
              </div>
              <div className="adoption-meet-copy">
                <p className="eyebrow">Antes de decidir</p>
                <h2>¿Quieres conocer al peludo antes de adoptarlo?</h2>
                <p>Escríbenos por WhatsApp (322 746 4595) y agenda una cita.</p>
                <a className="btn btn-primary" href={MEET_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                  Agendar una cita <ChatIcon />
                </a>
              </div>
            </div>
          </div>
        </section>

        <DogPreviewSection />

        <ExploreLinksSection variant="compact" exclude={["adopta", "como-adoptar"]} />
      </main>

      <Footer />
    </>
  );
}
