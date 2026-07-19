"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ArrowIcon, ChatIcon, CloseIcon, FacebookIcon, HeartIcon, InstagramIcon, SearchIcon, TikTokIcon } from "@/components/icons";
import { DEFAULT_DOG_DESCRIPTION } from "@/lib/dog-content";
import {
  DOG_IMAGES_BUCKET,
  DOG_IMAGE_TYPES,
  getDogImageExtension,
  getDogImageUrl,
  MAX_DOG_IMAGE_SIZE,
} from "@/lib/dog-images";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/types/database";

type Filter = "todos" | "peque" | "median" | "grande";
type Dog = Tables<"dogs">;

type DogCatalogProps = {
  dogs: Dog[];
  canEdit: boolean;
};

type EditForm = {
  name: string;
  description: string;
  age: string;
  size: string;
  status: string;
};

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

function validateImage(file: File) {
  if (!DOG_IMAGE_TYPES.includes(file.type as (typeof DOG_IMAGE_TYPES)[number])) {
    return "La imagen debe ser JPG, PNG o WebP.";
  }
  if (file.size > MAX_DOG_IMAGE_SIZE) {
    return "La imagen no puede superar 5 MB.";
  }
  return null;
}

export function DogCatalog({ dogs: initialDogs, canEdit }: DogCatalogProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [dogs, setDogs] = useState(initialDogs);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<Filter>("todos");
  const [visibleCount, setVisibleCount] = useState(9);
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

  const filteredDogs = useMemo(() => {
    const term = normalize(search.trim());
    return dogs.filter((dog) => {
      const matchesSearch = normalize(dog.name).includes(term);
      const matchesSize = activeFilter === "todos" || normalize(dog.size).includes(activeFilter);
      return matchesSearch && matchesSize;
    });
  }, [activeFilter, dogs, search]);

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

    const validationError = validateImage(file);
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

  const uploadImage = async (dogId: number, file: File) => {
    const path = `${dogId}/${crypto.randomUUID()}.${getDogImageExtension(file)}`;
    const { error } = await supabase.storage
      .from(DOG_IMAGES_BUCKET)
      .upload(path, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false,
      });

    if (error) throw new Error("No fue posible subir la imagen.");
    return path;
  };

  const saveDogChanges = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canEdit || !editingDog) return;

    const values = {
      name: editForm.name.trim(),
      description: editForm.description.trim() || DEFAULT_DOG_DESCRIPTION,
      age: editForm.age.trim(),
      size: editForm.size.trim(),
      status: editForm.status.trim(),
    };

    if (!values.name || !values.age || !values.size || !values.status) {
      setEditNotice({ type: "error", text: "Completa nombre, edad, tamaño y estado." });
      return;
    }

    setEditBusy(true);
    setEditNotice(null);
    let uploadedPath: string | null = null;

    try {
      if (editImageFile) uploadedPath = await uploadImage(editingDog.id, editImageFile);
      const nextImagePath = uploadedPath ?? (removeExistingImage ? null : editingDog.image_path);

      const { data: updatedDog, error } = await supabase
        .from("dogs")
        .update({ ...values, image_path: nextImagePath })
        .eq("id", editingDog.id)
        .select("*")
        .single();

      if (error || !updatedDog) throw new Error("No fue posible guardar los cambios.");

      if (editingDog.image_path && editingDog.image_path !== nextImagePath) {
        await supabase.storage.from(DOG_IMAGES_BUCKET).remove([editingDog.image_path]);
      }

      setDogs((current) => current.map((dog) => dog.id === updatedDog.id ? updatedDog : dog));
      setSelectedDog((current) => current?.id === updatedDog.id ? updatedDog : current);
      setEditingDog(null);
      showToast(`${updatedDog.name} fue actualizado correctamente.`);
      router.refresh();
    } catch (error) {
      if (uploadedPath) await supabase.storage.from(DOG_IMAGES_BUCKET).remove([uploadedPath]);
      setEditNotice({
        type: "error",
        text: error instanceof Error ? error.message : "No fue posible guardar los cambios.",
      });
    } finally {
      setEditBusy(false);
    }
  };

  const deleteDog = async (dog: Dog) => {
    if (!canEdit) return;
    const confirmed = window.confirm(`¿Eliminar a ${dog.name}? Esta acción no se puede deshacer.`);
    if (!confirmed) return;

    setDeletingDogId(dog.id);
    const { error } = await supabase.from("dogs").delete().eq("id", dog.id);

    if (error) {
      showToast(`No fue posible eliminar a ${dog.name}.`);
      setDeletingDogId(null);
      return;
    }

    if (dog.image_path) {
      await supabase.storage.from(DOG_IMAGES_BUCKET).remove([dog.image_path]);
    }

    setDogs((current) => current.filter((item) => item.id !== dog.id));
    setFavorites((current) => {
      const next = new Set(current);
      next.delete(dog.id);
      return next;
    });
    setSelectedDog((current) => current?.id === dog.id ? null : current);
    setEditingDog((current) => current?.id === dog.id ? null : current);
    setDeletingDogId(null);
    showToast(`${dog.name} fue eliminado.`);
    router.refresh();
  };

  const shownDogs = filteredDogs.slice(0, visibleCount);
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
            <h2 className="section-title">Conoce a nuestra gran familia</h2>
            <p className="section-copy">Cada uno tiene una personalidad distinta, pero todos comparten el mismo sueño: encontrar un hogar seguro y lleno de cariño.</p>
          </div>
          <p className="catalog-count" aria-live="polite"><strong>{filteredDogs.length}</strong> perritos encontrados</p>
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
          <div className="dogs-grid" data-reveal="up">
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
            <div className={`modal-content${showAdoptionContact ? " adoption-contact-view" : ""}`}>
              {!showAdoptionContact ? (
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
                <input required value={editForm.name} onChange={(event) => updateEditField("name", event.target.value)} />
              </label>
              <label className="admin-field">
                <span>Descripción <small>(opcional)</small></span>
                <textarea value={editForm.description} onChange={(event) => updateEditField("description", event.target.value)} />
                <small>Si la dejas vacía, usaremos el mensaje informativo predeterminado.</small>
              </label>
              <div className="admin-field-row">
                <label className="admin-field">
                  <span>Edad</span>
                  <input required value={editForm.age} onChange={(event) => updateEditField("age", event.target.value)} />
                </label>
                <label className="admin-field">
                  <span>Tamaño</span>
                  <input required value={editForm.size} onChange={(event) => updateEditField("size", event.target.value)} />
                </label>
              </div>
              <label className="admin-field">
                <span>Estado</span>
                <input required value={editForm.status} onChange={(event) => updateEditField("status", event.target.value)} />
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
                <small>JPG, PNG o WebP. Máximo 5 MB.</small>
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
