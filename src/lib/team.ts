import { ALL_TYPES, damageMultiplier } from "../constants/typeChart";

export interface DefenseRow {
  attack: string;
  weak: number; // miembros que reciben x2 o x4
  resist: number; // miembros que reciben x½, x¼ o x0
}

/** Para cada tipo atacante: cuántos miembros son débiles y cuántos resisten. */
export function teamDefense(members: string[][]): DefenseRow[] {
  return ALL_TYPES.map((attack) => {
    let weak = 0;
    let resist = 0;
    for (const types of members) {
      const m = damageMultiplier(attack, types);
      if (m > 1) weak++;
      else if (m < 1) resist++;
    }
    return { attack, weak, resist };
  });
}

/** Tipos defensores a los que el equipo pega x2 con algún tipo propio (STAB). */
export function teamOffense(members: string[][]): { target: string; by: string[] }[] {
  const stab = [...new Set(members.flat())];
  return ALL_TYPES.map((target) => ({
    target,
    by: stab.filter((atk) => damageMultiplier(atk, [target]) > 1),
  }));
}

/** Tipos peligrosos: ≥2 débiles y nadie resiste. */
export function teamThreats(members: string[][]): DefenseRow[] {
  return teamDefense(members).filter((r) => r.weak >= 2 && r.resist === 0);
}
