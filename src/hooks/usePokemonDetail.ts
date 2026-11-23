import { useEffect, useState } from "react";
import { API, fetchJson } from "../api/pokeapi";
import {
  ApiAbility,
  ApiEvolutionChain,
  ApiEvolutionNode,
  ApiPokemon,
  ApiSpecies,
  EvolutionStage,
  PokemonDetail,
} from "../interfaces/IPokemonDetail";
import { capitalize } from "../utils/format";

const LANGS = ["es", "en"];

/** Primer texto en español; si no hay, en inglés. */
function pickLang<T extends { language: { name: string } }>(
  entries: T[],
  get: (e: T) => string,
): string {
  for (const lang of LANGS) {
    const found = entries.filter((e) => e.language.name === lang);
    // Las entradas más recientes suelen estar al final.
    if (found.length) return get(found[found.length - 1]);
  }
  return "";
}

const cleanText = (s: string) =>
  s.replace(/[\f\n\r­]+/g, " ").replace(/\s+/g, " ").trim();

const STAT_LABELS: Record<string, string> = {
  hp: "PS",
  attack: "ATQ",
  defense: "DEF",
  "special-attack": "AT.ESP",
  "special-defense": "DEF.ESP",
  speed: "VEL",
};

const idFromUrl = (url: string) => Number(url.split("/").filter(Boolean).pop());

const prettify = (s: string) => s.split("-").map(capitalize).join(" ");

function describeEvolution(node: ApiEvolutionNode): string {
  const d = node.evolution_details[0];
  if (!d) return "";
  if (d.min_level) return `Nv. ${d.min_level}`;
  if (d.item) return prettify(d.item.name);
  if (d.trigger.name === "trade")
    return d.held_item ? `Intercambio + ${prettify(d.held_item.name)}` : "Intercambio";
  if (d.min_happiness)
    return d.time_of_day ? `Amistad (${d.time_of_day === "day" ? "día" : "noche"})` : "Amistad";
  if (d.known_move) return `Con ${prettify(d.known_move.name)}`;
  if (d.location) return `En ${prettify(d.location.name)}`;
  return prettify(d.trigger.name);
}

/** Aplana el árbol evolutivo por niveles de profundidad. */
function flattenChain(root: ApiEvolutionNode): EvolutionStage[][] {
  const stages: EvolutionStage[][] = [];
  const walk = (node: ApiEvolutionNode, depth: number) => {
    (stages[depth] ??= []).push({
      id: idFromUrl(node.species.url),
      name: node.species.name,
      how: depth === 0 ? "" : describeEvolution(node),
    });
    node.evolves_to.forEach((child) => walk(child, depth + 1));
  };
  walk(root, 0);
  return stages;
}

function pickMoves(p: ApiPokemon) {
  // Preferimos FireRed/LeafGreen (era GBA); si no aparece, el grupo más reciente.
  const levelUp = (vg?: string) =>
    p.moves
      .flatMap((m) =>
        m.version_group_details
          .filter(
            (d) =>
              d.move_learn_method.name === "level-up" &&
              (!vg || d.version_group.name === vg),
          )
          .map((d) => ({ name: prettify(m.move.name), level: d.level_learned_at, vg: d.version_group.name })),
      );

  let version = "firered-leafgreen";
  let moves = levelUp(version);
  if (moves.length === 0) {
    const all = levelUp();
    version = all.length ? all[all.length - 1].vg : "";
    moves = all.filter((m) => m.vg === version);
  }
  const seen = new Set<string>();
  return {
    version,
    moves: moves
      .sort((a, b) => a.level - b.level || a.name.localeCompare(b.name))
      .filter((m) => (seen.has(m.name + m.level) ? false : seen.add(m.name + m.level)))
      .map(({ name, level }) => ({ name, level })),
  };
}

export async function loadPokemonDetail(id: number): Promise<PokemonDetail> {
  const [pokemon, species] = await Promise.all([
    fetchJson<ApiPokemon>(`${API}/pokemon/${id}`),
    fetchJson<ApiSpecies>(`${API}/pokemon-species/${id}`),
  ]);

  const [chain, abilities] = await Promise.all([
    fetchJson<ApiEvolutionChain>(species.evolution_chain.url, true).catch(() => null),
    Promise.all(
      pokemon.abilities.map((a) =>
        fetchJson<ApiAbility>(a.ability.url, true).catch(() => null),
      ),
    ),
  ]);

  const gen3 = pokemon.sprites.versions?.["generation-iii"];
  const gba = gen3?.["firered-leafgreen"];
  const stats = pokemon.stats.map((s) => ({
    key: s.stat.name,
    label: STAT_LABELS[s.stat.name] ?? s.stat.name,
    value: s.base_stat,
  }));
  const { moves, version } = pickMoves(pokemon);

  return {
    id: pokemon.id,
    name: pokemon.name,
    displayName:
      pickLang(species.names, (n) => n.name) || capitalize(pokemon.name),
    genus: pickLang(species.genera, (g) => g.genus),
    description: cleanText(pickLang(species.flavor_text_entries, (f) => f.flavor_text)),
    types: [...pokemon.types].sort((a, b) => a.slot - b.slot).map((t) => t.type.name),
    height: pokemon.height / 10,
    weight: pokemon.weight / 10,
    baseExperience: pokemon.base_experience,
    abilities: pokemon.abilities.map((a, i) => {
      const info = abilities[i];
      return {
        name: info ? pickLang(info.names, (n) => n.name) : prettify(a.ability.name),
        hidden: a.is_hidden,
        description: info
          ? cleanText(pickLang(info.flavor_text_entries, (f) => f.flavor_text))
          : "",
      };
    }),
    stats,
    statTotal: stats.reduce((acc, s) => acc + s.value, 0),
    moves,
    movesVersion: prettify(version),
    evolution: chain ? flattenChain(chain.chain) : [],
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
      front: gba?.front_default ?? gen3?.emerald?.front_default ?? pokemon.sprites.front_default,
      back: gba?.back_default ?? pokemon.sprites.back_default ?? null,
      frontShiny: gba?.front_shiny ?? pokemon.sprites.front_shiny ?? null,
      backShiny: gba?.back_shiny ?? pokemon.sprites.back_shiny ?? null,
      artwork: pokemon.sprites.other?.["official-artwork"]?.front_default ?? null,
    },
  };
}

type State =
  | { status: "loading"; data: PokemonDetail | null }
  | { status: "ready"; data: PokemonDetail }
  | { status: "error"; data: PokemonDetail | null; error: string };

export const usePokemonDetail = (id: number) => {
  const [state, setState] = useState<State>({ status: "loading", data: null });

  useEffect(() => {
    if (!Number.isInteger(id) || id < 1) {
      setState({ status: "error", data: null, error: "Pokémon no válido" });
      return;
    }
    let cancelled = false;
    // Conserva los datos anteriores mientras carga (para animar la transición).
    setState((prev) => ({ status: "loading", data: prev.data }));
    loadPokemonDetail(id)
      .then((data) => {
        if (!cancelled) setState({ status: "ready", data });
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setState((prev) => ({
            status: "error",
            data: prev.data,
            error: err instanceof Error ? err.message : "Error de red",
          }));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return state;
};
