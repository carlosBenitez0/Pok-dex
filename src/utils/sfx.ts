// Efectos de sonido estilo GBA, sintetizados con Web Audio (sin archivos).

let ctx: AudioContext | null = null;
let muted = (() => {
  try {
    return window.localStorage.getItem("gbaMuted") === "1";
  } catch {
    return false;
  }
})();

export const isMuted = () => muted;
export function setMuted(m: boolean) {
  muted = m;
  try {
    window.localStorage.setItem("gbaMuted", m ? "1" : "0");
  } catch {
    /* storage no disponible */
  }
}

function audio(): AudioContext | null {
  if (muted) return null;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** Nota cuadrada corta (el timbre típico de la GBA). */
function tone(freq: number, start: number, dur: number, vol = 0.05, type: OscillatorType = "square") {
  const ac = audio();
  if (!ac) return;
  const t0 = ac.currentTime + start;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(vol, t0 + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

export const sfx = {
  /** Pulsación de botón */
  click: () => tone(880, 0, 0.05, 0.035),
  /** Cambio de pestaña */
  blip: () => {
    tone(660, 0, 0.05, 0.035);
    tone(990, 0.04, 0.06, 0.03);
  },
  /** Cambio de Pokémon */
  swap: () => {
    tone(523, 0, 0.06, 0.04);
    tone(784, 0.05, 0.08, 0.04);
  },
  /** Volver */
  back: () => {
    tone(660, 0, 0.06, 0.035);
    tone(440, 0.05, 0.09, 0.035);
  },
  /** Arranque de la consola: arpegio ascendente + campanilla */
  boot: () => {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.14, 0.04));
    tone(2093, 0.4, 0.5, 0.025, "triangle");
  },
};
