import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent, PointerEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import GBAScene, { GBASceneHandle, ViewMode } from "../components/gba/GBAScene";
import GBAScreen, { GBAScreenHandle, TABS } from "../components/gba/GBAScreen";
import type { GBAButton } from "../components/gba/GBAModel";
import { loadPokemonDetail, usePokemonDetail } from "../hooks/usePokemonDetail";
import { KEY_HINTS, useGBAControls } from "../hooks/useGBAControls";
import { TYPE_ES, TYPE_HEX } from "../constants/typeChart";
import { addZeros } from "../utils/format";

const MAX_ID = 1025;

const SHELLS = [
  { id: "indigo", label: "Índigo", color: "#4b3d9e", translucent: true },
  { id: "glacier", label: "Glaciar", color: "#a9c8e8", translucent: true },
  { id: "black", label: "Negro", color: "#2b2b33", translucent: false },
  { id: "fuchsia", label: "Fucsia", color: "#cf3f7a", translucent: false },
  { id: "type", label: "Color del tipo", color: "", translucent: false },
] as const;

const readStored = (key: string, fallback: string) => {
  try {
    const v = window.localStorage.getItem(key);
    return v ? (JSON.parse(v) as string) : fallback;
  } catch {
    return fallback;
  }
};

const wrapId = (n: number) => ((n - 1 + MAX_ID) % MAX_ID) + 1;

export default function PokemonDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const navigate = useNavigate();
  const state = usePokemonDetail(id);
  const data = state.data;

  const [tab, setTab] = useState(0);
  const [shiny, setShiny] = useState(() => readStored("normalShiny", "NORMAL") === "SHINY");
  const [back, setBack] = useState(() => readStored("frontBack", "FRONT") === "BACK");
  const [booted, setBooted] = useState(false);
  const [view, setView] = useState<ViewMode>(() =>
    window.innerWidth / window.innerHeight < 1.15 ? "screen" : "full",
  );
  const [shellId, setShellId] = useState<string>(() => {
    try {
      return window.localStorage.getItem("gbaShell") ?? "indigo";
    } catch {
      return "indigo";
    }
  });

  const scene = useRef<GBASceneHandle>(null);
  const screen = useRef<GBAScreenHandle>(null);
  const cry = useRef<HTMLAudioElement | null>(null);

  const shell = SHELLS.find((s) => s.id === shellId) ?? SHELLS[0];
  const shellColor =
    shell.id === "type" ? (data ? TYPE_HEX[data.types[0]] : "#a8a876") : shell.color;

  const chooseShell = (sid: string) => {
    setShellId(sid);
    try {
      window.localStorage.setItem("gbaShell", sid);
    } catch {
      /* storage no disponible */
    }
  };

  // Título de la pestaña + precarga de vecinos para que L/R sea instantáneo.
  useEffect(() => {
    if (!data) return;
    document.title = `#${addZeros(data.id)} ${data.displayName} · Pokédex`;
    if (state.status === "ready") {
      [wrapId(data.id - 1), wrapId(data.id + 1)].forEach((n) =>
        loadPokemonDetail(n).catch(() => undefined),
      );
    }
    return () => {
      document.title = "Pokédex";
    };
  }, [data, state.status]);

  const goTo = useCallback(
    (next: number, dir: 1 | -1) => {
      scene.current?.spin(dir);
      screen.current?.glitch();
      navigate(`/pokemon/${next}`, { replace: true });
    },
    [navigate],
  );

  const playCry = () => {
    if (!data?.cry) return;
    cry.current?.pause();
    cry.current = new Audio(data.cry);
    cry.current.volume = 0.4;
    cry.current.play().catch(() => undefined);
  };

  const handleButton = (btn: GBAButton) => {
    scene.current?.press(btn);
    switch (btn) {
      case "left":
        return setTab((t) => (t - 1 + TABS.length) % TABS.length);
      case "right":
        return setTab((t) => (t + 1) % TABS.length);
      case "up":
        return screen.current?.scroll(-1);
      case "down":
        return screen.current?.scroll(1);
      case "a":
        return playCry();
      case "b":
        return navigate("/");
      case "l":
        return goTo(wrapId(id - 1), -1);
      case "r":
        return goTo(wrapId(id + 1), 1);
      case "start":
        setTab(0);
        return setShiny((s) => !s);
      case "select":
        setTab(0);
        return setBack((b) => !b);
    }
  };

  useGBAControls(handleButton);

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-[radial-gradient(ellipse_at_top,#2a2d4a_0%,#0e1217_70%)] text-[1.5rem] text-slate-200">
      {/* Barra superior */}
      <header className="z-30 flex flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-8 sm:py-4">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 font-medium hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
        >
          <span aria-hidden="true">←</span> Pokédex
        </Link>

        <h1 className="min-w-0 flex-1 truncate text-[1.8rem] font-bold sm:text-[2.2rem]">
          {data ? (
            <>
              <span className="text-slate-400">#{addZeros(data.id)}</span>{" "}
              {data.displayName}
            </>
          ) : (
            "Cargando…"
          )}
        </h1>

        <div className="flex items-center gap-4">
          <fieldset className="flex items-center gap-2">
            <legend className="sr-only">Color de la carcasa</legend>
            {SHELLS.map((s) => {
              const c = s.id === "type" ? shellColor : s.color;
              return (
                <button
                  key={s.id}
                  type="button"
                  title={s.label}
                  aria-label={`Carcasa ${s.label}`}
                  aria-pressed={shellId === s.id}
                  onClick={() => chooseShell(s.id)}
                  className={`size-8 rounded-full border-2 transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 ${shellId === s.id ? "scale-110 border-white" : "border-white/30"}`}
                  style={{
                    background:
                      s.id === "type"
                        ? `conic-gradient(${c} 0 50%, #f4f1de 50% 100%)`
                        : c,
                  }}
                />
              );
            })}
          </fieldset>

          <button
            type="button"
            onClick={() => setView((v) => (v === "full" ? "screen" : "full"))}
            className="rounded-full bg-white/10 px-4 py-2 font-medium hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
          >
            {view === "full" ? "Acercar pantalla" : "Ver consola"}
          </button>
        </div>
      </header>

      {/* Escena 3D */}
      <div className="relative min-h-0 flex-1">
        <GBAScene
          ref={scene}
          shellColor={shellColor}
          translucent={shell.translucent}
          view={view}
          onButton={handleButton}
          screen={
            <GBAScreen
              ref={screen}
              data={data}
              loading={state.status === "loading"}
              error={state.status === "error" ? state.error : null}
              tab={tab}
              shiny={shiny}
              back={back}
              booted={booted}
              onBootDone={() => setBooted(true)}
              onNavigate={(n) => {
                if (n !== id) goTo(n, n > id ? 1 : -1);
              }}
            />
          }
        />

        {/* Ayuda de teclado (escritorio) */}
        <ul className="pointer-events-none absolute bottom-4 left-4 hidden flex-col gap-1 text-[1.2rem] text-slate-400 lg:flex">
          {KEY_HINTS.map(([k, v]) => (
            <li key={k}>
              <kbd className="rounded bg-white/10 px-2 py-0.5 font-mono text-slate-200">{k}</kbd>{" "}
              {v}
            </li>
          ))}
        </ul>
      </div>

      {/* Mando táctil (móvil / tablet) */}
      <TouchPad onButton={handleButton} />

      {/* Versión accesible del contenido de la pantalla */}
      {data && (
        <section className="sr-only" aria-live="polite">
          <h2>
            {data.displayName}, {data.genus}
          </h2>
          <p>Tipos: {data.types.map((t) => TYPE_ES[t] ?? t).join(", ")}</p>
          <p>
            Altura {data.height} m, peso {data.weight} kg.
          </p>
          <p>{data.description}</p>
          <ul>
            {data.stats.map((s) => (
              <li key={s.key}>
                {s.label}: {s.value}
              </li>
            ))}
          </ul>
          <p>Habilidades: {data.abilities.map((a) => a.name + (a.hidden ? " (oculta)" : "")).join(", ")}</p>
        </section>
      )}
    </div>
  );
}

function TouchPad({ onButton }: { onButton: (b: GBAButton) => void }) {
  // Táctil/ratón: al bajar el dedo (más rápido). Teclado: click sin puntero.
  const press = (b: GBAButton) => ({
    onPointerDown: (e: PointerEvent) => {
      e.preventDefault();
      onButton(b);
    },
    onClick: (e: MouseEvent) => {
      if (e.detail === 0) onButton(b);
    },
  });
  const dir =
    "gba-pad-btn size-14 bg-[#24242c] text-white/80 text-[1.4rem]";
  return (
    <div className="z-30 grid grid-cols-[auto_1fr_auto] items-center gap-4 px-6 pb-[max(1.6rem,env(safe-area-inset-bottom))] pt-2 lg:hidden">
      {/* Cruceta */}
      <div className="grid grid-cols-3 grid-rows-3" aria-label="Cruceta" role="group">
        <span />
        <button type="button" aria-label="Arriba" className={`${dir} rounded-t-lg`} {...press("up")}>▲</button>
        <span />
        <button type="button" aria-label="Izquierda" className={`${dir} rounded-l-lg`} {...press("left")}>◀</button>
        <span className="size-14 bg-[#24242c]" />
        <button type="button" aria-label="Derecha" className={`${dir} rounded-r-lg`} {...press("right")}>▶</button>
        <span />
        <button type="button" aria-label="Abajo" className={`${dir} rounded-b-lg`} {...press("down")}>▼</button>
        <span />
      </div>

      {/* L / R + Start / Select */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-3">
          <button type="button" className="gba-pad-btn h-10 w-20 rounded-full bg-[#3a3a46] font-bold" {...press("l")} aria-label="L: Pokémon anterior">L</button>
          <button type="button" className="gba-pad-btn h-10 w-20 rounded-full bg-[#3a3a46] font-bold" {...press("r")} aria-label="R: Pokémon siguiente">R</button>
        </div>
        <div className="flex gap-3 text-[1.1rem] tracking-wider">
          <button type="button" className="gba-pad-btn h-8 rounded-full bg-[#24242c] px-4" {...press("select")}>SELECT</button>
          <button type="button" className="gba-pad-btn h-8 rounded-full bg-[#24242c] px-4" {...press("start")}>START</button>
        </div>
      </div>

      {/* A / B */}
      <div className="relative h-32 w-32">
        <button type="button" aria-label="B: volver" className="gba-pad-btn absolute bottom-0 left-0 size-16 rounded-full bg-[#d8d4e6] text-[1.8rem] font-bold text-[#3b3555]" {...press("b")}>B</button>
        <button type="button" aria-label="A: grito" className="gba-pad-btn absolute right-0 top-0 size-16 rounded-full bg-[#d8d4e6] text-[1.8rem] font-bold text-[#3b3555]" {...press("a")}>A</button>
      </div>
    </div>
  );
}
