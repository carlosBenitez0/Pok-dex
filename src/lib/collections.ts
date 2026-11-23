import { useSyncExternalStore } from "react";

// Favoritos, equipo y comparador: listas de ids guardadas en localStorage.
// Store mínimo compartido entre páginas (sin backend ni base de datos).

export const TEAM_MAX = 6;
export const COMPARE_MAX = 2;

type Key = "favorites" | "team" | "compare";
const LIMITS: Record<Key, number> = { favorites: Infinity, team: TEAM_MAX, compare: COMPARE_MAX };

const read = (key: Key): number[] => {
  try {
    const raw = window.localStorage.getItem(`pokedex.${key}`);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((n) => Number.isInteger(n)) : [];
  } catch {
    return [];
  }
};

const state: Record<Key, number[]> = {
  favorites: read("favorites"),
  team: read("team"),
  compare: read("compare"),
};
const listeners = new Set<() => void>();

function set(key: Key, next: number[]) {
  state[key] = next;
  try {
    window.localStorage.setItem(`pokedex.${key}`, JSON.stringify(next));
  } catch {
    /* storage no disponible: sigue funcionando en memoria */
  }
  listeners.forEach((l) => l());
}

// Sincroniza entre pestañas.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    const key = e.key?.replace("pokedex.", "") as Key | undefined;
    if (key && key in state) {
      state[key] = read(key);
      listeners.forEach((l) => l());
    }
  });
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const collections = {
  has: (key: Key, id: number) => state[key].includes(id),
  isFull: (key: Key) => state[key].length >= LIMITS[key],
  /** Añade o quita. Devuelve false si no cabe. En el comparador, el más antiguo sale. */
  toggle(key: Key, id: number): boolean {
    const list = state[key];
    if (list.includes(id)) {
      set(key, list.filter((x) => x !== id));
      return true;
    }
    if (list.length >= LIMITS[key]) {
      if (key !== "compare") return false;
      set(key, [...list.slice(1), id]);
      return true;
    }
    set(key, [...list, id]);
    return true;
  },
  remove: (key: Key, id: number) => set(key, state[key].filter((x) => x !== id)),
  replace: (key: Key, ids: number[]) => set(key, ids.slice(0, LIMITS[key])),
  clear: (key: Key) => set(key, []),
};

export function useCollection(key: Key): number[] {
  return useSyncExternalStore(subscribe, () => state[key]);
}
