// ---- Respuestas crudas de PokéAPI (solo los campos que usamos) ----

export interface NamedResource {
  name: string;
  url: string;
}

type SpriteSet = {
  front_default: string | null;
  back_default?: string | null;
  front_shiny?: string | null;
  back_shiny?: string | null;
};

export interface ApiPokemon {
  id: number;
  name: string;
  species: NamedResource;
  height: number;
  weight: number;
  base_experience: number | null;
  abilities: { ability: NamedResource; is_hidden: boolean; slot: number }[];
  types: { slot: number; type: NamedResource }[];
  stats: { base_stat: number; effort: number; stat: NamedResource }[];
  moves: {
    move: NamedResource;
    version_group_details: {
      level_learned_at: number;
      move_learn_method: NamedResource;
      version_group: NamedResource;
    }[];
  }[];
  cries?: { latest?: string | null; legacy?: string | null };
  sprites: SpriteSet & {
    other?: { "official-artwork"?: SpriteSet };
    versions?: {
      "generation-iii"?: {
        emerald?: SpriteSet;
        "firered-leafgreen"?: SpriteSet;
        "ruby-sapphire"?: SpriteSet;
      };
    };
  };
}

interface LangText {
  language: NamedResource;
}

export interface ApiSpecies {
  id: number;
  names: (LangText & { name: string })[];
  genera: (LangText & { genus: string })[];
  flavor_text_entries: (LangText & { flavor_text: string; version: NamedResource })[];
  habitat: NamedResource | null;
  generation: NamedResource;
  gender_rate: number;
  capture_rate: number;
  base_happiness: number | null;
  growth_rate: NamedResource;
  egg_groups: NamedResource[];
  is_legendary: boolean;
  is_mythical: boolean;
  evolution_chain: { url: string };
  varieties: { is_default: boolean; pokemon: NamedResource }[];
}

export interface ApiEncounter {
  location_area: NamedResource;
  version_details: { version: NamedResource; max_chance: number }[];
}

export interface ApiEvolutionNode {
  species: NamedResource;
  evolution_details: {
    min_level: number | null;
    trigger: NamedResource;
    item: NamedResource | null;
    held_item: NamedResource | null;
    min_happiness: number | null;
    time_of_day: string;
    known_move: NamedResource | null;
    location: NamedResource | null;
  }[];
  evolves_to: ApiEvolutionNode[];
}

export interface ApiEvolutionChain {
  chain: ApiEvolutionNode;
}

export interface ApiAbility {
  name: string;
  names: (LangText & { name: string })[];
  flavor_text_entries: (LangText & { flavor_text: string })[];
}

// ---- Modelo normalizado que consume la UI ----

export interface DetailAbility {
  name: string;
  hidden: boolean;
  description: string;
}

export interface DetailStat {
  key: string;
  label: string;
  value: number;
}

export interface DetailMove {
  name: string;
  level: number;
  type: string | null;
  power: number | null;
  acc: number | null;
  cls: "physical" | "special" | "status" | null;
}

export type SpriteGame = "frlg" | "rs" | "emerald" | "modern";

export interface GameSprites {
  front: string | null;
  frontShiny: string | null;
}

export interface DetailEncounter {
  location: string;
  versions: string[];
  chance: number;
}

export interface EvolutionStage {
  id: number;
  name: string;
  /** Cómo se llega a esta etapa ("Nv. 16", "Piedra Fuego"…); vacío en la base. */
  how: string;
}

export interface PokemonDetail {
  id: number;
  /** Id de la especie (igual a `id` salvo en formas: 10034 → 6). */
  speciesId: number;
  name: string;
  /** Formas jugables de la especie (regionales, Mega, Gigamax…), con la base. */
  forms: { id: number; name: string }[];
  /** Sprites frontales por juego (las espaldas siempre son las completas). */
  spritesByGame: Partial<Record<SpriteGame, GameSprites>>;
  encounters: DetailEncounter[];
  displayName: string;
  genus: string;
  description: string;
  types: string[];
  height: number; // metros
  weight: number; // kg
  baseExperience: number | null;
  abilities: DetailAbility[];
  stats: DetailStat[];
  statTotal: number;
  moves: DetailMove[];
  movesVersion: string;
  /** Etapas por profundidad; cada etapa puede tener varias ramas (Eevee). */
  evolution: EvolutionStage[][];
  habitat: string | null;
  generation: string;
  genderRate: number; // -1 = sin género, si no n/8 hembra
  captureRate: number;
  baseHappiness: number | null;
  growthRate: string;
  eggGroups: string[];
  isLegendary: boolean;
  isMythical: boolean;
  cry: string | null;
  sprites: {
    front: string | null;
    back: string | null;
    frontShiny: string | null;
    backShiny: string | null;
    artwork: string | null;
  };
}
