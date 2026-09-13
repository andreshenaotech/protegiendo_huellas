import type { ReactNode } from "react";

export type Faq = { question: string; answer: ReactNode };

type FaqSectionProps = {
  eyebrow: string;
  faqs: Faq[];
};

// Preguntas frecuentes desplegables, compartidas por las páginas informativas.
// <details> despliega cada respuesta sin JavaScript y es accesible con teclado.
export function FaqSection({ eyebrow, faqs }: FaqSectionProps) {
  return (
    <section className="faq-section" id="preguntas-frecuentes">
      <div className="container">
        <div data-reveal="up">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="section-title">Preguntas frecuentes</h2>
        </div>

        <div className="faq-list" data-reveal="up">
          {faqs.map((faq) => (
            <details key={faq.question}>
              <summary>{faq.question}</summary>
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
