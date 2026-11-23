import { useEffect, useRef } from "react";
import type { GBAButton } from "../components/gba/GBAModel";

// Mapa al estilo mGBA: X=A, Z=B, A/Q=L, S/E=R, Enter=Start, Backspace/Shift=Select.
const KEYMAP: Record<string, GBAButton> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  x: "a",
  " ": "a",
  z: "b",
  Escape: "b",
  q: "l",
  a: "l",
  e: "r",
  s: "r",
  Enter: "start",
  Backspace: "select",
  Shift: "select",
};

export const KEY_HINTS: [string, string][] = [
  ["← →", "Pestaña"],
  ["↑ ↓", "Desplazar"],
  ["X / Espacio", "A · Grito"],
  ["Z / Esc", "B · Volver"],
  ["Q · E", "L/R · Pokémon"],
  ["Enter", "Start · Shiny"],
  ["Shift", "Select · Frente/Espalda"],
];

/** Teclado → botón de la GBA. El handler siempre es el más reciente. */
export function useGBAControls(onButton: (btn: GBAButton) => void) {
  const handler = useRef(onButton);
  handler.current = onButton;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName))) return;
      const btn = KEYMAP[e.key] ?? KEYMAP[e.key.toLowerCase()];
      if (!btn) return;
      // Con un botón/enlace enfocado, Enter/Espacio deben activar ese control.
      if ((e.key === "Enter" || e.key === " ") && el && ["BUTTON", "A"].includes(el.tagName)) return;
      e.preventDefault();
      if (e.repeat && !["up", "down"].includes(btn)) return;
      handler.current(btn);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
