// Genera los datos estáticos de la Pokédex a partir de PokéAPI.
// Se ejecuta UNA vez en desarrollo (`npm run data`) y el resultado se versiona
// en src/data/. La app no consulta ninguna API para la lista.
//
//   src/data/pokedex.json  → 1025 especies + formas (regionales, Mega, Gigamax)
//   src/data/moves.json    → todos los movimientos con tipo, potencia, precisión…

import { mkdir, writeFile } from "node:fs/promises";

const API = "https://pokeapi.co/api/v2";
const TOTAL = 1025;
const CONCURRENCY = 12;
const OUT_DIR = new URL("../src/data/", import.meta.url);

const FORM_PATTERN = /-(alola|galar|hisui|paldea|mega|mega-x|mega-y|gmax|primal)(-|$)/;
const FORM_EXCLUDE = /-(totem|cap|starter|busted|cosplay)/;

async function getJson(url, tries = 4) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { "user-agent": "pokedex-data-script" } });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`${res.status} ${url}`);
      return await res.json();
    } catch (err) {
      if (i === tries - 1) throw err;
      await new Promise((r) => setTimeout(r, 500 * 2 ** i));
    }
  }
}

async function pool(items, worker, label) {
  const out = new Array(items.length);
  let next = 0;
  let done = 0;
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await worker(items[i]);
        if (++done % 100 === 0) console.log(`  ${label}: ${done}/${items.length}`);
      }
    }),
  );
  return out;
}

const STAT_ORDER = ["hp", "attack", "defense", "special-attack", "special-defense", "speed"];

function compactPokemon(p) {
  const stats = STAT_ORDER.map((k) => p.stats.find((s) => s.stat.name === k)?.base_stat ?? 0);
  const s = p.sprites;
  return {
    id: p.id,
    name: p.name,
    types: [...p.types].sort((a, b) => a.slot - b.slot).map((t) => t.type.name),
    stats,
    height: p.height, // decímetros
    weight: p.weight, // hectogramos
    // Qué sprites existen (las URLs se construyen a partir del id).
    sprites: [
      s.front_default ? 1 : 0,
      s.back_default ? 1 : 0,
      s.front_shiny ? 1 : 0,
      s.back_shiny ? 1 : 0,
    ],
  };
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  console.log("Generaciones…");
  const genOf = new Map();
  for (let g = 1; g <= 9; g++) {
    const gen = await getJson(`${API}/generation/${g}`);
    for (const sp of gen.pokemon_species) genOf.set(sp.name, g);
  }

  console.log("Especies 1–1025…");
  const ids = Array.from({ length: TOTAL }, (_, i) => i + 1);
  const species = await pool(
    ids,
    async (id) => {
      const p = await getJson(`${API}/pokemon/${id}`);
      return { ...compactPokemon(p), gen: genOf.get(p.species.name) ?? 0 };
    },
    "especies",
  );

  console.log("Formas (regionales, Mega, Gigamax)…");
  const list = await getJson(`${API}/pokemon?limit=2000`);
  const formRefs = list.results.filter(
    (r) => FORM_PATTERN.test(r.name) && !FORM_EXCLUDE.test(r.name),
  );
  const forms = await pool(
    formRefs,
    async (ref) => {
      const p = await getJson(ref.url);
      if (!p || p.id <= TOTAL) return null;
      const speciesId = Number(p.species.url.split("/").filter(Boolean).pop());
      return { ...compactPokemon(p), speciesId };
    },
    "formas",
  );
  const bySpecies = new Map(species.map((s) => [s.id, s]));
  for (const f of forms.filter(Boolean)) {
    const base = bySpecies.get(f.speciesId);
    if (!base) continue;
    (base.forms ??= []).push({
      id: f.id,
      name: f.name,
      types: f.types,
      stats: f.stats,
      height: f.height,
      weight: f.weight,
      sprites: f.sprites,
    });
  }

  await writeFile(
    new URL("pokedex.json", OUT_DIR),
    JSON.stringify({ generatedAt: new Date().toISOString().slice(0, 10), pokemon: species }),
  );
  console.log(`pokedex.json: ${species.length} especies, ${forms.filter(Boolean).length} formas`);

  console.log("Movimientos…");
  const moveList = await getJson(`${API}/move?limit=2000`);
  const moves = await pool(
    moveList.results,
    async (ref) => {
      const m = await getJson(ref.url);
      if (!m) return null;
      const nameIn = (lang) => m.names.find((n) => n.language.name === lang)?.name;
      return [
        m.name,
        {
          type: m.type?.name ?? "normal",
          cls: m.damage_class?.name ?? "status", // physical | special | status
          power: m.power,
          acc: m.accuracy,
          pp: m.pp,
          es: nameIn("es") ?? null,
          en: nameIn("en") ?? null,
        },
      ];
    },
    "movimientos",
  );
  await writeFile(new URL("moves.json", OUT_DIR), JSON.stringify(Object.fromEntries(moves.filter(Boolean))));
  console.log(`moves.json: ${moves.filter(Boolean).length} movimientos`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
