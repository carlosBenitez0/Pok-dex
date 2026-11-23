// Formato de src/data/pokedex.json (generado por scripts/build-data.mjs).

/** [frente, espalda, frente shiny, espalda shiny]: 1 si existe el sprite. */
export type SpriteFlags = [number, number, number, number];

export interface PokemonForm {
  id: number;
  name: string;
  types: string[];
  /** [ps, atq, def, at.esp, def.esp, vel] */
  stats: number[];
  height: number; // decímetros
  weight: number; // hectogramos
  sprites: SpriteFlags;
}

export interface PokedexEntry extends PokemonForm {
  gen: number;
  forms?: PokemonForm[];
}

export interface PokedexFile {
  generatedAt: string;
  pokemon: PokedexEntry[];
}

export interface MoveInfo {
  type: string;
  cls: "physical" | "special" | "status";
  power: number | null;
  acc: number | null;
  pp: number | null;
  es: string | null;
  en: string | null;
}

export type MovesFile = Record<string, MoveInfo>;
