"use client";

import { type ReactNode, useState } from "react";

const INITIAL_COUNT = 3;
const PAGE_SIZE = 6;

type PastEventsListProps = {
  // Tarjetas ya renderizadas en el servidor, de la más reciente a la más antigua.
  cards: ReactNode[];
};

// Muestra 3 eventos pasados y agrega 6 más con cada "Ver más".
export function PastEventsList({ cards }: PastEventsListProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);

  return (
    <>
      <div className="events-grid">{cards.slice(0, visibleCount)}</div>
      {cards.length > visibleCount && (
        <div className="catalog-actions">
          <button className="btn btn-outline" type="button" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>
            Ver más eventos
          </button>
        </div>
      )}
    </>
  );
}
