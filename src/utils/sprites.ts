import type { SpriteFlags } from "../data/types";

const BASE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

export const artworkUrl = (id: number, shiny = false) =>
  `${BASE}/other/official-artwork/${shiny ? "shiny/" : ""}${id}.png`;

/**
 * URL del sprite según las banderas de disponibilidad. Si falta la variante
 * pedida, cae a la más cercana (y al artwork oficial como último recurso).
 */
export function spriteUrl(
  id: number,
  flags: SpriteFlags,
  { shiny = false, back = false }: { shiny?: boolean; back?: boolean } = {},
): string {
  const [f, b, fs, bs] = flags;
  if (back && shiny && bs) return `${BASE}/back/shiny/${id}.png`;
  if (back && !shiny && b) return `${BASE}/back/${id}.png`;
  if (shiny && fs) return `${BASE}/shiny/${id}.png`;
  if (f) return `${BASE}/${id}.png`;
  return artworkUrl(id, shiny);
}

/** Sprite de Gen III (Rojo Fuego/Verde Hoja) para la GBA; existe hasta el #386. */
export const gen3SpriteUrl = (id: number) =>
  id <= 386
    ? `${BASE}/versions/generation-iii/firered-leafgreen/${id}.png`
    : `${BASE}/${id}.png`;
