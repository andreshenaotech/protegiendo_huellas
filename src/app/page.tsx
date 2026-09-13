import Image from "next/image";
import Link from "next/link";
import { DogPreviewSection } from "@/components/dog-preview-section";
import { EventsIntroSection } from "@/components/events-intro-section";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ArrowIcon, ChatIcon, EmailIcon, FacebookIcon, HeartIcon, PhoneIcon, PinIcon, SearchIcon } from "@/components/icons";
import { ScrollReveals } from "@/components/scroll-reveals";
import { SocialSection } from "@/components/social-section";
import { isAdopted } from "@/lib/dog-content";
import { getPublishedDogs } from "@/lib/dogs";

// Página estática con revalidación: las ediciones del admin invalidan la caché
// al instante (updateTag) y este intervalo cubre cambios hechos fuera de la app.
export const revalidate = 300;

export default async function Home() {
  const dogs = (await getPublishedDogs()).filter((dog) => !isAdopted(dog));

  return (
    <>
      <a className="skip-link" href="#main">Saltar al contenido</a>
      <Header />
      <ScrollReveals />

      <main id="main">
        <section className="hero" id="inicio">
          <div className="container hero-grid">
            <div className="hero-content">
              <p className="eyebrow">Perritos en adopción · Paipa</p>
              <h1>Tu nuevo mejor <span className="highlight">amigo</span> te espera.</h1>
              <p className="hero-copy">Abre las puertas de tu hogar a una historia que merece un final feliz. Conoce a nuestros perritos, enamórate y cambia dos vidas para siempre.</p>
              <div className="hero-actions">
                <Link className="btn btn-primary" href="/perritos">Conocer perritos <ArrowIcon /></Link>
                <Link className="btn btn-outline" href="/apadrinamiento">¿Cómo puedo ayudar?</Link>
              </div>
              <div className="hero-trust" aria-label="Información importante">
                <span>Adopción responsable</span>
                <span>Acompañamiento cercano</span>
              </div>
            </div>

            <div className="hero-visual" aria-hidden="true">
              <Image
                className="hero-dog"
                src="/dog_hero.png"
                alt=""
                width={1200}
                height={1500}
                preload
                sizes="(max-width: 820px) 660px, 730px"
                style={{ height: "auto" }}
              />
              <div className="hero-badge"><div><strong>{dogs.length}</strong><span>corazones esperando</span></div></div>
            </div>
          </div>
        </section>

        <div className="container stats-wrap" aria-label="Cifras de adopción" data-reveal="up">
          <div className="stats">
            <div className="stat"><strong>{dogs.length}</strong><span>Perritos en adopción</span></div>
            <div className="stat"><strong>100%</strong><span>Esterilizados o castrados</span></div>
            <div className="stat"><strong>Paipa</strong><span>Boyacá, Colombia</span></div>
          </div>
        </div>

        <DogPreviewSection />

        <section className="process-section" id="proceso">
          <div className="container">
            <div data-reveal="up">
              <p className="eyebrow">Una decisión para toda la vida</p>
              <h2 className="section-title">Adoptar es más fácil de lo que imaginas</h2>
              <p className="section-copy">Queremos encontrar la familia adecuada para cada perrito. Escríbenos y te acompañaremos personalmente durante el proceso.</p>
            </div>
            <div className="process-grid" data-reveal="up">
              <article className="process-card">
                <span className="step-number" aria-hidden="true">01</span>
                <span className="step-icon" aria-hidden="true"><SearchIcon /></span>
                <h3>Encuentra tu conexión</h3>
                <p>Explora las fichas, conoce su edad y tamaño, y elige al perrito que hizo latir más fuerte tu corazón.</p>
              </article>
              <article className="process-card">
                <span className="step-number" aria-hidden="true">02</span>
                <span className="step-icon" aria-hidden="true"><ChatIcon /></span>
                <h3>Hablemos de tu hogar</h3>
                <p>Contáctanos para conversar sobre tu estilo de vida, experiencia, espacio y expectativas de adopción.</p>
              </article>
              <article className="process-card">
                <span className="step-number" aria-hidden="true">03</span>
                <span className="step-icon" aria-hidden="true"><HeartIcon /></span>
                <h3>Comienza una nueva vida</h3>
                <p>Después de validar que es el hogar indicado, coordinamos la entrega y empieza su historia en familia.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="story-section" id="nosotros">
          <div className="container story-grid">
            <div className="story-visual" aria-hidden="true" data-reveal="left">
              <Image
                src="/dog1.png"
                alt=""
                width={1200}
                height={1500}
                sizes="(max-width: 820px) calc(100vw - 28px), 500px"
              />
              <div className="story-note"><strong>No compres una vida.</strong><span>Adopta una historia que está lista para comenzar.</span></div>
            </div>
            <div className="story-copy" data-reveal="right">
              <p className="eyebrow">Fundación Protegiendo Huellas</p>
              <h2 className="section-title">El amor deja huellas que duran para siempre</h2>
              <p className="section-copy">Trabajamos desde Paipa, Boyacá, para conectar perros que esperan una oportunidad con familias comprometidas a quererlos y protegerlos.</p>
              <ul className="check-list">
                <li>Todos los perritos publicados se entregan esterilizados o castrados, si cumplen con la edad.</li>
                <li>Buscamos adopciones conscientes, responsables y definitivas.</li>
                <li>Te orientamos para encontrar el compañero más compatible contigo.</li>
              </ul>
              <Link className="btn btn-primary" href="/fundacion">Conócenos</Link>
            </div>
          </div>
        </section>

        <section className="donation-section" id="donaciones">
          <div className="container">
            <div className="donation-card">
              <div className="donation-copy" data-reveal="left">
                <p className="eyebrow">Tu ayuda también rescata</p>
                <h2>Cada aporte se convierte en alimento, cuidado y nuevas oportunidades.</h2>
                <p>No importa el monto. Tu donación nos ayuda a cubrir alimento, atención veterinaria y las necesidades diarias de los perritos que protegemos mientras encuentran una familia.</p>
                <div className="donation-promise">
                  <span className="donation-heart" aria-hidden="true"><HeartIcon /></span>
                  <span><strong>Gracias por dejar una huella.</strong> Con tu ayuda podemos seguir cuidándolos.</span>
                </div>
              </div>

              <div className="donation-details" aria-label="Datos para realizar donaciones" data-reveal="right">
                <div className="donation-details-heading">
                  <p>Elige cómo donar</p>
                  <span>Datos oficiales de la fundación</span>
                </div>

                <article className="donation-method">
                  <span className="donation-method-type">Transferencia bancaria</span>
                  <h3>Bancolombia</h3>
                  <dl>
                    <div><dt>Tipo de cuenta</dt><dd>Cuenta de ahorros</dd></div>
                    <div><dt>Número de cuenta</dt><dd className="donation-number">03803934290</dd></div>
                    <div><dt>NIT</dt><dd className="donation-number">901312316</dd></div>
                  </dl>
                </article>

                <article className="donation-method donation-method-mobile">
                  <span className="donation-method-type">Transferencia desde el celular</span>
                  <h3>Nequi / Daviplata</h3>
                  <p className="donation-number">3227464595</p>
                </article>
              </div>
            </div>
          </div>
        </section>

        <SocialSection />

        <EventsIntroSection />

        <section className="contact-section" id="contacto">
          <div className="container">
            <div className="contact-card" data-reveal="up">
              <div className="contact-copy">
                <h2>¿Listo para cambiar su mundo?</h2>
                <p>Cuéntanos qué perrito conquistó tu corazón. Estaremos felices de resolver tus dudas y acompañarte en este paso.</p>
                <div className="contact-actions">
                  <a className="btn btn-light" href="https://www.facebook.com/fundacion.protegiendo.huellas.2025" target="_blank" rel="noopener noreferrer"><FacebookIcon /> Contactar por Facebook</a>
                </div>
              </div>
              <div className="contact-details">
                <a className="contact-link" href="tel:+573227464595">
                  <span className="contact-link-icon"><PhoneIcon /></span>
                  <span><strong>Teléfono</strong><span>322 746 4595</span></span>
                </a>
                <a className="contact-link" href="mailto:fundacionprotegiendohuellas@gmail.com">
                  <span className="contact-link-icon"><EmailIcon /></span>
                  <span><strong>Email</strong><span>fundacionprotegiendohuellas@gmail.com</span></span>
                </a>
                <div className="contact-link">
                  <span className="contact-link-icon"><PinIcon /></span>
                  <span><strong>Ubicación</strong><span>Paipa, Boyacá, Colombia</span></span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
