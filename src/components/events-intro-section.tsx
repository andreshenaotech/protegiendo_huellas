import { CalendarIcon } from "@/components/icons";

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
            {/* Pendiente: enlazar a la sección de próximos eventos cuando exista. */}
            <div className="events-intro-actions">
              <button className="btn btn-light" type="button" disabled aria-describedby="events-coming-soon">
                Próximos eventos
              </button>
              <span className="events-intro-soon" id="events-coming-soon">Muy pronto</span>
            </div>
          </div>

          <div className="events-intro-visual" aria-hidden="true">
            <span className="events-intro-icon"><CalendarIcon /></span>
          </div>
        </div>
      </div>
    </section>
  );
}
