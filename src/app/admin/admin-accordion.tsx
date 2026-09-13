import type { ReactNode } from "react";

type AdminAccordionProps = {
  title: string;
  description: string;
  meta?: string;
  children: ReactNode;
};

// Sección desplegable del panel. <details> funciona sin JavaScript y con teclado.
export function AdminAccordion({ title, description, meta, children }: AdminAccordionProps) {
  return (
    <details className="admin-accordion">
      <summary>
        <span className="admin-accordion-copy">
          <strong>{title}</strong>
          <span>{description}</span>
        </span>
        {meta && <span className="admin-accordion-meta">{meta}</span>}
      </summary>
      <div className="admin-accordion-body">{children}</div>
    </details>
  );
}
