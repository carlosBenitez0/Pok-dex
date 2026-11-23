import { useEffect, useState } from "react";
import type { PokedexEntry, PokedexFile } from "../data/types";

// Los datos van empaquetados en el proyecto (src/data/pokedex.json) y se
// cargan como un chunk aparte: no hay llamadas a ninguna API.
let cache: PokedexEntry[] | null = null;
let pending: Promise<PokedexEntry[]> | null = null;

export function loadPokedex(): Promise<PokedexEntry[]> {
  if (cache) return Promise.resolve(cache);
  pending ??= import("../data/pokedex.json").then((m) => {
    cache = (m.default as unknown as PokedexFile).pokemon;
    return cache;
  });
  return pending;
}

export function usePokedex() {
  const [list, setList] = useState<PokedexEntry[] | null>(cache);

  useEffect(() => {
    if (cache) return;
    let alive = true;
    loadPokedex().then((l) => alive && setList(l));
    return () => {
      alive = false;
    };
  }, []);

  return { list: list ?? [], loading: list === null };
}

/** Busca una especie o forma por id. */
export function findEntry(list: readonly PokedexEntry[], id: number) {
  for (const p of list) {
    if (p.id === id) return { entry: p, species: p };
    const form = p.forms?.find((f) => f.id === id);
    if (form) return { entry: { ...form, gen: p.gen }, species: p };
  }
  return null;
}
