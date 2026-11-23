import { describe, expect, it } from "vitest";
import { filterPokedex, matchesSearch, suggest, typeFromQuery, type Filters } from "./filter";
import type { PokedexEntry } from "../data/types";
import data from "../data/pokedex.json";

const list = (data as unknown as { pokemon: PokedexEntry[] }).pokemon;

const base: Filters = {
  search: "",
  gen: 0,
  types: [],
  favoritesOnly: false,
  favorites: new Set(),
  sort: "number",
  dir: "asc",
};

const byName = (name: string) => list.find((p) => p.name === name)!;

describe("datos empaquetados", () => {
  it("contiene las 1025 especies en orden y con generación", () => {
    expect(list).toHaveLength(1025);
    expect(list[0].name).toBe("bulbasaur");
    expect(list[1024].id).toBe(1025);
    expect(list.every((p) => p.gen >= 1 && p.gen <= 9)).toBe(true);
  });

  it("incluye formas regionales, Mega y Gigamax", () => {
    const names = byName("charizard").forms?.map((f) => f.name);
    expect(names).toEqual(expect.arrayContaining(["charizard-mega-x", "charizard-mega-y", "charizard-gmax"]));
    expect(byName("vulpix").forms?.some((f) => f.name === "vulpix-alola")).toBe(true);
  });
});

describe("typeFromQuery", () => {
  it("reconoce tipos en español e inglés, con o sin tildes", () => {
    expect(typeFromQuery("fuego")).toBe("fire");
    expect(typeFromQuery("Eléctrico")).toBe("electric");
    expect(typeFromQuery("electrico")).toBe("electric");
    expect(typeFromQuery("dark")).toBe("dark");
    expect(typeFromQuery("charmander")).toBeUndefined();
  });
});

describe("matchesSearch", () => {
  const pikachu = byName("pikachu");
  it("busca por nombre, número y tipo", () => {
    expect(matchesSearch(pikachu, "pika")).toBe(true);
    expect(matchesSearch(pikachu, "#025")).toBe(true);
    expect(matchesSearch(pikachu, "25")).toBe(true);
    expect(matchesSearch(pikachu, "eléctrico")).toBe(true);
    expect(matchesSearch(pikachu, "agua")).toBe(false);
  });
  it("convierte espacios en guiones (nombres compuestos)", () => {
    expect(matchesSearch(byName("mr-mime"), "mr mime")).toBe(true);
  });
});

describe("filterPokedex", () => {
  it("filtra por generación", () => {
    const gen1 = filterPokedex(list, { ...base, gen: 1 });
    expect(gen1).toHaveLength(151);
    expect(gen1[gen1.length - 1].name).toBe("mew");
  });

  it("con dos tipos exige ambos", () => {
    const result = filterPokedex(list, { ...base, types: ["water", "flying"] });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((p) => p.types.includes("water") && p.types.includes("flying"))).toBe(true);
    expect(result.map((p) => p.name)).toContain("gyarados");
  });

  it("combina búsqueda, tipo y orden (el bug original del checkbox)", () => {
    const result = filterPokedex(list, { ...base, search: "char", types: ["fire"], sort: "name" });
    const names = result.map((p) => p.name);
    expect(names).toEqual([...names].sort());
    expect(names).toContain("charmander");
    expect(names).not.toContain("charjabug"); // bicho/eléctrico
  });

  it("ordena por total de stats descendente", () => {
    const [first] = filterPokedex(list, { ...base, sort: "total", dir: "desc" });
    expect(first.name).toBe("arceus"); // 720, la especie con más total
  });

  it("solo favoritos", () => {
    const result = filterPokedex(list, { ...base, favoritesOnly: true, favorites: new Set([1, 4, 7]) });
    expect(result.map((p) => p.id)).toEqual([1, 4, 7]);
  });
});

describe("suggest", () => {
  it("prioriza los que empiezan por el texto y limita el número", () => {
    const s = suggest(list, "char", 6);
    expect(s).toHaveLength(6);
    expect(s[0].name).toBe("charmander");
    expect(s.slice(0, 3).map((p) => p.name)).toEqual(["charmander", "charmeleon", "charizard"]);
  });
  it("devuelve vacío sin texto", () => {
    expect(suggest(list, "  ")).toEqual([]);
  });
});
