import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { ExploreLinksSection } from "@/components/explore-links-section";
import { type Faq, FaqSection } from "@/components/faq-section";
import { Header } from "@/components/header";
import { ArrowIcon, BowlIcon, ChatIcon, HeartIcon, PhoneIcon, PillIcon, SearchIcon, StethoscopeIcon, SyringeIcon } from "@/components/icons";
import { ScrollReveals } from "@/components/scroll-reveals";
import { SocialSection } from "@/components/social-section";
import { whatsappUrl } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Apadrinamiento | Protegiendo Huellas",
  description: "Apadrina a un perrito de la Fundación Protegiendo Huellas con un aporte mensual desde $500 al día, o ayúdanos a recibir a un animal rescatado.",
};

const money = new Intl.NumberFormat("es-CO");

const plans = [
  { name: "Huella Amiga", daily: 500, monthly: 15000, contribution: "Cuidados básicos de tu apadrinado" },
  { name: "Huella Guardiana", daily: 1000, monthly: 30000, contribution: "Parte de la alimentación de tu apadrinado" },
  { name: "Huella Protectora", daily: 2000, monthly: 60000, contribution: "Alimentación completa de tu apadrinado" },
  { name: "Huella Héroe", daily: 5000, monthly: 150000, contribution: "Alimentación, atención veterinaria, desparasitación y vacunación" },
];

const steps = [
  { title: "Elige a quién apadrinar", text: "Un peludo específico del refugio o una causa, como una esterilización.", icon: <SearchIcon /> },
  { title: "Escoge cuánto aportar", text: "Desde $500 al día. Tú decides el nivel que se ajusta a ti.", icon: <HeartIcon /> },
  { title: "Haz tu aporte cada mes", text: "Por Nequi, Daviplata o transferencia bancaria. Fácil y seguro.", icon: <PhoneIcon /> },
  { title: "Recibe a tu apadrinado en tu vida", text: "Te damos la bienvenida con su certificado y empiezas a seguir su historia.", icon: <ChatIcon /> },
];

// Lo que cubre el aporte mensual del Programa 2.
const intakeCoverage = [
  { title: "Alimentación", icon: <BowlIcon /> },
  { title: "Atención veterinaria", icon: <StethoscopeIcon /> },
  { title: "Vacunas", icon: <SyringeIcon /> },
  { title: "Desparasitación", icon: <PillIcon /> },
];

const benefits = [
  "Fotos y videos de tu apadrinado, para verlo crecer y mejorar.",
  "Tu certificado de padrino, con tu nombre y el de tu perrito.",
  "Visitas al refugio, para conocer, pasear y consentir a tu peludo.",
  "Un lugar en nuestra comunidad, con menciones y agradecimientos en redes.",
];

const faqs: Faq[] = [
  {
    question: "¿Qué es apadrinar?",
    answer: "Es apoyar a un animal del refugio con un aporte mensual, sin llevártelo a casa. Sigue viviendo con nosotros, cuidado y protegido, y tú acompañas su historia de cerca.",
  },
  {
    question: "¿Es lo mismo que adoptar?",
    answer: "No. Adoptar es recibir al animal en tu hogar de forma permanente. Apadrinar es acompañarlo a la distancia con tu aporte. Eso sí, si con el tiempo haces una fuerte conexión con tu apadrinado y quieres adoptarlo, tienes prioridad para iniciar este proceso.",
  },
  {
    question: "¿Desde cuánto puedo apadrinar?",
    answer: <>En el programa “Padrino Solidario” puedes apadrinar desde $500 al día. Tú eliges el nivel que se ajuste a ti. También puedes hacer un aporte único de $80.000 pesos para cubrir una esterilización de un animal que lo necesite. En el programa “Padrino de Ingreso” debes comprometerte con un monto mensual que cubra todas las necesidades básicas del animal al que deseas ayudar (mira la sección <a href="#padrino-de-ingreso">Padrino de Ingreso</a>).</>,
  },
  {
    question: "¿Puedo elegir a qué animal apadrino en el programa Padrino Solidario?",
    answer: <>Sí. Puedes <Link href="/perritos">conocer a los perritos</Link> y escoger al que te robe el corazón. Si prefieres, también podemos sugerirte uno de los que más lo necesitan.</>,
  },
  {
    question: "Rescaté o encontré un animal en la calle, ¿pueden recibirlo?",
    answer: "Queremos ayudarte. Cada caso se evalúa según el estado del animal y el cupo disponible, así que lo primero es escribirnos por WhatsApp y contarnos. Si podemos recibirlo, quien lo ingresa se convierte en su padrino de rescate: se compromete con un aporte de $150.000 al mes que cubre alimentación, atención veterinaria, vacunas y desparasitación, hasta que el animal consiga un hogar definitivo. Es distinto al apadrinamiento solidario, porque aquí sí hay un compromiso mensual mientras el peludo está con nosotros.",
  },
  {
    question: "¿Cómo hago mi aporte?",
    answer: "Por Nequi, Daviplata o transferencia bancaria, el mismo día de cada mes. Luego nos envías el comprobante por WhatsApp y ¡listo!",
  },
  {
    question: "¿Tengo que comprometerme por un tiempo mínimo en el programa Padrino Solidario?",
    answer: <>Como padrino solidario, no: puedes pausar o cancelar cuando quieras, sin explicaciones. Si ingresas a un animal que rescataste, sí existe un compromiso mensual mientras consigue hogar; lo explicamos en la sección <a href="#padrino-de-ingreso">Padrino de Ingreso</a>.</>,
  },
  {
    question: "¿Qué recibo como padrino?",
    answer: "Fotos y videos de tu apadrinado una vez al mes, tu certificado de padrino, la posibilidad de visitarlo y menciones de agradecimiento en nuestras redes.",
  },
  {
    question: "¿Puedo visitar a mi apadrinado?",
    answer: "Sí, con mucho gusto. Solo coordina tu visita con nosotros por WhatsApp y te recibimos en el refugio.",
  },
  {
    question: "¿Cada cuánto sé del perrito?",
    answer: "Te enviamos novedades una vez al mes por WhatsApp, para que lo veas crecer, sanar y estar feliz.",
  },
  {
    question: "¿A dónde va mi dinero?",
    answer: "El 100% se destina al cuidado de los animales: comida, salud y esterilizaciones. Cada peso se convierte en bienestar para ellos.",
  },
  {
    question: "¿Me dan un certificado para deducir de impuestos?",
    answer: "Sí. Somos una entidad legalmente constituida y podemos emitirte un certificado de donación. Solo pídelo cuando hagas tu aporte.",
  },
  {
    question: "¿Puedo apadrinar si vivo fuera de Colombia?",
    answer: "Claro que sí. Escríbenos por WhatsApp y coordinamos juntos la mejor forma de recibir tu apoyo desde el exterior.",
  },
  {
    question: "¿Qué pasa si adoptan a mi apadrinado?",
    answer: "Es la mejor noticia posible: significa que encontró un hogar. Cuando eso pase, puedes seguir acompañando a otro peludo que te espera, o incluso ser tú quien lo adopte.",
  },
  {
    question: "¿Y si mi apadrinado enferma o fallece?",
    answer: "Hacemos todo lo posible por su bienestar. Si algo llegara a pasarle, te lo contamos con cariño y, si lo deseas, te presentamos a otro peludo para que sigas cambiando vidas.",
  },
  {
    question: "¿Mi familia o mi empresa pueden apadrinar juntos?",
    answer: "Sí. Amigos, familias, salones o empresas pueden unirse para apadrinar a un peludo y dividir el aporte. Es una linda forma de sumar a más personas.",
  },
];

const INTAKE_WHATSAPP_URL = whatsappUrl("Hola, vi un animal que necesita ayuda y quiero ingresarlo a la fundación como Padrino de Ingreso.");

function planWhatsappUrl(plan: (typeof plans)[number]) {
  const message = `Hola, quiero ser Padrino Solidario con el plan ${plan.name} ($${money.format(plan.monthly)} al mes).`;
  return whatsappUrl(message);
}

export default function SponsorshipPage() {
  return (
    <>
      <a className="skip-link" href="#main">Saltar al contenido</a>
      <Header />
      <ScrollReveals />

      <main id="main">
        <section className="hero sponsor-hero">
          <div className="container hero-grid">
            <div className="hero-content">
              <p className="eyebrow">Apadrinamiento</p>
              <h1>Apadrina una <span className="highlight">huella</span></h1>
              <p className="hero-copy">Apadrinar es acompañar a un animal con un aporte mensual, sin llevártelo a casa. Él sigue con nosotros, cuidado y protegido, y tú sigues de cerca su historia.</p>
            </div>

            <div className="sponsor-hero-visual" data-reveal="right">
              <Image
                src="/dog1.png"
                alt="Perrito de la Fundación Protegiendo Huellas"
                fill
                preload
                sizes="(max-width: 820px) calc(100vw - 28px), 520px"
              />
            </div>
          </div>
        </section>

        <section className="sponsor-paths-section">
          <div className="container">
            <div data-reveal="up">
              <p className="eyebrow">Súmate</p>
              <h2 className="section-title">¿Cómo te quieres unir?</h2>
            </div>

            <div className="sponsor-paths" data-reveal="up">
              <article className="sponsor-path sponsor-path-featured">
                <span className="sponsor-path-tag">Programa 1 · Padrino Solidario</span>
                <h3>Quiero ayudar a un perrito del refugio</h3>
                <p>Únete al programa Padrino Solidario y acompaña con un aporte flexible, desde $500 al día, a uno de los animales que ya cuidamos.</p>
                <a className="btn btn-light" href="#padrino-solidario">Apadrinar <ArrowIcon /></a>
              </article>

              <article className="sponsor-path">
                <span className="sponsor-path-tag">Programa 2 · Padrino de Ingreso</span>
                <h3>Rescaté o vi un animal y quiero ayudarlo</h3>
                <p>Súmate al programa Padrino de Ingreso y ayúdanos a recibir al animalito como su padrino de rescate.</p>
                <a className="btn btn-primary" href="#padrino-de-ingreso">Escríbenos <ArrowIcon /></a>
              </article>
            </div>
          </div>
        </section>

        <section className="sponsor-why-section" id="padrino-solidario">
          <div className="container sponsor-program">
            {/* Imagen provisional: reemplazar por una foto propia del programa. */}
            <div className="sponsor-program-visual" data-reveal="left">
              <div className="sponsor-program-photo">
                <Image
                  src="/dog1.png"
                  alt="Perrito apadrinado en la Fundación Protegiendo Huellas"
                  fill
                  sizes="(max-width: 820px) calc(100vw - 28px), 460px"
                />
              </div>
              <p className="sponsor-program-badge"><strong>Desde $500</strong><span>al día</span></p>
            </div>

            <div data-reveal="right">
              <p className="eyebrow">Programa 1</p>
              <h2 className="section-title">Padrino Solidario</h2>

              <div className="sponsor-why">
                <h3>¿Por qué apadrinar?</h3>
                <p>Cada animal que rescatamos llega con hambre, miedo o heridas, y detrás de su recuperación hay comida, veterinario y cuidados que no paran ni un día. Apadrinar es lo que hace posible que ese cuidado no se detenga.</p>
                <p>No necesitas llevarte un animal a casa ni cambiar tu vida: con un aporte pequeño y constante le das a un peludo algo que perdió en la calle, alguien que responde por él.</p>
                <p className="sponsor-why-highlight">Es la forma más sencilla, y más bonita, de salvar una vida sin salir de la tuya.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="process-section sponsor-steps-section">
          <div className="container">
            <div data-reveal="up">
              <p className="eyebrow">¿Cómo funciona?</p>
              <h2 className="section-title">En cuatro pasos</h2>
            </div>
            <div className="process-grid sponsor-steps" data-reveal="up">
              {steps.map((step, index) => (
                <article className="process-card" key={step.title}>
                  <span className="step-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <span className="step-icon" aria-hidden="true">{step.icon}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              ))}
            </div>
            <p className="sponsor-steps-note" data-reveal="up">
              <strong>Puedes pausar o cancelar cuando quieras.</strong> Apadrinar es un acto de amor, no un compromiso que te ate.
            </p>
          </div>
        </section>

        <section className="sponsor-benefits-section">
          <div className="container sponsor-benefits">
            <div data-reveal="left">
              <p className="eyebrow">¿Qué recibes tú?</p>
              <h2 className="section-title">Apadrinar es dar, pero también recibes mucho a cambio</h2>
            </div>
            <div className="sponsor-benefits-card" data-reveal="right">
              <ul className="check-list">
                {benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}
              </ul>
              <p className="sponsor-benefits-certainty">
                <HeartIcon />
                <span>La certeza de que, gracias a ti, un animal come, sana y está a salvo hoy.</span>
              </p>
            </div>
          </div>
        </section>

        <section className="sponsor-plans-section">
          <div className="container">
            <div data-reveal="up">
              <p className="eyebrow">Planes</p>
              <h2 className="section-title">Elige cómo acompañar a tu apadrinado</h2>
            </div>

            <div className="sponsor-plans" data-reveal="up">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Nivel</th>
                    <th scope="col">Al día</th>
                    <th scope="col">Al mes</th>
                    <th scope="col">A qué contribuye</th>
                    <th scope="col"><span className="sr-only">Elegir plan</span></th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map((plan) => (
                    <tr key={plan.name}>
                      <th scope="row"><span className="sponsor-plan-name"><HeartIcon /> {plan.name}</span></th>
                      <td data-label="Al día">${money.format(plan.daily)}</td>
                      <td data-label="Al mes"><strong>${money.format(plan.monthly)}</strong></td>
                      <td data-label="A qué contribuye">{plan.contribution}</td>
                      <td>
                        <a className="btn btn-primary sponsor-plan-button" href={planWhatsappUrl(plan)} target="_blank" rel="noopener noreferrer">
                          Elegir plan
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="sponsor-sterilization" data-reveal="up">
              <div className="sponsor-sterilization-amount">
                <span>Aporte único</span>
                <strong>$80.000</strong>
                <span>cubre una cirugía de esterilización</span>
              </div>
              <div className="sponsor-sterilization-copy">
                <p className="eyebrow">El corazón de nuestra misión</p>
                <p>La esterilización es el corazón de la misión de Protegiendo Huellas: evitamos más camadas en calle y animales en situación de abandono. También puedes apoyar esta causa con un aporte único de $80.000 pesos que cubre una cirugía de esterilización para un animal necesitado.</p>
                <p className="sponsor-sterilization-milestone">
                  <strong>+500</strong>
                  <span>esterilizaciones realizadas por la fundación, y seguimos sumando</span>
                </p>
                <Link className="btn btn-light" href="/#donaciones">Donar salva vidas <ArrowIcon /></Link>
              </div>
            </div>
          </div>
        </section>

        <section className="sponsor-why-section sponsor-intake-section" id="padrino-de-ingreso">
          <div className="container sponsor-program sponsor-program-reverse">
            <div data-reveal="left">
              <p className="eyebrow">Programa 2</p>
              <h2 className="section-title">Padrino de Ingreso</h2>

              <div className="sponsor-why">
                <h3>¿Rescataste a un peludo?</h3>
                <p>Si viste a un peludo en situación de calle, herido o en peligro, y quieres que la Fundación lo reciba, puedes ingresarlo como su padrino de rescate.</p>
                <p className="sponsor-why-highlight">Así garantizamos que cada peludo que entra tenga todo lo que necesita, sin desatender a los que ya están con nosotros.</p>
              </div>
            </div>

            {/* Imagen provisional: reemplazar por una foto propia del programa. */}
            <div className="sponsor-program-visual" data-reveal="right">
              <div className="sponsor-program-photo">
                <Image
                  src="/dog1.png"
                  alt="Perrito rescatado en la Fundación Protegiendo Huellas"
                  fill
                  sizes="(max-width: 820px) calc(100vw - 28px), 460px"
                />
              </div>
              <p className="sponsor-program-badge"><strong>Padrino</strong><span>de rescate</span></p>
            </div>
          </div>
        </section>

        <section className="process-section sponsor-steps-section">
          <div className="container">
            <div className="sponsor-commitment-heading" data-reveal="up">
              <div>
                <p className="eyebrow">El compromiso</p>
                <h2 className="section-title">Lo acompañas hasta que encuentre un hogar definitivo</h2>
                <p className="section-copy">Como el refugio ya cuida a más de 100 animales, quien ingresa a un rescatado se compromete a sostenerlo con un aporte de $150.000 al mes, que cubre su alimentación, atención veterinaria, vacunas y desparasitación, mientras le buscamos un hogar definitivo.</p>
              </div>
              <p className="sponsor-commitment-amount">
                <strong>$150.000</strong>
                <span>al mes</span>
              </p>
            </div>
            <div className="process-grid sponsor-steps sponsor-coverage" data-reveal="up">
              {intakeCoverage.map((item) => (
                <article className="process-card" key={item.title}>
                  <span className="step-icon" aria-hidden="true">{item.icon}</span>
                  <h3>{item.title}</h3>
                </article>
              ))}
            </div>
            <p className="sponsor-steps-note" data-reveal="up">
              <strong>El compromiso se mantiene hasta que el animal sea adoptado.</strong>
            </p>
          </div>
        </section>

        <section className="sponsor-benefits-section">
          <div className="container sponsor-benefits">
            <div data-reveal="left">
              <p className="eyebrow">Padrino de Ingreso</p>
              <h2 className="section-title">¿Qué recibes tú?</h2>
            </div>
            <div className="sponsor-benefits-card" data-reveal="right">
              <ul className="check-list">
                {benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}
              </ul>
              <p className="sponsor-benefits-certainty">
                <HeartIcon />
                <span>La certeza de que, gracias a ti, el animal come, sana y está a salvo hoy.</span>
              </p>
            </div>
          </div>
        </section>

        <section className="sponsor-plans-section sponsor-intake-cta-section">
          <div className="container">
            <div className="sponsor-intake-cta" data-reveal="up">
              <span className="step-icon" aria-hidden="true"><ChatIcon /></span>
              <div>
                <p className="eyebrow">Cuéntanos su historia</p>
                <p className="sponsor-intake-cta-text">Cada caso se evalúa según el estado del animal y el cupo disponible. Escríbenos por WhatsApp, cuéntanos la historia y lo coordinamos juntos.</p>
              </div>
              <a className="btn btn-light" href={INTAKE_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                Contáctanos <ArrowIcon />
              </a>
            </div>
          </div>
        </section>

        <ExploreLinksSection variant="compact" exclude={["apadrina"]} />

        <FaqSection eyebrow="Apadrinamiento" faqs={faqs} />

        <SocialSection />
      </main>

      <Footer />
    </>
  );
}
