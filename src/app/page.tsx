import Image from "next/image";
import { DogCatalog } from "@/components/dog-catalog";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ArrowIcon, ChatIcon, EmailIcon, FacebookIcon, HeartIcon, InstagramIcon, PhoneIcon, PinIcon, SearchIcon, TikTokIcon } from "@/components/icons";

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">Saltar al contenido</a>
      <Header />

      <main id="main">
        <section className="hero" id="inicio">
          <div className="container hero-grid">
            <div className="hero-content">
              <p className="eyebrow">Perritos en adopción · Paipa</p>
              <h1>Tu nuevo mejor <span className="highlight">amigo</span> te espera.</h1>
              <p className="hero-copy">Abre las puertas de tu hogar a una historia que merece un final feliz. Conoce a nuestros peludos, enamórate y cambia dos vidas para siempre.</p>
              <div className="hero-actions">
                <a className="btn btn-primary" href="#adopta">Conocer perritos <ArrowIcon /></a>
                <a className="btn btn-outline" href="#proceso">¿Cómo puedo adoptar?</a>
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
              <div className="hero-badge"><div><strong>51</strong><span>corazones esperando</span></div></div>
            </div>
          </div>
        </section>

        <div className="container stats-wrap" aria-label="Cifras de adopción">
          <div className="stats">
            <div className="stat"><strong>51</strong><span>Perritos publicados</span></div>
            <div className="stat"><strong>100%</strong><span>Esterilizados o castrados</span></div>
            <div className="stat"><strong>Paipa</strong><span>Boyacá, Colombia</span></div>
          </div>
        </div>

        <DogCatalog />

        <section className="process-section" id="proceso">
          <div className="container">
            <p className="eyebrow">Una decisión para toda la vida</p>
            <h2 className="section-title">Adoptar es más fácil de lo que imaginas</h2>
            <p className="section-copy">Queremos encontrar la familia adecuada para cada peludo. Escríbenos y te acompañaremos personalmente durante el proceso.</p>
            <div className="process-grid">
              <article className="process-card">
                <span className="step-number" aria-hidden="true">01</span>
                <span className="step-icon" aria-hidden="true"><SearchIcon /></span>
                <h3>Encuentra tu conexión</h3>
                <p>Explora las fichas, conoce su edad y tamaño, y elige al peludo que hizo latir más fuerte tu corazón.</p>
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
            <div className="story-visual" aria-hidden="true">
              <Image
                src="/dog1.png"
                alt=""
                width={1200}
                height={1500}
                sizes="(max-width: 820px) calc(100vw - 28px), 500px"
              />
              <div className="story-note"><strong>No compres una vida.</strong><span>Adopta una historia que está lista para comenzar.</span></div>
            </div>
            <div className="story-copy">
              <p className="eyebrow">Fundación Protegiendo Huellas</p>
              <h2 className="section-title">El amor deja huellas que duran para siempre</h2>
              <p className="section-copy">Trabajamos desde Paipa, Boyacá, para conectar perros que esperan una oportunidad con familias comprometidas a quererlos y protegerlos.</p>
              <ul className="check-list">
                <li>Todos los peludos publicados se entregan esterilizados o castrados.</li>
                <li>Buscamos adopciones conscientes, responsables y definitivas.</li>
                <li>Te orientamos para encontrar el compañero más compatible contigo.</li>
              </ul>
              <a className="btn btn-primary" href="#contacto">Hablar con la fundación</a>
            </div>
          </div>
        </section>

        <section className="social-section" id="redes">
          <div className="container">
            <div className="social-heading">
              <div>
                <p className="eyebrow">Síguenos y comparte</p>
                <h2 className="section-title">Un like puede acercarlos a su próximo hogar</h2>
              </div>
              <p className="social-intro">Dale like a nuestras publicaciones y compártelas. Cada interacción ayuda a que más personas conozcan a los peludos que buscan una familia y fortalece el trabajo de la fundación.</p>
            </div>
            <div className="social-grid" aria-label="Redes sociales de Fundación Protegiendo Huellas">
              <a className="social-profile" href="https://www.facebook.com/fundacion.protegiendo.huellas.2025" target="_blank" rel="noopener noreferrer">
                <span className="social-profile-icon"><FacebookIcon /></span>
                <span className="social-profile-copy"><strong>Facebook</strong><span>Dale like y comparte</span></span>
                <span className="social-profile-arrow"><ArrowIcon /></span>
              </a>
              <a className="social-profile" href="https://www.instagram.com/protegiendo_huellas/" target="_blank" rel="noopener noreferrer">
                <span className="social-profile-icon"><InstagramIcon /></span>
                <span className="social-profile-copy"><strong>Instagram</strong><span>Sigue sus historias</span></span>
                <span className="social-profile-arrow"><ArrowIcon /></span>
              </a>
              <a className="social-profile" href="https://www.tiktok.com/@protegiendo.huellas?_r=1&_t=ZS-989SSm8VsZj" target="_blank" rel="noopener noreferrer">
                <span className="social-profile-icon"><TikTokIcon /></span>
                <span className="social-profile-copy"><strong>TikTok</strong><span>Comparte sus videos</span></span>
                <span className="social-profile-arrow"><ArrowIcon /></span>
              </a>
            </div>
          </div>
        </section>

        <section className="contact-section" id="contacto">
          <div className="container">
            <div className="contact-card">
              <div className="contact-copy">
                <h2>¿Listo para cambiar su mundo?</h2>
                <p>Cuéntanos qué peludo conquistó tu corazón. Estaremos felices de resolver tus dudas y acompañarte en este paso.</p>
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
