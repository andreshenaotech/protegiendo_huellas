import Image from "next/image";
import Link from "next/link";
import { ArrowIcon } from "@/components/icons";

const eventTypes = ["Jornadas de adopción", "Jornadas de esterilización", "Eventos de la fundación"];

// Introducción a los próximos eventos. Se usa en la landing y en /voluntariado.
export function EventsIntroSection() {
  return (
    <section className="events-intro-section" id="eventos">
      <div className="container">
        <div className="events-intro-card" data-reveal="up">
          <div className="events-intro-copy">
            <p className="eyebrow">Eventos</p>
            <h2>Vive la causa con nosotros</h2>
            <p>Organizamos jornadas y encuentros donde puedes conocer a los perritos, sumarte como voluntario y ayudar a que más peludos encuentren un hogar. Participa, invita a tu familia y a tus amigos: cada persona que llega suma.</p>
            <ul className="events-intro-types" aria-label="Tipos de eventos">
              {eventTypes.map((type) => <li key={type}>{type}</li>)}
            </ul>
            <div className="events-intro-actions">
              <Link className="btn btn-light" href="/eventos">Próximos eventos <ArrowIcon /></Link>
            </div>
          </div>

          {/* Imagen provisional: reemplazar por una foto propia de eventos. */}
          <div className="events-intro-visual">
            <div className="events-intro-photo">
              <Image src="/dog1.png" alt="" fill sizes="(max-width: 820px) 240px, 360px" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
