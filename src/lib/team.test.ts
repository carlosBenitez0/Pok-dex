import { describe, expect, it } from "vitest";
import { teamDefense, teamOffense, teamThreats } from "./team";
import { damageMultiplier, defensiveProfile } from "../constants/typeChart";

describe("tabla de tipos", () => {
  it("multiplica en tipos dobles", () => {
    expect(damageMultiplier("ice", ["dragon", "flying"])).toBe(4); // Dragonite
    expect(damageMultiplier("electric", ["water", "flying"])).toBe(4); // Gyarados
    expect(damageMultiplier("fighting", ["bug", "flying"])).toBe(0.25);
  });
  it("respeta inmunidades", () => {
    expect(damageMultiplier("ground", ["electric", "flying"])).toBe(0);
    expect(damageMultiplier("normal", ["ghost"])).toBe(0);
    expect(damageMultiplier("dragon", ["fairy"])).toBe(0);
  });
  it("agrupa el perfil defensivo", () => {
    const p = defensiveProfile(["fire", "flying"]); // Charizard
    expect(p["4"]).toEqual(["rock"]);
    expect(p["0"]).toEqual(["ground"]);
    expect(p["0.25"]).toEqual(expect.arrayContaining(["grass", "bug"]));
  });
});

describe("cobertura del equipo", () => {
  const team = [
    ["fire", "flying"], // Charizard
    ["water", "flying"], // Gyarados
    ["bug", "flying"], // Butterfree
  ];

  it("cuenta débiles y resistentes por tipo atacante", () => {
    const rock = teamDefense(team).find((r) => r.attack === "rock")!;
    expect(rock.weak).toBe(3); // Charizard x4, Butterfree x4, Gyarados x2
    const electric = teamDefense(team).find((r) => r.attack === "electric")!;
    expect(electric.weak).toBe(3);
    expect(electric.resist).toBe(0);
  });

  it("avisa de amenazas sin resistencias", () => {
    const threats = teamThreats(team).map((r) => r.attack);
    expect(threats).toContain("electric");
    expect(threats).toContain("rock");
    expect(threats).not.toContain("ground"); // todos inmunes
  });

  it("calcula la cobertura ofensiva por STAB", () => {
    const grass = teamOffense(team).find((o) => o.target === "grass")!;
    expect(grass.by).toEqual(expect.arrayContaining(["fire", "flying", "bug"]));
    const dragon = teamOffense(team).find((o) => o.target === "dragon")!;
    expect(dragon.by).toEqual([]);
  });
});
