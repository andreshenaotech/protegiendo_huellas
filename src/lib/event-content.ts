import type { Tables } from "@/types/database";

export type FoundationEvent = Tables<"events">;

export type EventValues = {
  title: string;
  description: string;
  eventDate: string;
  eventTime: string;
  location: string;
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
};

export const EVENTS_CACHE_TAG = "events";
export const EVENT_TIME_ZONE = "America/Bogota";

export const EVENT_FIELD_LIMITS = {
  title: 120,
  description: 600,
  location: 160,
  url: 500,
};

export const emptyEventValues: EventValues = {
  title: "",
  description: "",
  eventDate: "",
  eventTime: "",
  location: "",
  instagramUrl: "",
  facebookUrl: "",
  tiktokUrl: "",
};

export function eventToValues(event: FoundationEvent): EventValues {
  return {
    title: event.title,
    description: event.description ?? "",
    eventDate: event.event_date,
    eventTime: event.event_time?.slice(0, 5) ?? "",
    location: event.location ?? "",
    instagramUrl: event.instagram_url ?? "",
    facebookUrl: event.facebook_url ?? "",
    tiktokUrl: event.tiktok_url ?? "",
  };
}

const URL_FIELDS = ["instagramUrl", "facebookUrl", "tiktokUrl"] as const;

export function normalizeEventValues(values: EventValues): EventValues {
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    eventDate: values.eventDate.trim(),
    eventTime: values.eventTime.trim().slice(0, 5),
    location: values.location.trim(),
    instagramUrl: values.instagramUrl.trim(),
    facebookUrl: values.facebookUrl.trim(),
    tiktokUrl: values.tiktokUrl.trim(),
  };
}

export function validateEventValues(values: EventValues) {
  if (!values.title) return "Escribe el título del evento.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(values.eventDate)) return "Elige la fecha del evento.";
  if (values.eventTime && !/^\d{2}:\d{2}$/.test(values.eventTime)) return "La hora no es válida.";
  if (values.title.length > EVENT_FIELD_LIMITS.title) return "El título es demasiado largo.";
  if (values.description.length > EVENT_FIELD_LIMITS.description) return "La descripción es demasiado larga.";
  if (values.location.length > EVENT_FIELD_LIMITS.location) return "El lugar es demasiado largo.";
  for (const field of URL_FIELDS) {
    const url = values[field];
    if (url && (!/^https:\/\/\S+$/.test(url) || url.length > EVENT_FIELD_LIMITS.url)) {
      return "Los enlaces deben empezar por https:// y ser válidos.";
    }
  }
  return null;
}

// Fecha de hoy en Colombia en formato YYYY-MM-DD.
export function todayInColombia(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: EVENT_TIME_ZONE }).format(now);
}

// Un evento pasa a "ya pasaron" desde el día siguiente a su fecha.
export function isPastEvent(event: Pick<FoundationEvent, "event_date">, today = todayInColombia()) {
  return event.event_date < today;
}

export function formatEventDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  const formatted = new Intl.DateTimeFormat("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function formatEventTime(time: string | null) {
  if (!time) return null;
  const [hours, minutes] = time.split(":").map(Number);
  return new Intl.DateTimeFormat("es-CO", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "UTC" })
    .format(new Date(Date.UTC(2000, 0, 1, hours, minutes)));
}
