import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowIcon, DonateIcon, HeartIcon, HomeIcon, SearchIcon, ShelterPawIcon } from "@/components/icons";

export type ExploreLinkKey = "adopta" | "apadrina" | "voluntariado" | "como-adoptar" | "donar";

type ExploreLink = {
  key: ExploreLinkKey;
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
};

const links: ExploreLink[] = [
  { key: "adopta", href: "/perritos", title: "Adopta", description: "Conoce a los perritos que esperan un hogar y encuentra a tu compañero.", icon: <SearchIcon /> },
  { key: "apadrina", href: "/apadrinamiento", title: "Apadrina", description: "Acompaña a un peludo con un aporte mensual, sin llevártelo a casa.", icon: <HeartIcon /> },
  { key: "voluntariado", href: "/voluntariado", title: "Voluntariado", description: "Suma tu tiempo, tu oficio o tu casa para cambiar la vida de un animal.", icon: <ShelterPawIcon /> },
  { key: "como-adoptar", href: "/adopciones", title: "Cómo adoptar", description: "Revisa las recomendaciones y los pasos para llevar a tu perrito a casa.", icon: <HomeIcon /> },
  { key: "donar", href: "/#donaciones", title: "Quiero donar", description: "Tu aporte se convierte en alimento, salud y esterilizaciones.", icon: <DonateIcon /> },
];

type ExploreLinksSectionProps = {
  eyebrow?: string;
  title?: string;
  // "full": sección grande de /fundacion. "compact": franja corta de
  // "Otras formas de ayudar" al final de las páginas.
  variant?: "full" | "compact";
  // Oculta el acceso a la página donde se muestra la sección.
  exclude?: ExploreLinkKey[];
};

// Accesos a las formas de ayudar. Reutilizable en cualquier página.
export function ExploreLinksSection({
  eyebrow,
  title,
  variant = "full",
  exclude = [],
}: ExploreLinksSectionProps) {
  const compact = variant === "compact";
  const shownLinks = links.filter((link) => !exclude.includes(link.key));

  return (
    <section className={`explore-links-section${compact ? " is-compact" : ""}`}>
      <div className="container">
        <div className={compact ? "explore-compact" : undefined} data-reveal="up">
          <div className="explore-links-heading">
            <p className="eyebrow">{eyebrow ?? (compact ? "Sigue sumando" : "Súmate a la causa")}</p>
            <h2 className={compact ? undefined : "section-title"}>{title ?? (compact ? "Otras formas de ayudar" : "¿Cómo quieres dejar tu huella?")}</h2>
          </div>

          <div className={`explore-links count-${shownLinks.length}`} data-reveal={compact ? undefined : "up"}>
            {shownLinks.map((link) => (
              <Link className="explore-link" href={link.href} key={link.key}>
                <span className="explore-link-icon" aria-hidden="true">{link.icon}</span>
                <span className="explore-link-copy">
                  <strong>{link.title}</strong>
                  <span>{link.description}</span>
                </span>
                <span className="explore-link-arrow" aria-hidden="true"><ArrowIcon /></span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
