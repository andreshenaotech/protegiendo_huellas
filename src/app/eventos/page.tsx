import type { Metadata } from "next";
import Image from "next/image";
import { EventCard } from "@/components/event-card";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ArrowIcon } from "@/components/icons";
import { PastEventsList } from "@/components/past-events-list";
import { ScrollReveals } from "@/components/scroll-reveals";
import { SocialSection } from "@/components/social-section";
import { isPastEvent, todayInColombia } from "@/lib/event-content";
import { getEvents } from "@/lib/events";

export const metadata: Metadata = {
  title: "Eventos | Protegiendo Huellas",
  description: "Próximos eventos de la Fundación Protegiendo Huellas: jornadas de adopción, esterilización y encuentros para sumarte a la causa.",
};

// Caché de 5 minutos: además de las ediciones del admin, así un evento pasa
// a "ya pasaron" poco después de que cambia el día en Colombia.
export const revalidate = 300;

export default async function EventsPage() {
  const events = await getEvents();
  const today = todayInColombia();
  const upcoming = events.filter((event) => !isPastEvent(event, today));
  const past = events.filter((event) => isPastEvent(event, today)).reverse();

  return (
    <>
      <a className="skip-link" href="#main">Saltar al contenido</a>
      <Header />
      <ScrollReveals />

      <main id="main">
        <section className="events-hero">
          <div className="container events-hero-grid">
            <div>
              <p className="eyebrow">Eventos</p>
              <h1>Eventos que dejan <span className="highlight">huella</span></h1>
              <p className="hero-copy">Jornadas de adopción, esterilización y encuentros donde puedes conocer a los perritos y sumarte a la causa. Revisa las próximas fechas y acompáñanos.</p>
              <div className="hero-actions">
                <a className="btn btn-primary" href="#proximos-eventos">Ver próximos eventos <ArrowIcon /></a>
              </div>
            </div>

            <div className="events-hero-visual" data-reveal="up">
              <div className="events-hero-photo">
                <Image src="/eventos_hero.webp" alt="Perrito de la Fundación Protegiendo Huellas" fill preload sizes="(max-width: 820px) calc(100vw - 28px), 520px" />
              </div>
              <p className="events-hero-badge">
                <strong>{upcoming.length}</strong>
                <span>{upcoming.length === 1 ? "próximo evento" : "próximos eventos"}</span>
              </p>
            </div>
          </div>
        </section>

        <section className="events-list-section" id="proximos-eventos">
          <div className="container">
            <div data-reveal="up">
              <p className="eyebrow">Agenda</p>
              <h2 className="section-title">Próximos eventos solidarios</h2>
            </div>

            {upcoming.length > 0 ? (
              <div className="events-grid">
                {upcoming.map((event) => <EventCard event={event} key={event.id} />)}
              </div>
            ) : (
              <div className="events-empty">
                <strong>Muy pronto anunciaremos nuevos eventos</strong>
                <span>Síguenos en redes sociales para enterarte primero de las próximas jornadas.</span>
              </div>
            )}
          </div>
        </section>

        {past.length > 0 && (
          <section className="events-list-section events-past-section">
            <div className="container">
              <div data-reveal="up">
                <p className="eyebrow">Así vivimos la causa</p>
                <h2 className="section-title">Eventos que ya pasaron</h2>
              </div>
              <PastEventsList cards={past.map((event) => <EventCard event={event} past key={event.id} />)} />
            </div>
          </section>
        )}

        <SocialSection />
      </main>

      <Footer />
    </>
  );
}
