"use client";

import Image from "next/image";
import { type ChangeEvent, type FormEvent, useRef, useState } from "react";
import { deleteEvent, saveEvent, type EventActionResult } from "@/lib/event-actions";
import {
  EVENT_FIELD_LIMITS,
  type EventValues,
  emptyEventValues,
  eventToValues,
  type FoundationEvent,
  formatEventDate,
  formatEventTime,
  isPastEvent,
  normalizeEventValues,
  validateEventValues,
} from "@/lib/event-content";
import { EVENT_FLYERS_BUCKET, getPublicImageUrl } from "@/lib/dog-images";
import { uploadImage, validateImageFile } from "@/lib/image-upload";

type Notice = { type: "success" | "error"; text: string } | null;

type AdminEventsProps = {
  initialEvents: FoundationEvent[];
};

function sortEvents(events: FoundationEvent[]) {
  return [...events].sort((a, b) => b.event_date.localeCompare(a.event_date));
}

export function AdminEvents({ initialEvents }: AdminEventsProps) {
  const formRef = useRef<HTMLElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [events, setEvents] = useState(() => sortEvents(initialEvents));
  const [form, setForm] = useState<EventValues>(emptyEventValues);
  const [flyerFile, setFlyerFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  const editingEvent = editingId === null ? null : events.find((event) => event.id === editingId) ?? null;

  const resetForm = () => {
    setForm(emptyEventValues);
    setFlyerFile(null);
    setEditingId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const updateField = (field: keyof EventValues, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleFlyerChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setNotice(null);
    if (!file) {
      setFlyerFile(null);
      return;
    }
    const validationError = validateImageFile(file);
    if (validationError) {
      setNotice({ type: "error", text: validationError });
      event.target.value = "";
      setFlyerFile(null);
      return;
    }
    setFlyerFile(file);
  };

  const startEditing = (event: FoundationEvent) => {
    setEditingId(event.id);
    setForm(eventToValues(event));
    setFlyerFile(null);
    setNotice(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSubmit = async (submitEvent: FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault();
    setNotice(null);

    const validationError = validateEventValues(normalizeEventValues(form));
    if (validationError) {
      setNotice({ type: "error", text: validationError });
      return;
    }
    if (editingId === null && !flyerFile) {
      setNotice({ type: "error", text: "Sube el flyer del evento." });
      return;
    }

    setBusy(true);
    let result: EventActionResult;
    try {
      const flyer = flyerFile ? await uploadImage(EVENT_FLYERS_BUCKET, editingId, flyerFile) : null;
      result = await saveEvent({ id: editingId, values: form, flyer });
    } catch (error) {
      result = { ok: false, error: error instanceof Error ? error.message : "No fue posible guardar el evento." };
    }
    setBusy(false);

    if (!result.ok || !result.event) {
      setNotice({ type: "error", text: result.ok ? "No fue posible guardar el evento." : result.error });
      return;
    }

    const saved = result.event;
    setEvents((current) => sortEvents(editingId === null ? [saved, ...current] : current.map((item) => item.id === saved.id ? saved : item)));
    setNotice({ type: "success", text: editingId === null ? `"${saved.title}" fue creado.` : `"${saved.title}" fue actualizado.` });
    resetForm();
  };

  const removeEvent = async (event: FoundationEvent) => {
    const confirmed = window.confirm(`¿Eliminar el evento "${event.title}"? Esta acción no se puede deshacer.`);
    if (!confirmed) return;

    setBusy(true);
    setNotice(null);
    const result = await deleteEvent(event.id).catch(() => null);
    setBusy(false);

    if (!result?.ok) {
      setNotice({ type: "error", text: `No fue posible eliminar "${event.title}".` });
      return;
    }

    setEvents((current) => current.filter((item) => item.id !== event.id));
    if (editingId === event.id) resetForm();
    setNotice({ type: "success", text: `"${event.title}" fue eliminado.` });
  };

  return (
    <section className="admin-events-section">
      <div className="admin-section-heading">
        <p className="admin-kicker">Página de eventos</p>
        <h2>Eventos de la fundación</h2>
      </div>

      <div className="admin-workspace">
        <section className="admin-panel admin-dog-form-panel" ref={formRef}>
          <div className="admin-panel-heading">
            <div>
              <p className="admin-kicker">{editingId === null ? "Nuevo evento" : "Editando evento"}</p>
              <h3>{editingId === null ? "Crear un evento" : `Editar "${editingEvent?.title ?? ""}"`}</h3>
            </div>
            {editingId !== null && <button className="admin-text-button" type="button" onClick={resetForm}>Cancelar</button>}
          </div>

          <form className="admin-form" onSubmit={handleSubmit}>
            <label className="admin-field">
              <span>Título</span>
              <input required maxLength={EVENT_FIELD_LIMITS.title} placeholder="Ej. Jornada de adopción en el parque" value={form.title} onChange={(event) => updateField("title", event.target.value)} />
            </label>
            <div className="admin-field-row">
              <label className="admin-field">
                <span>Fecha</span>
                <input required type="date" value={form.eventDate} onChange={(event) => updateField("eventDate", event.target.value)} />
              </label>
              <label className="admin-field">
                <span>Hora <small>(opcional)</small></span>
                <input type="time" step={60} value={form.eventTime} onChange={(event) => updateField("eventTime", event.target.value)} />
              </label>
            </div>
            <label className="admin-field">
              <span>Lugar <small>(opcional)</small></span>
              <input maxLength={EVENT_FIELD_LIMITS.location} placeholder="Ej. Parque principal de Paipa" value={form.location} onChange={(event) => updateField("location", event.target.value)} />
            </label>
            <label className="admin-field">
              <span>Descripción <small>(opcional)</small></span>
              <textarea rows={3} maxLength={EVENT_FIELD_LIMITS.description} value={form.description} onChange={(event) => updateField("description", event.target.value)} />
            </label>
            <label className="admin-field">
              <span>Publicación en Instagram <small>(opcional)</small></span>
              <input type="url" inputMode="url" maxLength={EVENT_FIELD_LIMITS.url} placeholder="https://www.instagram.com/p/..." value={form.instagramUrl} onChange={(event) => updateField("instagramUrl", event.target.value)} />
            </label>
            <label className="admin-field">
              <span>Publicación en Facebook <small>(opcional)</small></span>
              <input type="url" inputMode="url" maxLength={EVENT_FIELD_LIMITS.url} placeholder="https://www.facebook.com/..." value={form.facebookUrl} onChange={(event) => updateField("facebookUrl", event.target.value)} />
            </label>
            <label className="admin-field">
              <span>Publicación en TikTok <small>(opcional)</small></span>
              <input type="url" inputMode="url" maxLength={EVENT_FIELD_LIMITS.url} placeholder="https://www.tiktok.com/@..." value={form.tiktokUrl} onChange={(event) => updateField("tiktokUrl", event.target.value)} />
            </label>

            {editingEvent && (
              <div className="admin-current-image">
                <div className="admin-current-image-thumb">
                  <Image src={getPublicImageUrl(EVENT_FLYERS_BUCKET, editingEvent.flyer_path)!} alt={`Flyer actual de ${editingEvent.title}`} fill sizes="72px" />
                </div>
                <div className="admin-current-image-copy">
                  <strong>Flyer actual</strong>
                  <span>Elige otro archivo solo si quieres reemplazarlo.</span>
                </div>
              </div>
            )}

            <label className="admin-field admin-file-field">
              <span>{editingId === null ? "Flyer" : "Nuevo flyer"}</span>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFlyerChange} />
              <small>{flyerFile ? flyerFile.name : "JPG, PNG o WebP. Cualquier formato (cuadrado, vertical u horizontal); se optimiza automáticamente."}</small>
            </label>

            {notice && <p className={`admin-message ${notice.type}`} role="status">{notice.text}</p>}
            <button className="btn btn-primary admin-submit" type="submit" disabled={busy}>
              {busy ? "Guardando…" : editingId === null ? "Crear evento" : "Guardar cambios"}
            </button>
          </form>
        </section>

        <section className="admin-panel admin-dog-list-panel">
          <div className="admin-panel-heading admin-list-heading">
            <div><p className="admin-kicker">Publicados</p><h3>Eventos</h3></div>
          </div>
          <p className="admin-result-count">{events.length} {events.length === 1 ? "evento" : "eventos"}</p>
          <div className="admin-dog-list">
            {events.map((event) => {
              const past = isPastEvent(event);
              return (
                <article className={`admin-dog-row${past ? " is-adopted" : ""}`} key={event.id}>
                  <div className="admin-dog-thumb has-image">
                    <Image src={getPublicImageUrl(EVENT_FLYERS_BUCKET, event.flyer_path)!} alt={`Flyer de ${event.title}`} fill sizes="76px" />
                  </div>
                  <div className="admin-dog-summary">
                    <h3>{event.title}{past && <em className="admin-adopted-badge">Finalizado</em>}</h3>
                    <p>{formatEventDate(event.event_date)}{event.event_time && ` · ${formatEventTime(event.event_time)}`}</p>
                    {event.location && <span>{event.location}</span>}
                  </div>
                  <div className="admin-row-actions">
                    <button type="button" onClick={() => startEditing(event)} disabled={busy}>Editar</button>
                    <button className="danger" type="button" onClick={() => removeEvent(event)} disabled={busy}>Eliminar</button>
                  </div>
                </article>
              );
            })}
            {events.length === 0 && <div className="admin-empty"><strong>Aún no hay eventos.</strong><span>Crea el primero con el formulario.</span></div>}
          </div>
        </section>
      </div>
    </section>
  );
}
