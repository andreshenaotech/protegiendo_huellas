"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowIcon, CloseIcon, HeartIcon, SearchIcon } from "@/components/icons";
import { getDogImageUrl } from "@/lib/dog-images";
import type { Tables } from "@/types/database";

type Filter = "todos" | "peque" | "median" | "grande";
type Dog = Tables<"dogs">;

type DogCatalogProps = {
  dogs: Dog[];
};

const filters: { value: Filter; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "peque", label: "Pequeños" },
  { value: "median", label: "Medianos" },
  { value: "grande", label: "Grandes" },
];

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function DogCatalog({ dogs }: DogCatalogProps) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<Filter>("todos");
  const [visibleCount, setVisibleCount] = useState(9);
  const [favorites, setFavorites] = useState<Set<number>>(() => new Set());
  const [selectedDog, setSelectedDog] = useState<Dog | null>(null);
  const [toast, setToast] = useState("");
  const lastFocusedElement = useRef<HTMLElement | null>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filteredDogs = useMemo(() => {
    const term = normalize(search.trim());
    return dogs.filter((dog) => {
      const matchesSearch = normalize(dog.name).includes(term);
      const matchesSize = activeFilter === "todos" || normalize(dog.size).includes(activeFilter);
      return matchesSearch && matchesSize;
    });
  }, [activeFilter, dogs, search]);

  useEffect(() => {
    if (!selectedDog) return;
    document.body.classList.add("modal-open");
    closeButton.current?.focus();

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedDog(null);
    };
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.classList.remove("modal-open");
      document.removeEventListener("keydown", closeOnEscape);
      lastFocusedElement.current?.focus();
    };
  }, [selectedDog]);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2200);
  };

  const toggleFavorite = (id: number) => {
    const dog = dogs.find((item) => item.id === id);
    if (!dog) return;

    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
        showToast(`${dog.name} se quitó de tus favoritos`);
      } else {
        next.add(id);
        showToast(`${dog.name} se guardó en tus favoritos`);
      }
      return next;
    });
  };

  const openDog = (dog: Dog, trigger: HTMLElement) => {
    lastFocusedElement.current = trigger;
    setSelectedDog(dog);
  };

  const shownDogs = filteredDogs.slice(0, visibleCount);
  const selectedImageUrl = selectedDog ? getDogImageUrl(selectedDog.image_path) : null;

  return (
    <section className="catalog-section" id="adopta">
      <div className="container">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">Encuentra a tu compañero</p>
            <h2 className="section-title">Conoce a nuestra gran familia</h2>
            <p className="section-copy">Cada uno tiene una personalidad distinta, pero todos comparten el mismo sueño: encontrar un hogar seguro y lleno de cariño.</p>
          </div>
          <p className="catalog-count" aria-live="polite"><strong>{filteredDogs.length}</strong> perritos encontrados</p>
        </div>

        <div className="filters" aria-label="Filtros del catálogo">
          <label className="search-box">
            <span className="sr-only">Buscar por nombre</span>
            <SearchIcon />
            <input
              type="search"
              placeholder="Buscar por nombre…"
              autoComplete="off"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setVisibleCount(9);
              }}
            />
          </label>
          <div className="filter-chips" role="group" aria-label="Filtrar por tamaño">
            {filters.map((filter) => (
              <button
                className={`chip${activeFilter === filter.value ? " active" : ""}`}
                type="button"
                key={filter.value}
                aria-pressed={activeFilter === filter.value}
                onClick={() => {
                  setActiveFilter(filter.value);
                  setVisibleCount(9);
                }}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {shownDogs.length > 0 ? (
          <div className="dogs-grid">
            {shownDogs.map((dog, index) => {
              const favorite = favorites.has(dog.id);
              const imageUrl = getDogImageUrl(dog.image_path);
              return (
                <article className="dog-card revealed" key={dog.id} style={{ animationDelay: `${Math.min(index * 35, 280)}ms` }}>
                  <div className="dog-photo-wrap">
                    <button className="dog-photo-trigger" type="button" aria-label={`Ver ficha de ${dog.name}`} onClick={(event) => openDog(dog, event.currentTarget)}>
                      {imageUrl ? (
                        <Image className="dog-photo" src={imageUrl} alt={`Foto de ${dog.name}, perro en adopción`} fill sizes="(max-width: 620px) calc(100vw - 28px), (max-width: 1050px) 50vw, 380px" />
                      ) : (
                        <span className="dog-photo-placeholder"><span>Foto pendiente</span><small>Pronto conocerás su carita</small></span>
                      )}
                      <span className="status-pill">Busca hogar</span>
                    </button>
                    <button
                      className={`favorite-button${favorite ? " active" : ""}`}
                      type="button"
                      aria-label={`${favorite ? "Quitar a" : "Guardar a"} ${dog.name} ${favorite ? "de" : "en"} favoritos`}
                      aria-pressed={favorite}
                      onClick={() => toggleFavorite(dog.id)}
                    >
                      <HeartIcon />
                    </button>
                  </div>
                  <div className="dog-info">
                    <h3 className="dog-name">{dog.name}</h3>
                    <div className="dog-meta">
                      <span className="meta-tag">{dog.age}</span>
                      <span className="meta-tag">{dog.size}</span>
                    </div>
                    <p className="dog-status">{dog.status}</p>
                    <button className="card-open" type="button" aria-label={`Conocer a ${dog.name}`} onClick={(event) => openDog(dog, event.currentTarget)}><ArrowIcon /></button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty-state visible">
            <strong>No encontramos coincidencias</strong>
            <span>Prueba otro nombre o selecciona un tamaño diferente.</span>
          </div>
        )}

        {filteredDogs.length > visibleCount && (
          <div className="catalog-actions">
            <button className="btn btn-outline" type="button" onClick={() => setVisibleCount((count) => count + 9)}>Ver más perritos</button>
          </div>
        )}
      </div>

      <div className={`modal${selectedDog ? " open" : ""}`} role="dialog" aria-modal="true" aria-labelledby="modalName" aria-hidden={!selectedDog}>
        <button className="modal-backdrop" type="button" onClick={() => setSelectedDog(null)} aria-label="Cerrar ficha" tabIndex={selectedDog ? 0 : -1} />
        {selectedDog && (
          <div className="modal-dialog" role="document">
            <button ref={closeButton} className="modal-close" type="button" onClick={() => setSelectedDog(null)} aria-label="Cerrar ficha"><CloseIcon /></button>
            <div className="modal-image-wrap">
              {selectedImageUrl ? (
                <Image className="modal-image" src={selectedImageUrl} alt={`Foto de ${selectedDog.name}`} fill sizes="(max-width: 620px) calc(100vw - 20px), 390px" />
              ) : (
                <div className="dog-photo-placeholder modal-placeholder"><span>Foto pendiente</span><small>La fundación actualizará esta imagen</small></div>
              )}
            </div>
            <div className="modal-content">
              <p className="eyebrow">Busca un hogar</p>
              <h2 id="modalName">{selectedDog.name}</h2>
              <p className="modal-description">{selectedDog.description || "Pronto agregaremos más información sobre su historia y personalidad."}</p>
              <div className="modal-facts">
                <div className="modal-fact"><strong>Edad</strong><span>{selectedDog.age}</span></div>
                <div className="modal-fact"><strong>Tamaño</strong><span>{selectedDog.size}</span></div>
                <div className="modal-fact modal-fact-wide"><strong>Estado</strong><span>{selectedDog.status}</span></div>
              </div>
              <a
                className="btn btn-primary"
                href={`mailto:fundacionprotegiendohuellas@gmail.com?subject=${encodeURIComponent(`Quiero adoptar a ${selectedDog.name}`)}&body=${encodeURIComponent(`Hola, quiero recibir más información sobre ${selectedDog.name}.`)}`}
              >
                Quiero adoptar
              </a>
            </div>
          </div>
        )}
      </div>

      <div className={`toast${toast ? " visible" : ""}`} role="status" aria-live="polite">
        <span aria-hidden="true">♥</span><span>{toast}</span>
      </div>
    </section>
  );
}
