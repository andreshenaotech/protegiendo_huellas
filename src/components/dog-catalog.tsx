"use client";

import Image from "next/image";
import Link from "next/link";
import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ArrowIcon, ChatIcon, CloseIcon, FacebookIcon, HeartIcon, InstagramIcon, SearchIcon, TikTokIcon } from "@/components/icons";
import { deleteDog as deleteDogAction } from "@/lib/dog-actions";
import { DEFAULT_DOG_DESCRIPTION, DOG_FIELD_LIMITS, type Dog, type DogValues, isAdopted } from "@/lib/dog-content";
import { submitDog, validateDogImageFile } from "@/lib/dog-editor";
import { getDogImageUrl } from "@/lib/dog-images";
import { createClient } from "@/lib/supabase/client";

type Filter = "todos" | "peque" | "median" | "grande" | "favoritos";

type DogCatalogProps = {
  dogs: Dog[];
  // "preview": vista corta de la landing, sin filtros y con enlace a /perritos.
  // "full": página /perritos con búsqueda, carga progresiva y adoptados.
  variant: "preview" | "full";
};

const PREVIEW_COUNT = 6;
const PAGE_SIZE = 9;
const FAVORITES_STORAGE_KEY = "protegiendo-huellas:favoritos";
const FAVORITES_QUERY = "filtro=favoritos";

// Los favoritos viven solo en el navegador del visitante (sin cuentas).
function readStoredFavorites() {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(FAVORITES_STORAGE_KEY) ?? "[]");
    return new Set(Array.isArray(parsed) ? parsed.filter((id): id is number => Number.isInteger(id)) : []);
  } catch {
    return new Set<number>();
  }
}

function storeFavorites(favorites: Set<number>) {
  try {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([...favorites]));
  } catch {
    // Almacenamiento bloqueado (modo privado, cuota): los favoritos duran la visita.
  }
}

type EditForm = DogValues;

type Notice = {
  type: "success" | "error";
  text: string;
} | null;

const filters: { value: Filter; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "peque", label: "Pequeños" },
  { value: "median", label: "Medianos" },
  { value: "grande", label: "Grandes" },
];

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function DogCatalog({ dogs: initialDogs, variant }: DogCatalogProps) {
  const isPreview = variant === "preview";
  const [canEdit, setCanEdit] = useState(false);
  const [dogs, setDogs] = useState(initialDogs);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<Filter>("todos");
  const [visibleCount, setVisibleCount] = useState(isPreview ? PREVIEW_COUNT : PAGE_SIZE);
  const [adoptedVisibleCount, setAdoptedVisibleCount] = useState(PAGE_SIZE);
  const [favorites, setFavorites] = useState<Set<number>>(() => new Set());
  const [selectedDog, setSelectedDog] = useState<Dog | null>(null);
  const [showAdoptionContact, setShowAdoptionContact] = useState(false);
  const [editingDog, setEditingDog] = useState<Dog | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ name: "", description: "", age: "", size: "", status: "" });
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const [editNotice, setEditNotice] = useState<Notice>(null);
  const [editBusy, setEditBusy] = useState(false);
  const [deletingDogId, setDeletingDogId] = useState<number | null>(null);
  const [toast, setToast] = useState("");
  const lastFocusedElement = useRef<HTMLElement | null>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const editCloseButton = useRef<HTMLButtonElement>(null);
  const editFileInput = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const availableDogs = useMemo(() => dogs.filter((dog) => !isAdopted(dog)), [dogs]);

  // Los adoptados más recientes primero.
  const adoptedDogs = useMemo(
    () => dogs
      .filter(isAdopted)
      .sort((a, b) => (b.adopted_at ?? "").localeCompare(a.adopted_at ?? "")),
    [dogs],
  );

  // La búsqueda y los filtros solo aplican a los perros que buscan hogar.
  const filteredDogs = useMemo(() => {
    const term = normalize(search.trim());
    return availableDogs.filter((dog) => {
      const matchesSearch = normalize(dog.name).includes(term);
      const matchesFilter = activeFilter === "todos"
        || (activeFilter === "favoritos" ? favorites.has(dog.id) : normalize(dog.size).includes(activeFilter));
      return matchesSearch && matchesFilter;
    });
  }, [activeFilter, availableDogs, favorites, search]);

  // Un favorito que fue adoptado deja de contar: solo aplica a perros en adopción.
  const favoriteCount = useMemo(
    () => availableDogs.filter((dog) => favorites.has(dog.id)).length,
    [availableDogs, favorites],
  );

  useEffect(() => {
    // Sincroniza con localStorage y con el enlace "Ver mis favoritos" de la landing.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFavorites(readStoredFavorites());
    if (!isPreview && window.location.search.includes(FAVORITES_QUERY)) setActiveFilter("favoritos");
  }, [isPreview]);

  useEffect(() => {
    if (!selectedDog && !editingDog) return;
    document.body.classList.add("modal-open");
    if (editingDog) editCloseButton.current?.focus();
    else closeButton.current?.focus();

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedDog(null);
        setEditingDog(null);
      }
    };
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.classList.remove("modal-open");
      document.removeEventListener("keydown", closeOnEscape);
      lastFocusedElement.current?.focus();
    };
  }, [editingDog, selectedDog]);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  // La landing se sirve desde caché para todos, así que la sesión admin se
  // detecta en el navegador. Sin sesión no se hace ninguna consulta. Esto solo
  // muestra los controles; las server actions y RLS validan cada escritura.
  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) return;
      const { data: admin } = await supabase.from("admin_users").select("role").maybeSingle();
      if (!cancelled) setCanEdit(Boolean(admin));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2200);
  };

  const toggleFavorite = (id: number) => {
    const dog = dogs.find((item) => item.id === id);
    if (!dog) return;

    const next = new Set(favorites);
    if (next.has(id)) {
      next.delete(id);
      showToast(`${dog.name} se quitó de tus favoritos`);
    } else {
      next.add(id);
      showToast(`${dog.name} se guardó en tus favoritos`);
    }
    setFavorites(next);
    storeFavorites(next);
  };

  const openDog = (dog: Dog, trigger: HTMLElement) => {
    lastFocusedElement.current = trigger;
    setShowAdoptionContact(false);
    setSelectedDog(dog);
  };

  const openEditor = (dog: Dog, trigger: HTMLElement) => {
    if (!canEdit) return;
    lastFocusedElement.current = trigger;
    setEditForm({
      name: dog.name,
      description: dog.description ?? "",
      age: dog.age,
      size: dog.size,
      status: dog.status,
    });
    setEditImageFile(null);
    setRemoveExistingImage(false);
    setEditNotice(null);
    if (editFileInput.current) editFileInput.current.value = "";
    setEditingDog(dog);
  };

  const updateEditField = (field: keyof EditForm, value: string) => {
    setEditForm((current) => ({ ...current, [field]: value }));
  };

  const handleEditImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setEditNotice(null);
    if (!file) {
      setEditImageFile(null);
      return;
    }

    const validationError = validateDogImageFile(file);
    if (validationError) {
      setEditNotice({ type: "error", text: validationError });
      setEditImageFile(null);
      event.target.value = "";
      return;
    }

    setEditImageFile(file);
    setRemoveExistingImage(false);
  };

  const markImageForRemoval = () => {
    setRemoveExistingImage(true);
    setEditImageFile(null);
    if (editFileInput.current) editFileInput.current.value = "";
  };

  const saveDogChanges = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canEdit || !editingDog) return;

    setEditBusy(true);
    setEditNotice(null);

    const result = await submitDog({
      id: editingDog.id,
      values: editForm,
      imageFile: editImageFile,
      removeImage: removeExistingImage,
    });

    setEditBusy(false);
    if (!result.ok || !result.dog) {
      setEditNotice({ type: "error", text: result.ok ? "No fue posible guardar los cambios." : result.error });
      return;
    }

    const updatedDog = result.dog;
    setDogs((current) => current.map((dog) => dog.id === updatedDog.id ? updatedDog : dog));
    setSelectedDog((current) => current?.id === updatedDog.id ? updatedDog : current);
    setEditingDog(null);
    showToast(`${updatedDog.name} fue actualizado correctamente.`);
  };

  const deleteDog = async (dog: Dog) => {
    if (!canEdit) return;
    const confirmed = window.confirm(`¿Eliminar a ${dog.name}? Esta acción no se puede deshacer.`);
    if (!confirmed) return;

    setDeletingDogId(dog.id);
    const result = await deleteDogAction(dog.id).catch(() => null);
    setDeletingDogId(null);

    if (!result?.ok) {
      showToast(`No fue posible eliminar a ${dog.name}.`);
      return;
    }

    setDogs((current) => current.filter((item) => item.id !== dog.id));
    setFavorites((current) => {
      const next = new Set(current);
      next.delete(dog.id);
      return next;
    });
    setSelectedDog((current) => current?.id === dog.id ? null : current);
    setEditingDog((current) => current?.id === dog.id ? null : current);
    showToast(`${dog.name} fue eliminado.`);
  };

  const renderCard = (dog: Dog, index: number) => {
    const adopted = isAdopted(dog);
    const favorite = favorites.has(dog.id);
    const imageUrl = getDogImageUrl(dog.image_path);
    return (
      <article className={`dog-card revealed${adopted ? " is-adopted" : ""}`} key={dog.id} style={{ animationDelay: `${Math.min(index * 35, 280)}ms` }}>
        <div className="dog-photo-wrap">
          <button className="dog-photo-trigger" type="button" aria-label={`Ver ficha de ${dog.name}`} onClick={(event) => openDog(dog, event.currentTarget)}>
            {imageUrl ? (
              <Image className="dog-photo" src={imageUrl} alt={`Foto de ${dog.name}, ${adopted ? "perro adoptado" : "perro en adopción"}`} fill sizes="(max-width: 620px) calc(100vw - 28px), (max-width: 1050px) 50vw, 380px" />
            ) : (
              <span className="dog-photo-placeholder"><span>Foto pendiente</span><small>Pronto conocerás su carita</small></span>
            )}
            <span className={`status-pill${adopted ? " adopted" : ""}`}>{adopted ? "Adoptado" : "Busca hogar"}</span>
          </button>
          {!adopted && (
            <button
              className={`favorite-button${favorite ? " active" : ""}`}
              type="button"
              aria-label={`${favorite ? "Quitar a" : "Guardar a"} ${dog.name} ${favorite ? "de" : "en"} favoritos`}
              aria-pressed={favorite}
              onClick={() => toggleFavorite(dog.id)}
            >
              <HeartIcon />
            </button>
          )}
        </div>
        <div className="dog-info">
          <h3 className="dog-name">{dog.name}</h3>
          <div className="dog-meta">
            <span className="meta-tag">{dog.age}</span>
            <span className="meta-tag">{dog.size}</span>
          </div>
          <p className="dog-status">{dog.status}</p>
          {canEdit && (
            <div className="dog-admin-actions" aria-label={`Administrar a ${dog.name}`}>
              <button type="button" onClick={(event) => openEditor(dog, event.currentTarget)}>Editar</button>
              <button
                className="danger"
                type="button"
                disabled={deletingDogId === dog.id}
                onClick={() => deleteDog(dog)}
              >
                {deletingDogId === dog.id ? "Eliminando…" : "Eliminar"}
              </button>
            </div>
          )}
          <button className="card-open" type="button" aria-label={`Conocer a ${dog.name}`} onClick={(event) => openDog(dog, event.currentTarget)}><ArrowIcon /></button>
        </div>
      </article>
    );
  };

  const shownDogs = filteredDogs.slice(0, visibleCount);
  const shownAdoptedDogs = adoptedDogs.slice(0, adoptedVisibleCount);
  const selectedImageUrl = selectedDog ? getDogImageUrl(selectedDog.image_path) : null;
  const editingImageUrl = editingDog ? getDogImageUrl(editingDog.image_path) : null;
  const whatsappMessage = selectedDog
    ? `Hola Yazmid, quiero recibir información sobre el proceso de adopción de ${selectedDog.name}.`
    : "";

  return (
    <section className="catalog-section" id="adopta">
      <div className="container">
        <div className="section-heading-row" data-reveal="up">
          <div>
            <p className="eyebrow">Encuentra a tu compañero</p>
            {isPreview ? (
              <h2 className="section-title">Conoce a nuestra gran familia</h2>
            ) : (
              <h1 className="section-title">Conoce a nuestra gran familia</h1>
            )}
            <p className="section-copy">Cada uno tiene una personalidad distinta, pero todos comparten el mismo sueño: encontrar un hogar seguro y lleno de cariño.</p>
          </div>
          {isPreview ? (
            <p className="catalog-count"><strong>{availableDogs.length}</strong> perritos buscan hogar</p>
          ) : (
            <p className="catalog-count" aria-live="polite"><strong>{filteredDogs.length}</strong> perritos encontrados</p>
          )}
        </div>

        {canEdit && (
          <div className="catalog-admin-banner">
            <div>
              <span>Sesión administrativa activa</span>
              <strong>Puedes editar o eliminar las mascotas directamente desde esta página.</strong>
            </div>
            <a href="/admin">Abrir panel completo</a>
          </div>
        )}

        {!isPreview && (
        <div className="filters" aria-label="Filtros del catálogo" data-reveal="up">
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
                setVisibleCount(PAGE_SIZE);
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
                  setVisibleCount(PAGE_SIZE);
                }}
              >
                {filter.label}
              </button>
            ))}
            <button
              className={`chip chip-favorites${activeFilter === "favoritos" ? " active" : ""}`}
              type="button"
              aria-pressed={activeFilter === "favoritos"}
              onClick={() => {
                setActiveFilter("favoritos");
                setVisibleCount(PAGE_SIZE);
              }}
            >
              <HeartIcon /> Favoritos ({favoriteCount})
            </button>
          </div>
        </div>
        )}

        {/* La grilla queda siempre montada: ScrollReveals solo observa los
            elementos presentes al cargar, y una grilla recreada tras una
            búsqueda sin resultados quedaría invisible. */}
        <div className="dogs-grid" data-reveal="up">
          {shownDogs.map(renderCard)}
        </div>

        {shownDogs.length === 0 && (
          <div className="empty-state visible">
            {activeFilter === "favoritos" && favoriteCount === 0 ? (
              <>
                <strong>Todavía no tienes favoritos</strong>
                <span>Toca el corazón de un perrito para guardarlo aquí.</span>
              </>
            ) : (
              <>
                <strong>No encontramos coincidencias</strong>
                <span>Prueba otro nombre o selecciona un filtro diferente.</span>
              </>
            )}
          </div>
        )}

        {isPreview ? (
          (availableDogs.length > PREVIEW_COUNT || favoriteCount > 0) && (
            <div className="catalog-actions">
              {availableDogs.length > PREVIEW_COUNT && (
                <Link className="btn btn-outline" href="/perritos">Ver más perritos <ArrowIcon /></Link>
              )}
              {favoriteCount > 0 && (
                <Link className="btn btn-outline btn-favorites" href={`/perritos?${FAVORITES_QUERY}`}><HeartIcon /> Ver mis favoritos ({favoriteCount})</Link>
              )}
            </div>
          )
        ) : (
          filteredDogs.length > visibleCount && (
            <div className="catalog-actions">
              <button className="btn btn-outline" type="button" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>Ver más perritos</button>
            </div>
          )
        )}

        {!isPreview && adoptedDogs.length > 0 && (
          <div className="adopted-block" id="adoptados">
            <div className="section-heading-row" data-reveal="up">
              <div>
                <p className="eyebrow">Historias con final feliz</p>
                <h2 className="section-title">Ya encontraron un hogar</h2>
                <p className="section-copy">Estos perritos llegaron a la fundación esperando una oportunidad y hoy comparten su vida con una familia que los quiere. Gracias a cada persona que abrió las puertas de su casa y a quienes ayudaron a compartir sus historias.</p>
              </div>
              <p className="catalog-count"><strong>{adoptedDogs.length}</strong> {adoptedDogs.length === 1 ? "perrito adoptado" : "perritos adoptados"}</p>
            </div>

            <div className="dogs-grid adopted-grid" data-reveal="up">
              {shownAdoptedDogs.map(renderCard)}
            </div>

            {adoptedDogs.length > adoptedVisibleCount && (
              <div className="catalog-actions">
                <button className="btn btn-outline" type="button" onClick={() => setAdoptedVisibleCount((count) => count + PAGE_SIZE)}>Ver más adoptados</button>
              </div>
            )}
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
            <div className={`modal-content${showAdoptionContact ? " adoption-contact-view" : ""}`}>
              {isAdopted(selectedDog) ? (
                <>
                  <p className="eyebrow">Ya tiene un hogar</p>
                  <h2 id="modalName">{selectedDog.name}</h2>
                  <p className="modal-description">{selectedDog.description || DEFAULT_DOG_DESCRIPTION}</p>
                  <div className="modal-facts">
                    <div className="modal-fact"><strong>Edad</strong><span>{selectedDog.age}</span></div>
                    <div className="modal-fact"><strong>Tamaño</strong><span>{selectedDog.size}</span></div>
                    <div className="modal-fact modal-fact-wide"><strong>Estado</strong><span>{selectedDog.status}</span></div>
                  </div>
                  <p className="modal-adopted-note"><strong>{selectedDog.name} ya encontró una familia.</strong> Todavía hay muchos perritos esperando su oportunidad.</p>
                </>
              ) : !showAdoptionContact ? (
                <>
                  <p className="eyebrow">Busca un hogar</p>
                  <h2 id="modalName">{selectedDog.name}</h2>
                  <p className="modal-description">{selectedDog.description || DEFAULT_DOG_DESCRIPTION}</p>
                  <div className="modal-facts">
                    <div className="modal-fact"><strong>Edad</strong><span>{selectedDog.age}</span></div>
                    <div className="modal-fact"><strong>Tamaño</strong><span>{selectedDog.size}</span></div>
                    <div className="modal-fact modal-fact-wide"><strong>Estado</strong><span>{selectedDog.status}</span></div>
                  </div>
                  <button className="btn btn-primary" type="button" onClick={() => setShowAdoptionContact(true)}>Quiero adoptar</button>
                </>
              ) : (
                <div className="adoption-contact-content">
                  <p className="eyebrow">El primer paso hacia su hogar</p>
                  <h2 id="modalName">¿Quieres conocer a {selectedDog.name}?</h2>
                  <p className="modal-description">Escríbele por WhatsApp a <strong>Yazmid Navarro</strong>, directora de la fundación. Menciona que te interesa adoptar a <strong>{selectedDog.name}</strong> y ella te orientará personalmente sobre los siguientes pasos.</p>
                  <a
                    className="adoption-whatsapp-card"
                    href={`https://wa.me/573227464595?text=${encodeURIComponent(whatsappMessage)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="adoption-whatsapp-icon"><ChatIcon /></span>
                    <span><small>WhatsApp de la fundación</small><strong>322 746 4595</strong><small>Yazmid Navarro · Directora</small></span>
                    <ArrowIcon />
                  </a>
                  <div className="adoption-socials">
                    <p>O contáctanos por nuestras redes sociales</p>
                    <div>
                      <a href="https://www.facebook.com/fundacion.protegiendo.huellas.2025" target="_blank" rel="noopener noreferrer" aria-label="Contactar por Facebook"><FacebookIcon /></a>
                      <a href="https://www.instagram.com/protegiendo_huellas/" target="_blank" rel="noopener noreferrer" aria-label="Contactar por Instagram"><InstagramIcon /></a>
                      <a href="https://www.tiktok.com/@protegiendo.huellas?_r=1&_t=ZS-989SSm8VsZj" target="_blank" rel="noopener noreferrer" aria-label="Contactar por TikTok"><TikTokIcon /></a>
                    </div>
                  </div>
                  <button className="adoption-back" type="button" onClick={() => setShowAdoptionContact(false)}>Volver a la información de {selectedDog.name}</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className={`modal landing-edit-modal${editingDog ? " open" : ""}`} role="dialog" aria-modal="true" aria-labelledby="editDogTitle" aria-hidden={!editingDog}>
        <button className="modal-backdrop" type="button" onClick={() => !editBusy && setEditingDog(null)} aria-label="Cerrar edición" tabIndex={editingDog ? 0 : -1} />
        {editingDog && (
          <div className="modal-dialog landing-edit-dialog" role="document">
            <button ref={editCloseButton} className="modal-close" type="button" disabled={editBusy} onClick={() => setEditingDog(null)} aria-label="Cerrar edición"><CloseIcon /></button>
            <div className="landing-edit-heading">
              <p className="eyebrow">Edición rápida</p>
              <h2 id="editDogTitle">Editar a {editingDog.name}</h2>
              <p>Los cambios se verán inmediatamente en esta tarjeta.</p>
            </div>

            <form className="admin-form landing-edit-form" onSubmit={saveDogChanges}>
              <label className="admin-field">
                <span>Nombre</span>
                <input required maxLength={DOG_FIELD_LIMITS.name} value={editForm.name} onChange={(event) => updateEditField("name", event.target.value)} />
              </label>
              <label className="admin-field">
                <span>Descripción <small>(opcional)</small></span>
                <textarea maxLength={DOG_FIELD_LIMITS.description} value={editForm.description} onChange={(event) => updateEditField("description", event.target.value)} />
                <small>Si la dejas vacía, usaremos el mensaje informativo predeterminado.</small>
              </label>
              <div className="admin-field-row">
                <label className="admin-field">
                  <span>Edad</span>
                  <input required maxLength={DOG_FIELD_LIMITS.age} value={editForm.age} onChange={(event) => updateEditField("age", event.target.value)} />
                </label>
                <label className="admin-field">
                  <span>Tamaño</span>
                  <input required maxLength={DOG_FIELD_LIMITS.size} value={editForm.size} onChange={(event) => updateEditField("size", event.target.value)} />
                </label>
              </div>
              <label className="admin-field">
                <span>Estado</span>
                <input required maxLength={DOG_FIELD_LIMITS.status} value={editForm.status} onChange={(event) => updateEditField("status", event.target.value)} />
              </label>

              {editingImageUrl && !removeExistingImage && !editImageFile && (
                <div className="admin-current-image">
                  <div className="admin-current-image-thumb">
                    <Image src={editingImageUrl} alt={`Imagen actual de ${editingDog.name}`} fill sizes="62px" />
                  </div>
                  <div className="admin-current-image-copy"><strong>Imagen actual</strong><span>Puedes reemplazarla o eliminarla.</span></div>
                  <button className="admin-remove-image" type="button" onClick={markImageForRemoval}>Eliminar imagen</button>
                </div>
              )}

              {removeExistingImage && (
                <div className="landing-image-removal">
                  <span>La imagen actual se eliminará al guardar.</span>
                  <button type="button" onClick={() => setRemoveExistingImage(false)}>Deshacer</button>
                </div>
              )}

              <label className="admin-field admin-file-field">
                <span>{editingDog.image_path ? "Reemplazar imagen" : "Agregar imagen"} <small>(opcional)</small></span>
                <input ref={editFileInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleEditImageChange} />
                <small>JPG, PNG o WebP. Se optimiza automáticamente al subirla.</small>
              </label>

              {editNotice && <p className={`admin-message ${editNotice.type}`} role="status">{editNotice.text}</p>}

              <div className="landing-edit-actions">
                <button className="btn btn-outline" type="button" disabled={editBusy} onClick={() => setEditingDog(null)}>Cancelar</button>
                <button className="btn btn-primary" type="submit" disabled={editBusy}>{editBusy ? "Guardando…" : "Guardar cambios"}</button>
              </div>
            </form>
          </div>
        )}
      </div>

      <div className={`toast${toast ? " visible" : ""}`} role="status" aria-live="polite">
        <span aria-hidden="true">♥</span><span>{toast}</span>
      </div>
    </section>
  );
}
