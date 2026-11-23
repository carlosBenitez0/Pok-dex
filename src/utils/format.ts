export const addZeros = (id: number): string => id.toString().padStart(3, "0");

export const capitalize = (s: string): string =>
  s.charAt(0).toUpperCase() + s.slice(1);

/** "charizard-mega-x" → "Charizard Mega X" */
export const prettify = (s: string): string =>
  s.split("-").map(capitalize).join(" ");

export const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];

export const statTotal = (stats: number[]) => stats.reduce((a, b) => a + b, 0);
