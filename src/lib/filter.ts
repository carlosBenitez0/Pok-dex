import type { PokedexEntry } from "../data/types";
import { statTotal } from "../utils/format";
import { TYPE_NAMES } from "../i18n/dict";

export type SortKey = "number" | "name" | "total" | "weight" | "height";
export type SortDir = "asc" | "desc";

export interface Filters {
  search: string;
  /** 0 = todas */
  gen: number;
  /** Hasta 2 tipos; el Pokémon debe tenerlos todos. */
  types: string[];
  favoritesOnly: boolean;
  favorites: ReadonlySet<number>;
  sort: SortKey;
  dir: SortDir;
}

// Nombre de tipo (en cualquier idioma) → clave interna. "fuego" → "fire".
const TYPE_LOOKUP = new Map<string, string>();
for (const dict of Object.values(TYPE_NAMES))
  for (const [key, label] of Object.entries(dict)) {
    TYPE_LOOKUP.set(label.toLowerCase(), key);
    TYPE_LOOKUP.set(key, key);
  }
const stripAccents = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "");
for (const [label, key] of [...TYPE_LOOKUP]) TYPE_LOOKUP.set(stripAccents(label), key);

export const typeFromQuery = (q: string) => TYPE_LOOKUP.get(stripAccents(q.trim().toLowerCase()));

/** Coincidencia de búsqueda: número exacto (#25, 025), tipo, o nombre. */
export function matchesSearch(p: PokedexEntry, rawQuery: string): boolean {
  const q = stripAccents(rawQuery.trim().toLowerCase());
  if (!q) return true;
  const num = q.replace(/^#/, "");
  if (/^\d+$/.test(num)) return p.id === Number(num) || String(p.id).startsWith(num.replace(/^0+/, "") || "0");
  const type = typeFromQuery(q);
  if (type) return p.types.includes(type);
  return p.name.includes(q.replace(/\s+/g, "-"));
}

const SORTERS: Record<SortKey, (a: PokedexEntry, b: PokedexEntry) => number> = {
  number: (a, b) => a.id - b.id,
  name: (a, b) => a.name.localeCompare(b.name),
  total: (a, b) => statTotal(a.stats) - statTotal(b.stats) || a.id - b.id,
  weight: (a, b) => a.weight - b.weight || a.id - b.id,
  height: (a, b) => a.height - b.height || a.id - b.id,
};

export function filterPokedex(list: readonly PokedexEntry[], f: Filters): PokedexEntry[] {
  const out = list.filter(
    (p) =>
      (f.gen === 0 || p.gen === f.gen) &&
      f.types.every((t) => p.types.includes(t)) &&
      (!f.favoritesOnly || f.favorites.has(p.id)) &&
      matchesSearch(p, f.search),
  );
  const cmp = SORTERS[f.sort];
  out.sort(f.dir === "asc" ? cmp : (a, b) => cmp(b, a));
  return out;
}

/** Sugerencias para el autocompletado: prioriza los que empiezan por el texto. */
export function suggest(list: readonly PokedexEntry[], rawQuery: string, max = 6): PokedexEntry[] {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return [];
  const starts: PokedexEntry[] = [];
  const contains: PokedexEntry[] = [];
  for (const p of list) {
    if (!matchesSearch(p, q)) continue;
    (p.name.startsWith(q) || String(p.id) === q.replace(/^#?0*/, "") ? starts : contains).push(p);
    if (starts.length >= max) break;
  }
  return [...starts, ...contains].slice(0, max);
}
