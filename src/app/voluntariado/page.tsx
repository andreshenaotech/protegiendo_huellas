import type { Metadata } from "next";
import Image from "next/image";
import { EventsIntroSection } from "@/components/events-intro-section";
import { ExploreLinksSection } from "@/components/explore-links-section";
import { type Faq, FaqSection } from "@/components/faq-section";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ArrowIcon, BriefcaseIcon, CalendarIcon, ChatIcon, GlobeIcon, HeartIcon, HomeIcon, SearchIcon, ShelterPawIcon } from "@/components/icons";
import { ScrollReveals } from "@/components/scroll-reveals";
import { whatsappUrl } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Voluntariado | Protegiendo Huellas",
  description: "Hazte voluntario de la Fundación Protegiendo Huellas: ayuda en el refugio en Paipa, a distancia, como hogar de paso, en eventos o con tu oficio.",
};

const VOLUNTEER_WHATSAPP_URL = whatsappUrl("Hola, quiero ser voluntario de la Fundación Protegiendo Huellas.");
const FOSTER_WHATSAPP_URL = whatsappUrl("Hola, quiero ser hogar de paso para un peludo de la Fundación Protegiendo Huellas.");

const roles = [
  {
    title: "En el refugio en Paipa",
    text: "Pasear, bañar, alimentar y consentir a los animales; o colaborar con mano de obra o labores de mantenimiento del refugio como reparaciones, construcción y corte de pasto.",
    icon: <ShelterPawIcon />,
  },
  {
    title: "A distancia",
    text: "Redes, difusión de casos, diseño, gestión, marketing. Desde cualquier lugar.",
    icon: <GlobeIcon />,
  },
  {
    title: "Hogar de paso",
    text: "Acoger temporalmente a un peludo mientras consigue hogar definitivo.",
    icon: <HomeIcon />,
  },
  {
    title: "En eventos",
    text: "Eventos, jornadas de adopción y de esterilización.",
    icon: <CalendarIcon />,
  },
  {
    title: "VolunPro",
    text: "Veterinarios, abogados, contadores, fotógrafos, y personas con carreras administrativas que donan su talento a la causa.",
    icon: <BriefcaseIcon />,
  },
];

const requirements = [
  "Ser mayor de edad (18 años).",
  "Ganas reales de ayudar y compromiso con el bienestar animal.",
  "Responsabilidad y trato respetuoso.",
];

const joinSteps = [
  { text: "Escríbenos por WhatsApp y cuéntanos cómo te gustaría ayudar.", icon: <ChatIcon /> },
  { text: "Conversamos para conocerte y ver en qué rol encajas mejor.", icon: <SearchIcon /> },
  { text: "Te damos la bienvenida y empiezas a sumar por los peludos.", icon: <HeartIcon /> },
];

const faqs: Faq[] = [
  {
    question: "¿Necesito experiencia para ser voluntario?",
    answer: "No. Solo necesitas ganas de ayudar y compromiso con el bienestar animal. Nosotros te enseñamos y te acompañamos en lo que haga falta.",
  },
  {
    question: "¿Puedo ser voluntario si no vivo en Paipa?",
    answer: "Claro que sí. Muchas de nuestras necesidades son a distancia: manejar redes, difundir casos, diseñar o apoyar en gestión. Puedes ayudar desde donde estés.",
  },
  {
    question: "¿Hay una edad mínima?",
    answer: "Sí, para ser voluntario debes ser mayor de edad (18 años).",
  },
  {
    question: "¿Cuánto tiempo tengo que dedicar?",
    answer: "El que puedas. Hay actividades para todos los ritmos, desde una jornada puntual hasta un apoyo constante. Tú decides según tu disponibilidad.",
  },
  {
    question: "¿Qué hacen los voluntarios en el refugio?",
    answer: "Pasear a los perros, bañarlos, alimentarlos, jugar con ellos y, sobre todo, darles cariño y compañía para que recuperen la confianza en las personas.",
  },
  {
    question: "¿Puedo ayudar solo en un evento o jornada?",
    answer: "Sí. Puedes sumarte a eventos, jornadas de adopción o de esterilización sin un compromiso permanente. Toda ayuda cuenta.",
  },
  {
    question: "Tengo un oficio, ¿cómo ayudo?",
    answer: "Tu talento vale muchísimo. Puedes donar tu oficio para apoyar la salud o la gestión de la Fundación. Escríbenos y vemos cómo sumar lo que sabes hacer.",
  },
  {
    question: "¿Qué implica ser hogar de paso?",
    answer: <>Recibes en tu casa a un animal por un tiempo, mientras le buscamos un hogar definitivo. Como hogar de paso te comprometes a darle su alimentación y sus cuidados diarios: cariño, aseo y un espacio seguro. La parte médica la gestiona la Fundación cuando se requiere, y hacemos lo posible por apoyarte también con el alimento. Cuando son cachorros en adopción, nosotros llevamos todo el proceso para que lleguen a hogares responsables. Nunca estás solo, te acompañamos durante todo el proceso (mira la sección <a href="#hogar-de-paso">Hogar de paso</a>).</>,
  },
  {
    question: "¿Ser voluntario tiene algún costo o pago?",
    answer: "Ser voluntario no cuesta nada, y tampoco es un trabajo remunerado. Es un acto de amor: tu recompensa es ver a un animal recuperarse y encontrar un hogar.",
  },
  {
    question: "¿Podemos ir en grupo (familia, colegio o empresa)?",
    answer: "Sí. Recibimos grupos que quieren vivir la experiencia juntos. Solo escríbenos con anticipación por WhatsApp para coordinar.",
  },
  {
    question: "¿Cómo me inscribo?",
    answer: "Escríbenos por WhatsApp y cuéntanos cómo te gustaría ayudar. Conversamos, vemos en qué rol encajas mejor y te damos la bienvenida.",
  },
];

export default function VolunteerPage() {
  return (
    <>
      <a className="skip-link" href="#main">Saltar al contenido</a>
      <Header />
      <ScrollReveals />

      <main id="main">
        <section className="hero sponsor-hero volunteer-hero">
          <div className="container hero-grid">
            <div className="hero-content">
              <p className="eyebrow">Voluntariado</p>
              <h1>Hazte <span className="highlight">voluntario</span></h1>
              <p className="hero-copy">Detrás de cada rescate hay manos que ayudan. Con tu tiempo, tu oficio o tu casa, puedes cambiar la vida de un animal. ¡Desde donde estés!</p>
              <div className="hero-actions">
                <a className="btn btn-primary" href="#como-me-uno">Quiero ser voluntario <ArrowIcon /></a>
              </div>
            </div>

            <div className="volunteer-hero-circle" data-reveal="left">
              <Image
                src="/Hazte_volun.webp"
                alt="Perrito de la Fundación Protegiendo Huellas"
                fill
                preload
                sizes="(max-width: 820px) 80vw, 620px"
              />
            </div>
          </div>
        </section>

        <section className="sponsor-why-section">
          <div className="container volunteer-split">
            <div data-reveal="left">
              <p className="eyebrow">Voluntariado</p>
              <h2 className="section-title">¿Por qué ser voluntario?</h2>

              <div className="sponsor-why">
                <p>Un refugio solo se sostiene sumando esfuerzos de personas que deseen colaborar a la causa animal. Cada paseo, cada baño, cada publicación difundida y cada hogar temporal suma para que un peludo tenga una segunda oportunidad.</p>
                <p>Ser voluntario no exige experiencia ni horarios imposibles, solo ganas de ayudar.</p>
                <p className="sponsor-why-highlight">Tú decides cómo y cuánto, y nosotros te mostramos dónde tu ayuda hace la diferencia.</p>
              </div>
            </div>

            <div className="volunteer-why-visual" data-reveal="right">
              <div className="volunteer-why-photo">
                <Image
                  src="/porque_volun.webp"
                  alt="Perrito del refugio de la Fundación Protegiendo Huellas"
                  fill
                  sizes="(max-width: 820px) 80vw, 440px"
                />
              </div>
              <p className="volunteer-why-badge"><strong>Sin experiencia</strong><span>solo ganas de ayudar</span></p>
            </div>
          </div>
        </section>

        <section className="volunteer-roles-section">
          <div className="container">
            <div data-reveal="up">
              <p className="eyebrow">Elige tu forma de ayudar</p>
              <h2 className="section-title">Formas de ser voluntario</h2>
            </div>

            <div className="volunteer-roles" data-reveal="up">
              {roles.map((role) => (
                <article className="volunteer-role" key={role.title}>
                  <span className="step-icon" aria-hidden="true">{role.icon}</span>
                  <h3>{role.title}</h3>
                  <p>{role.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="sponsor-benefits-section">
          <div className="container sponsor-benefits">
            <div data-reveal="left">
              <p className="eyebrow">Antes de empezar</p>
              <h2 className="section-title">Requisitos</h2>
            </div>
            <div className="sponsor-benefits-card" data-reveal="right">
              <ul className="check-list">
                {requirements.map((requirement) => <li key={requirement}>{requirement}</li>)}
              </ul>
              <p className="sponsor-benefits-certainty">
                <HeartIcon />
                <span>No se necesita experiencia previa.</span>
              </p>
            </div>
          </div>
        </section>

        <section className="process-section sponsor-steps-section" id="como-me-uno">
          <div className="container">
            <div data-reveal="up">
              <p className="eyebrow">Súmate</p>
              <h2 className="section-title">¿Cómo me uno?</h2>
            </div>
            <div className="process-grid volunteer-steps" data-reveal="up">
              {joinSteps.map((step, index) => (
                <article className="process-card" key={step.text}>
                  <span className="step-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <span className="step-icon" aria-hidden="true">{step.icon}</span>
                  <h3>{step.text}</h3>
                </article>
              ))}
            </div>
            <div className="volunteer-join-footer" data-reveal="up">
              <p className="sponsor-steps-note">
                <strong>No importa si tienes una hora al mes o una tarde entera, aquí todo suma.</strong> ¡Los animales solo necesitan que te quieras unir!
              </p>
              <a className="btn btn-light" href={VOLUNTEER_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                Escríbenos por WhatsApp <ChatIcon />
              </a>
            </div>
          </div>
        </section>

        <section className="sponsor-why-section" id="hogar-de-paso">
          <div className="container volunteer-split volunteer-split-media-first">
            <div className="volunteer-foster-visual" data-reveal="left">
              <span className="volunteer-foster-blob" aria-hidden="true" />
              <div className="volunteer-foster-photo">
                <Image
                  src="/hogar_paso.webp"
                  alt="Perrito en un hogar de paso"
                  fill
                  sizes="(max-width: 820px) 80vw, 440px"
                />
              </div>
              <p className="volunteer-foster-seal"><HomeIcon /><span>Hogar de paso</span></p>
            </div>

            <div data-reveal="right">
              <p className="eyebrow">Voluntariado</p>
              <h2 className="section-title">Hogar de paso</h2>

              <div className="sponsor-why">
                <p>Abre tu casa temporalmente a un peludo mientras encuentra su hogar definitivo.</p>
              </div>

              <div className="volunteer-foster-split">
                <div>
                  <span>Tú te comprometes</span>
                  <p>Con su alimentación y cuidados diarios.</p>
                </div>
                <div>
                  <span>La Fundación</span>
                  <p>Gestiona la parte médica cuando se necesita y te apoya con alimento en la medida de lo posible.</p>
                </div>
              </div>

              <p className="volunteer-foster-note">Si se trata de cachorros para adopción, la Fundación se encarga de todo el proceso para asegurar que queden en hogares responsables.</p>

              <a className="btn btn-primary volunteer-foster-button" href={FOSTER_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                Quiero ser hogar de paso <ChatIcon />
              </a>
            </div>
          </div>
        </section>

        <ExploreLinksSection variant="compact" exclude={["voluntariado"]} />

        <FaqSection eyebrow="Voluntariado" faqs={faqs} />

        <EventsIntroSection />
      </main>

      <Footer />
    </>
  );
}
