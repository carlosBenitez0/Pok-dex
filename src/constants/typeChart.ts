// Tabla defensiva (Gen VI+): para cada tipo defensor, qué tipos atacantes le
// hacen x2, x0.5 o x0. Estática para no pedir 18 endpoints /type a la API.
type Defense = { weak: string[]; resist: string[]; immune: string[] };

const CHART: Record<string, Defense> = {
  normal: { weak: ["fighting"], resist: [], immune: ["ghost"] },
  fire: {
    weak: ["water", "ground", "rock"],
    resist: ["fire", "grass", "ice", "bug", "steel", "fairy"],
    immune: [],
  },
  water: {
    weak: ["electric", "grass"],
    resist: ["fire", "water", "ice", "steel"],
    immune: [],
  },
  electric: {
    weak: ["ground"],
    resist: ["electric", "flying", "steel"],
    immune: [],
  },
  grass: {
    weak: ["fire", "ice", "poison", "flying", "bug"],
    resist: ["water", "electric", "grass", "ground"],
    immune: [],
  },
  ice: {
    weak: ["fire", "fighting", "rock", "steel"],
    resist: ["ice"],
    immune: [],
  },
  fighting: {
    weak: ["flying", "psychic", "fairy"],
    resist: ["bug", "rock", "dark"],
    immune: [],
  },
  poison: {
    weak: ["ground", "psychic"],
    resist: ["grass", "fighting", "poison", "bug", "fairy"],
    immune: [],
  },
  ground: {
    weak: ["water", "grass", "ice"],
    resist: ["poison", "rock"],
    immune: ["electric"],
  },
  flying: {
    weak: ["electric", "ice", "rock"],
    resist: ["grass", "fighting", "bug"],
    immune: ["ground"],
  },
  psychic: {
    weak: ["bug", "ghost", "dark"],
    resist: ["fighting", "psychic"],
    immune: [],
  },
  bug: {
    weak: ["fire", "flying", "rock"],
    resist: ["grass", "fighting", "ground"],
    immune: [],
  },
  rock: {
    weak: ["water", "grass", "fighting", "ground", "steel"],
    resist: ["normal", "fire", "poison", "flying"],
    immune: [],
  },
  ghost: {
    weak: ["ghost", "dark"],
    resist: ["poison", "bug"],
    immune: ["normal", "fighting"],
  },
  dragon: {
    weak: ["ice", "dragon", "fairy"],
    resist: ["fire", "water", "electric", "grass"],
    immune: [],
  },
  dark: {
    weak: ["fighting", "bug", "fairy"],
    resist: ["ghost", "dark"],
    immune: ["psychic"],
  },
  steel: {
    weak: ["fire", "fighting", "ground"],
    resist: [
      "normal", "grass", "ice", "flying", "psychic",
      "bug", "rock", "dragon", "steel", "fairy",
    ],
    immune: ["poison"],
  },
  fairy: {
    weak: ["poison", "steel"],
    resist: ["fighting", "bug", "dark"],
    immune: ["dragon"],
  },
};

export const ALL_TYPES = Object.keys(CHART);

/** Multiplicador de daño recibido por un Pokémon con `defTypes` ante `attack`. */
export const damageMultiplier = (attack: string, defTypes: string[]) =>
  defTypes.reduce((acc, def) => {
    const d = CHART[def];
    if (!d) return acc;
    if (d.immune.includes(attack)) return 0;
    if (d.weak.includes(attack)) return acc * 2;
    if (d.resist.includes(attack)) return acc * 0.5;
    return acc;
  }, 1);

/** Agrupa todos los tipos atacantes por multiplicador (x4, x2, x½, x¼, x0). */
export const defensiveProfile = (defTypes: string[]) => {
  const groups: Record<string, string[]> = {
    "4": [], "2": [], "0.5": [], "0.25": [], "0": [],
  };
  for (const attack of ALL_TYPES) {
    const m = damageMultiplier(attack, defTypes);
    if (String(m) in groups) groups[String(m)].push(attack);
  }
  return groups;
};

export const TYPE_HEX: Record<string, string> = {
  normal: "#A8A876", fire: "#ED8030", water: "#698FEF", grass: "#7AC757",
  electric: "#F9CE2F", ice: "#9AD9D8", fighting: "#C52E2A", poison: "#9E40A0",
  ground: "#DEBD67", flying: "#A990F1", psychic: "#F85888", bug: "#AAB821",
  rock: "#B5A038", ghost: "#6D579A", dark: "#6E5646", dragon: "#7139FC",
  steel: "#B8B8D4", fairy: "#EDB3BC",
};

export const TYPE_ES: Record<string, string> = {
  normal: "Normal", fire: "Fuego", water: "Agua", grass: "Planta",
  electric: "Eléctrico", ice: "Hielo", fighting: "Lucha", poison: "Veneno",
  ground: "Tierra", flying: "Volador", psychic: "Psíquico", bug: "Bicho",
  rock: "Roca", ghost: "Fantasma", dark: "Siniestro", dragon: "Dragón",
  steel: "Acero", fairy: "Hada",
};
