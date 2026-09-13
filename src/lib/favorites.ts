// Favoritos del visitante: viven solo en su navegador (sin cuentas).
export const FAVORITES_STORAGE_KEY = "protegiendo-huellas:favoritos";

export function readStoredFavorites() {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(FAVORITES_STORAGE_KEY) ?? "[]");
    return new Set(Array.isArray(parsed) ? parsed.filter((id): id is number => Number.isInteger(id)) : []);
  } catch {
    return new Set<number>();
  }
}

export function storeFavorites(favorites: Set<number>) {
  try {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([...favorites]));
  } catch {
    // Almacenamiento bloqueado (modo privado, cuota): los favoritos duran la visita.
  }
}
