import { ArrowIcon, FacebookIcon, InstagramIcon, TikTokIcon } from "@/components/icons";

// Sección de redes sociales compartida por la landing y /apadrinamiento.
export function SocialSection() {
  return (
    <section className="social-section" id="redes">
      <div className="container">
        <div className="social-heading" data-reveal="up">
          <div>
            <p className="eyebrow">Síguenos y comparte</p>
            <h2 className="section-title">Un like puede acercarlos a su próximo hogar</h2>
          </div>
          <p className="social-intro">Dale like a nuestras publicaciones y compártelas. Cada interacción ayuda a que más personas conozcan a los perritos que buscan una familia y fortalece el trabajo de la fundación.</p>
        </div>
        <div className="social-grid" aria-label="Redes sociales de Fundación Protegiendo Huellas" data-reveal="up">
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
  );
}
