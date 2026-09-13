import type { Metadata } from "next";
import Image from "next/image";
import { ExploreLinksSection } from "@/components/explore-links-section";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ChatIcon, EmailIcon, HeartIcon, HomeIcon, MegaphoneIcon, PhoneIcon, PinIcon, ScissorsIcon, ShelterPawIcon, StethoscopeIcon } from "@/components/icons";
import { ScrollReveals } from "@/components/scroll-reveals";
import { SocialSection } from "@/components/social-section";
import { whatsappUrl } from "@/lib/contact";

export const metadata: Metadata = {
  title: "La Fundación | Protegiendo Huellas",
  description: "Desde 2019, la Fundación Protegiendo Huellas rescata, rehabilita, esteriliza y encuentra hogares para perritos vulnerables en Paipa, Boyacá.",
};

const FOUNDATION_WHATSAPP_URL = whatsappUrl("Hola, quiero saber más sobre la Fundación Protegiendo Huellas.");

const pillars = [
  {
    title: "Rescate y albergue",
    text: "Acogemos a perritos vulnerables o maltratados, ofreciéndoles un refugio digno, nutrición adecuada y la protección que necesitan mientras encuentran hogares comprometidos y responsables.",
    icon: <ShelterPawIcon />,
  },
  {
    title: "Rehabilitación médica",
    text: "Gracias a alianzas clave con profesionales veterinarios en Boyacá, garantizamos tratamientos médicos, cirugías, vacunas y desparasitación para una pronta recuperación física y comportamental.",
    icon: <StethoscopeIcon />,
  },
  {
    title: "Esterilización",
    text: "Garantizamos la esterilización de los animales rescatados para cortar el ciclo de abandono, contribuyendo activamente al control poblacional en nuestro municipio.",
    icon: <ScissorsIcon />,
  },
  {
    title: "Adopción con amor",
    text: "Evaluamos cuidadosamente las condiciones del hogar receptor para que cada perro llegue a una familia comprometida, lista para brindarle el hogar definitivo que merece.",
    icon: <HomeIcon />,
  },
  {
    title: "Concientización ciudadana",
    text: "Fomentamos el buen trato, el cuidado responsable y la sensibilidad social hacia la fauna urbana y callejera a través de la educación y el ejemplo.",
    icon: <MegaphoneIcon />,
  },
];

export default function FoundationPage() {
  return (
    <>
      <a className="skip-link" href="#main">Saltar al contenido</a>
      <Header />
      <ScrollReveals />

      <main id="main">
        <section className="foundation-hero">
          <div className="container foundation-hero-grid">
            <div>
              <p className="eyebrow">Fundación Protegiendo Huellas · Desde 2019</p>
              <h1>Quiénes <span className="highlight">somos</span></h1>
              <p className="foundation-hero-copy">Desde 2019, en la Fundación Protegiendo Huellas transformamos historias de abandono en relatos de amor. Nacimos en Paipa, Boyacá, con la misión de ser la voz y el refugio de los animales vulnerables, rescatándolos, sanando sus heridas y guiándolos hacia hogares donde reescriban su futuro.</p>
            </div>

            <div className="foundation-hero-logo" data-reveal="up">
              <Image src="/logo.png" alt="Logo de la Fundación Protegiendo Huellas" fill preload sizes="(max-width: 820px) 280px, 440px" />
            </div>
          </div>
        </section>

        <section className="foundation-story-section">
          <div className="container">
            <div className="foundation-story" data-reveal="up">
              <p>Dejar huella significa para nosotros actuar con empatía: rescatamos, rehabilitamos, esterilizamos, gestionamos hogares responsables y educamos a nuestra comunidad para construir un entorno de respeto y buen trato.</p>
              <p>Gracias a la alianza con personas de noble corazón, voluntarios y colectivos que comparten nuestra causa, seguimos mejorando la calidad de vida de los animales vulnerables en Paipa y promoviendo una cultura de respeto, empatía y tenencia responsable.</p>
            </div>

            <blockquote className="foundation-quote" data-reveal="up">
              <HeartIcon />
              <p>Porque cambiar la historia de un animal no cambiará el mundo, pero para ese animal, su mundo cambiará para siempre.</p>
            </blockquote>
          </div>
        </section>

        <section className="foundation-pillars-section">
          <div className="container">
            <div data-reveal="up">
              <p className="eyebrow">Lo que hacemos</p>
              <h2 className="section-title">Nuestros pilares de acción</h2>
            </div>

            <ol className="foundation-pillars">
              {pillars.map((pillar, index) => (
                <li className="foundation-pillar" key={pillar.title} data-reveal="up">
                  <span className="foundation-pillar-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <span className="foundation-pillar-icon" aria-hidden="true">{pillar.icon}</span>
                  <h3>{pillar.title}</h3>
                  <p>{pillar.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="foundation-founder-section">
          <div className="container foundation-founder">
            <div className="foundation-founder-visual" data-reveal="up">
              <div className="foundation-founder-photo">
                <Image src="/yazmid.jpeg" alt="Yazmid Navarro Matoma, fundadora y directora de Protegiendo Huellas" fill sizes="(max-width: 820px) calc(100vw - 28px), 560px" />
              </div>
              <p className="foundation-founder-tag">
                <strong>Yazmid Navarro Matoma</strong>
                <span>Fundadora y Directora</span>
              </p>
            </div>

            <div data-reveal="up">
              <p className="eyebrow">Quien lidera la causa</p>
              <h2 className="section-title">Yazmid Navarro Matoma</h2>
              <p className="foundation-founder-copy">Fundadora y Directora de Protegiendo Huellas, es una líder comunitaria, defensora incansable y una soñadora que convirtió su amor por los animales en un propósito de vida.</p>
              <p className="foundation-founder-copy">Con entrega y vocación, Yazmid lidera la atención de caninos en vulnerabilidad y promueve iniciativas que transforman la cultura de respeto y bienestar animal en Paipa, Boyacá.</p>
              <p className="foundation-founder-highlight">Su motor diario es recordar que siempre es posible cambiar realidades y dejar una huella de esperanza.</p>
            </div>
          </div>
        </section>

        <ExploreLinksSection />

        <SocialSection />

        <section className="foundation-contact-section" id="contacto">
          <div className="container">
            <div className="foundation-contact" data-reveal="up">
              <p className="eyebrow">Contacto</p>
              <h2>¿Quieres saber más de la fundación?</h2>
              <p>Escríbenos y con gusto te contamos cómo trabajamos, cómo puedes ayudar o resolvemos cualquier duda.</p>
              <a className="btn btn-primary" href={FOUNDATION_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                Escríbenos por WhatsApp <ChatIcon />
              </a>

              <div className="foundation-contact-details">
                <a href="tel:+573227464595"><PhoneIcon /><span><strong>Teléfono</strong>322 746 4595</span></a>
                <a href="mailto:fundacionprotegiendohuellas@gmail.com"><EmailIcon /><span><strong>Email</strong>fundacionprotegiendohuellas@gmail.com</span></a>
                <p><PinIcon /><span><strong>Ubicación</strong>Paipa, Boyacá, Colombia</span></p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
