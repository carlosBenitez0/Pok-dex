export const addZeros = (id: number): string => id.toString().padStart(3, "0");

export const capitalize = (s: string): string =>
  s.charAt(0).toUpperCase() + s.slice(1);
