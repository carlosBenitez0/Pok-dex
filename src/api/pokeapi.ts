import axios from "axios";

export const API = "https://pokeapi.co/api/v2";

// Promesas en memoria: evita repetir peticiones al navegar entre páginas.
const memory = new Map<string, Promise<unknown>>();

/**
 * GET con caché.
 * - Siempre cachea en memoria durante la sesión de la pestaña.
 * - Con `persist`, también guarda en sessionStorage (solo para respuestas
 *   pequeñas; /pokemon/{id} pesa cientos de KB y llenaría la cuota).
 */
export function fetchJson<T>(url: string, persist = false): Promise<T> {
  const cached = memory.get(url);
  if (cached) return cached as Promise<T>;

  if (persist) {
    try {
      const stored = sessionStorage.getItem(url);
      if (stored) {
        const p = Promise.resolve(JSON.parse(stored) as T);
        memory.set(url, p);
        return p;
      }
    } catch {
      /* storage no disponible: seguimos con red */
    }
  }

  const request = axios.get<T>(url).then((res) => {
    if (persist) {
      try {
        sessionStorage.setItem(url, JSON.stringify(res.data));
      } catch {
        /* cuota llena o modo privado */
      }
    }
    return res.data;
  });
  // Si falla, no dejamos la promesa rechazada en caché.
  request.catch(() => memory.delete(url));
  memory.set(url, request);
  return request;
}
