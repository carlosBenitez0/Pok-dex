import { useEffect, useState } from "react";
import { API, fetchJson } from "../api/pokeapi";
import {
  ApiAbility,
  ApiEncounter,
  ApiEvolutionChain,
  ApiEvolutionNode,
  ApiPokemon,
  ApiSpecies,
  DetailMove,
  EvolutionStage,
  GameSprites,
  PokemonDetail,
  SpriteGame,
} from "../interfaces/IPokemonDetail";
import type { MovesFile } from "../data/types";
import type { Lang } from "../i18n/dict";
import { capitalize, prettify } from "../utils/format";

// Movimientos con tipo/potencia: datos locales (src/data/moves.json), sin API.
let movesCache: Promise<MovesFile> | null = null;
const loadMoves = () =>
  (movesCache ??= import("../data/moves.json").then((m) => m.default as unknown as MovesFile));

const FORM_PATTERN = /-(alola|galar|hisui|paldea|mega|mega-x|mega-y|gmax|primal)(-|$)/;

/** Texto en el idioma pedido; si no existe, en el otro. */
function pickLang<T extends { language: { name: string } }>(
  entries: T[],
  get: (e: T) => string,
  lang: Lang,
): string {
  for (const l of lang === "es" ? ["es", "en"] : ["en", "es"]) {
    const found = entries.filter((e) => e.language.name === l);
    // Las entradas más recientes suelen estar al final.
    if (found.length) return get(found[found.length - 1]);
  }
  return "";
}

const cleanText = (s: string) =>
  s.replace(/[\f\n\r­]+/g, " ").replace(/\s+/g, " ").trim();

const STAT_LABELS: Record<Lang, Record<string, string>> = {
  es: { hp: "PS", attack: "ATQ", defense: "DEF", "special-attack": "AT.ESP", "special-defense": "DEF.ESP", speed: "VEL" },
  en: { hp: "HP", attack: "ATK", defense: "DEF", "special-attack": "SP.ATK", "special-defense": "SP.DEF", speed: "SPD" },
};

const idFromUrl = (url: string) => Number(url.split("/").filter(Boolean).pop());

function describeEvolution(node: ApiEvolutionNode, lang: Lang): string {
  const d = node.evolution_details[0];
  if (!d) return "";
  const es = lang === "es";
  if (d.min_level) return `${es ? "Nv." : "Lv."} ${d.min_level}`;
  if (d.item) return prettify(d.item.name);
  if (d.trigger.name === "trade") {
    const trade = es ? "Intercambio" : "Trade";
    return d.held_item ? `${trade} + ${prettify(d.held_item.name)}` : trade;
  }
  if (d.min_happiness) {
    const f = es ? "Amistad" : "Friendship";
    if (!d.time_of_day) return f;
    const tod = d.time_of_day === "day" ? (es ? "día" : "day") : es ? "noche" : "night";
    return `${f} (${tod})`;
  }
  if (d.known_move) return `${es ? "Con" : "Knows"} ${prettify(d.known_move.name)}`;
  if (d.location) return `${es ? "En" : "At"} ${prettify(d.location.name)}`;
  return prettify(d.trigger.name);
}

/** Aplana el árbol evolutivo por niveles de profundidad. */
function flattenChain(root: ApiEvolutionNode, lang: Lang): EvolutionStage[][] {
  const stages: EvolutionStage[][] = [];
  const walk = (node: ApiEvolutionNode, depth: number) => {
    (stages[depth] ??= []).push({
      id: idFromUrl(node.species.url),
      name: node.species.name,
      how: depth === 0 ? "" : describeEvolution(node, lang),
    });
    node.evolves_to.forEach((child) => walk(child, depth + 1));
  };
  walk(root, 0);
  return stages;
}

function pickMoves(p: ApiPokemon, moves: MovesFile, lang: Lang): { version: string; moves: DetailMove[] } {
  // Preferimos Rojo Fuego/Verde Hoja (era GBA); si no aparece, el grupo más reciente.
  const levelUp = (vg?: string) =>
    p.moves.flatMap((m) =>
      m.version_group_details
        .filter((d) => d.move_learn_method.name === "level-up" && (!vg || d.version_group.name === vg))
        .map((d) => ({ key: m.move.name, level: d.level_learned_at, vg: d.version_group.name })),
    );

  let version = "firered-leafgreen";
  let list = levelUp(version);
  if (list.length === 0) {
    const all = levelUp();
    version = all.length ? all[all.length - 1].vg : "";
    list = all.filter((m) => m.vg === version);
  }
  const seen = new Set<string>();
  return {
    version,
    moves: list
      .sort((a, b) => a.level - b.level || a.key.localeCompare(b.key))
      .filter((m) => (seen.has(m.key + m.level) ? false : (seen.add(m.key + m.level), true)))
      .map(({ key, level }) => {
        const info = moves[key];
        return {
          name: (info && (lang === "es" ? info.es ?? info.en : info.en ?? info.es)) || prettify(key),
          level,
          type: info?.type ?? null,
          power: info?.power ?? null,
          acc: info?.acc ?? null,
          cls: info?.cls ?? null,
        };
      }),
  };
}

const GAME_KEYS: Record<Exclude<SpriteGame, "modern">, string> = {
  frlg: "firered-leafgreen",
  rs: "ruby-sapphire",
  emerald: "emerald",
};

export async function loadPokemonDetail(id: number, lang: Lang = "es"): Promise<PokemonDetail> {
  const pokemon = await fetchJson<ApiPokemon>(`${API}/pokemon/${id}`);
  // Las formas (id > 10000) no tienen /pokemon-species/{id}: usamos su especie.
  const species = await fetchJson<ApiSpecies>(pokemon.species.url);

  const [chain, abilities, moves, encounters] = await Promise.all([
    fetchJson<ApiEvolutionChain>(species.evolution_chain.url, true).catch(() => null),
    Promise.all(pokemon.abilities.map((a) => fetchJson<ApiAbility>(a.ability.url, true).catch(() => null))),
    loadMoves(),
    fetchJson<ApiEncounter[]>(`${API}/pokemon/${id}/encounters`, true).catch(() => []),
  ]);

  const gen3 = pokemon.sprites.versions?.["generation-iii"];
  const spritesByGame: Partial<Record<SpriteGame, GameSprites>> = {};
  for (const [game, key] of Object.entries(GAME_KEYS) as [Exclude<SpriteGame, "modern">, string][]) {
    const set = gen3?.[key as keyof typeof gen3];
    if (set?.front_default) spritesByGame[game] = { front: set.front_default, frontShiny: set.front_shiny ?? null };
  }
  spritesByGame.modern = { front: pokemon.sprites.front_default, frontShiny: pokemon.sprites.front_shiny ?? null };

  const stats = pokemon.stats.map((s) => ({
    key: s.stat.name,
    label: STAT_LABELS[lang][s.stat.name] ?? s.stat.name,
    value: s.base_stat,
  }));
  const { moves: moveList, version } = pickMoves(pokemon, moves, lang);

  // Agrupa encuentros por zona (las versiones donde aparece).
  const byLocation = new Map<string, { versions: Set<string>; chance: number }>();
  for (const e of encounters) {
    const loc = prettify(e.location_area.name.replace(/-area$/, ""));
    const entry = byLocation.get(loc) ?? { versions: new Set(), chance: 0 };
    for (const v of e.version_details) {
      entry.versions.add(prettify(v.version.name));
      entry.chance = Math.max(entry.chance, v.max_chance);
    }
    byLocation.set(loc, entry);
  }

  const isForm = pokemon.id !== species.id;
  const baseName = pickLang(species.names, (n) => n.name, lang) || capitalize(pokemon.name);

  return {
    id: pokemon.id,
    speciesId: species.id,
    name: pokemon.name,
    forms: species.varieties
      .filter((v) => v.is_default || FORM_PATTERN.test(v.pokemon.name))
      .map((v) => ({ id: idFromUrl(v.pokemon.url), name: v.pokemon.name })),
    spritesByGame,
    encounters: [...byLocation].map(([location, v]) => ({
      location,
      versions: [...v.versions],
      chance: v.chance,
    })),
    displayName: isForm ? prettify(pokemon.name) : baseName,
    genus: pickLang(species.genera, (g) => g.genus, lang),
    description: cleanText(pickLang(species.flavor_text_entries, (f) => f.flavor_text, lang)),
    types: [...pokemon.types].sort((a, b) => a.slot - b.slot).map((t) => t.type.name),
    height: pokemon.height / 10,
    weight: pokemon.weight / 10,
    baseExperience: pokemon.base_experience,
    abilities: pokemon.abilities.map((a, i) => {
      const info = abilities[i];
      return {
        name: info ? pickLang(info.names, (n) => n.name, lang) : prettify(a.ability.name),
        hidden: a.is_hidden,
        description: info ? cleanText(pickLang(info.flavor_text_entries, (f) => f.flavor_text, lang)) : "",
      };
    }),
    stats,
    statTotal: stats.reduce((acc, s) => acc + s.value, 0),
    moves: moveList,
    movesVersion: prettify(version),
    evolution: chain ? flattenChain(chain.chain, lang) : [],
    habitat: species.habitat ? prettify(species.habitat.name) : null,
    generation: species.generation.name.replace("generation-", "").toUpperCase(),
    genderRate: species.gender_rate,
    captureRate: species.capture_rate,
    baseHappiness: species.base_happiness,
    growthRate: prettify(species.growth_rate.name),
    eggGroups: species.egg_groups.map((e) => prettify(e.name)),
    isLegendary: species.is_legendary,
    isMythical: species.is_mythical,
    cry: pokemon.cries?.latest ?? pokemon.cries?.legacy ?? null,
    sprites: {
      front: spritesByGame.frlg?.front ?? spritesByGame.emerald?.front ?? pokemon.sprites.front_default,
      // Las espaldas de Gen III vienen recortadas por abajo (las tapaba la UI de
      // combate), así que usamos las espaldas completas por defecto.
      back: pokemon.sprites.back_default ?? null,
      frontShiny: spritesByGame.frlg?.frontShiny ?? pokemon.sprites.front_shiny ?? null,
      backShiny: pokemon.sprites.back_shiny ?? null,
      artwork: pokemon.sprites.other?.["official-artwork"]?.front_default ?? null,
    },
  };
}

type State =
  | { status: "loading"; data: PokemonDetail | null }
  | { status: "ready"; data: PokemonDetail }
  | { status: "error"; data: PokemonDetail | null; error: string };

export const usePokemonDetail = (id: number, lang: Lang) => {
  const [state, setState] = useState<State>({ status: "loading", data: null });

  useEffect(() => {
    if (!Number.isInteger(id) || id < 1) {
      setState({ status: "error", data: null, error: lang === "es" ? "Pokémon no válido" : "Invalid Pokémon" });
      return;
    }
    let cancelled = false;
    // Conserva los datos anteriores mientras carga (para animar la transición).
    setState((prev) => ({ status: "loading", data: prev.data }));
    loadPokemonDetail(id, lang)
      .then((data) => {
        if (!cancelled) setState({ status: "ready", data });
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setState((prev) => ({
            status: "error",
            data: prev.data,
            error: err instanceof Error ? err.message : lang === "es" ? "Error de red" : "Network error",
          }));
      });
    return () => {
      cancelled = true;
    };
  }, [id, lang]);

  return state;
};
