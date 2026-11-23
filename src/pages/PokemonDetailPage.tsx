import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent, PointerEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import GBAScene, { GBASceneHandle, Insets, ViewMode } from "../components/gba/GBAScene";
import GBAScreen, { GBAScreenHandle, TAB_COUNT } from "../components/gba/GBAScreen";
import type { GBAButton } from "../components/gba/GBAModel";
import type { SpriteGame } from "../interfaces/IPokemonDetail";
import { loadPokemonDetail, usePokemonDetail } from "../hooks/usePokemonDetail";
import { keyHints, useGBAControls } from "../hooks/useGBAControls";
import { TYPE_HEX } from "../constants/typeChart";
import { addZeros } from "../utils/format";
import { isMuted, setMuted, sfx } from "../utils/sfx";
import { useI18n, type Lang } from "../i18n";
import { LangToggle } from "../components/TopBar";
import { FormPicker } from "../components/gba/FormPicker";

const MAX_ID = 1025;

const SHELLS = [
  { id: "indigo", es: "Índigo", en: "Indigo", color: "#5a4fb6", translucent: true },
  { id: "glacier", es: "Glaciar", en: "Glacier", color: "#a9c8e8", translucent: true },
  { id: "black", es: "Negro", en: "Black", color: "#2b2b33", translucent: false },
  { id: "fuchsia", es: "Fucsia", en: "Fuchsia", color: "#cf3f7a", translucent: false },
  { id: "type", es: "Color del tipo", en: "Type colour", color: "", translucent: false },
] as const;

const GAMES: { id: SpriteGame; es: string; en: string }[] = [
  { id: "frlg", es: "RF/VH", en: "FR/LG" },
  { id: "rs", es: "R/Z", en: "R/S" },
  { id: "emerald", es: "Esm.", en: "Em." },
  { id: "modern", es: "Moderno", en: "Modern" },
];

const PAD_LABELS: Record<Lang, Record<string, string>> = {
  es: { pad: "Cruceta", up: "Arriba", down: "Abajo", left: "Izquierda", right: "Derecha", l: "L: Pokémon anterior", r: "R: Pokémon siguiente", a: "A: grito", b: "B: volver" },
  en: { pad: "D-pad", up: "Up", down: "Down", left: "Left", right: "Right", l: "L: previous Pokémon", r: "R: next Pokémon", a: "A: cry", b: "B: back" },
};

const readStored = (key: string, fallback: string) => {
  try {
    const v = window.localStorage.getItem(key);
    return v ? (JSON.parse(v) as string) : fallback;
  } catch {
    return fallback;
  }
};
const readRaw = (key: string, fallback: string) => {
  try {
    return window.localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
};
const writeRaw = (key: string, value: string) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* storage no disponible */
  }
};

const wrapId = (n: number) => ((n - 1 + MAX_ID) % MAX_ID) + 1;

export default function PokemonDetailPage() {
  const { t, lang, typeName } = useI18n();
  const params = useParams();
  const id = Number(params.id);
  const navigate = useNavigate();
  const state = usePokemonDetail(id, lang);
  const data = state.data;

  const [tab, setTab] = useState(0);
  const [shiny, setShiny] = useState(() => readStored("normalShiny", "NORMAL") === "SHINY");
  const [back, setBack] = useState(() => readStored("frontBack", "FRONT") === "BACK");
  const [booted, setBooted] = useState(false);
  const [muted, setMutedState] = useState(isMuted);
  const [view, setView] = useState<ViewMode>(() =>
    window.innerWidth / window.innerHeight < 1.15 ? "screen" : "full",
  );
  const [shellId, setShellId] = useState(() => readRaw("gbaShell", "indigo"));
  const [game, setGame] = useState<SpriteGame>(() => readRaw("gbaGame", "frlg") as SpriteGame);

  const scene = useRef<GBASceneHandle>(null);
  const headerRef = useRef<HTMLElement>(null);
  const padRef = useRef<HTMLDivElement>(null);
  const [insets, setInsets] = useState<Insets>({ top: 0, bottom: 0 });

  // La barra superior y el mando flotan sobre el canvas: medimos cuánto tapan.
  useEffect(() => {
    const measure = () =>
      setInsets((prev) => {
        const top = headerRef.current?.offsetHeight ?? 0;
        const pad = padRef.current;
        const bottom = pad && getComputedStyle(pad).display !== "none" ? pad.offsetHeight : 0;
        return prev.top === top && prev.bottom === bottom ? prev : { top, bottom };
      });
    measure();
    const ro = new ResizeObserver(measure);
    if (headerRef.current) ro.observe(headerRef.current);
    if (padRef.current) ro.observe(padRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);
  const screen = useRef<GBAScreenHandle>(null);
  const cry = useRef<HTMLAudioElement | null>(null);

  const shell = SHELLS.find((s) => s.id === shellId) ?? SHELLS[0];
  const shellColor = shell.id === "type" ? (data ? TYPE_HEX[data.types[0]] : "#a8a876") : shell.color;
  // En formas (id > 10000) L/R navegan por la especie.
  const speciesId = data?.speciesId ?? (id <= MAX_ID ? id : 1);
  const availableGames = GAMES.filter((g) => data?.spritesByGame[g.id]);

  // Sonido de encendido cuando se enciende el LED.
  useEffect(() => {
    const timer = window.setTimeout(() => sfx.boot(), 900);
    return () => window.clearTimeout(timer);
  }, []);

  // Título de la pestaña + precarga de vecinos para que L/R sea instantáneo.
  useEffect(() => {
    if (!data) return;
    document.title = `#${addZeros(data.speciesId)} ${data.displayName} · Pokédex`;
    if (state.status === "ready") {
      [wrapId(data.speciesId - 1), wrapId(data.speciesId + 1)].forEach((n) =>
        loadPokemonDetail(n, lang).catch(() => undefined),
      );
    }
    return () => {
      document.title = "Pokédex";
    };
  }, [data, state.status, lang]);

  const goTo = useCallback(
    (next: number) => {
      // Solo un pequeño glitch en la pantalla; la consola no gira.
      screen.current?.glitch();
      sfx.swap();
      navigate(`/pokemon/${next}`, { replace: true });
    },
    [navigate],
  );

  const playCry = () => {
    if (!data?.cry || muted) return;
    cry.current?.pause();
    cry.current = new Audio(data.cry);
    cry.current.volume = 0.4;
    cry.current.play().catch(() => undefined);
  };

  const handleButton = (btn: GBAButton) => {
    scene.current?.press(btn);
    switch (btn) {
      case "left":
        sfx.blip();
        return setTab((v) => (v - 1 + TAB_COUNT) % TAB_COUNT);
      case "right":
        sfx.blip();
        return setTab((v) => (v + 1) % TAB_COUNT);
      case "up":
        sfx.click();
        return screen.current?.scroll(-1);
      case "down":
        sfx.click();
        return screen.current?.scroll(1);
      case "a":
        return playCry();
      case "b":
        sfx.back();
        return navigate("/");
      case "l":
        return goTo(wrapId(speciesId - 1));
      case "r":
        return goTo(wrapId(speciesId + 1));
      case "start":
        sfx.click();
        setTab(0);
        return setShiny((s) => !s);
      case "select":
        sfx.click();
        setTab(0);
        return setBack((b) => !b);
    }
  };

  useGBAControls(handleButton);

  const pill =
    "rounded-full bg-white/10 px-4 py-2 font-medium hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400";

  return (
    <div className="relative h-[100dvh] overflow-hidden bg-[radial-gradient(ellipse_at_top,#2a2d4a_0%,#0e1217_70%)] text-[1.5rem] text-slate-200">
      {/* Escena 3D a pantalla completa (la UI flota encima) */}
      <div className="absolute inset-0">
        <GBAScene
          ref={scene}
          shellColor={shellColor}
          translucent={shell.translucent}
          view={view}
          insets={insets}
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
              game={data?.spritesByGame[game] ? game : "modern"}
              lang={lang}
              booted={booted}
              onBootDone={() => setBooted(true)}
              onNavigate={(n) => {
                if (n !== speciesId) goTo(n);
              }}
            />
          }
        />
      </div>

      {/* Barra superior */}
      <header ref={headerRef} className="absolute inset-x-0 top-0 z-30 flex flex-col gap-3 px-4 py-3 sm:px-8 sm:py-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link to="/" className={`flex items-center gap-2 ${pill}`}>
            <span aria-hidden="true">←</span> {t("detail.back")}
          </Link>

          <h1 className="order-last w-full min-w-0 truncate py-1 text-[1.8rem] font-bold leading-normal sm:order-none sm:w-auto sm:flex-1 sm:text-[2.2rem]">
            {data ? (
              <>
                <span className="text-slate-400">#{addZeros(data.speciesId)}</span> {data.displayName}
              </>
            ) : (
              t("detail.loading")
            )}
          </h1>

          <div className="ml-auto flex items-center gap-3 sm:ml-0">
            <fieldset className="flex items-center gap-2">
              <legend className="sr-only">{t("detail.shell")}</legend>
              {SHELLS.map((s) => {
                const c = s.id === "type" ? shellColor : s.color;
                return (
                  <button
                    key={s.id}
                    type="button"
                    title={s[lang]}
                    aria-label={`${t("detail.shell")}: ${s[lang]}`}
                    aria-pressed={shellId === s.id}
                    onClick={() => {
                      setShellId(s.id);
                      writeRaw("gbaShell", s.id);
                    }}
                    className={`size-8 rounded-full border-2 transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 ${shellId === s.id ? "scale-110 border-white" : "border-white/30"}`}
                    style={{ background: s.id === "type" ? `conic-gradient(${c} 0 50%, #f4f1de 50% 100%)` : c }}
                  />
                );
              })}
            </fieldset>
            <button
              type="button"
              onClick={() => {
                setMuted(!muted);
                setMutedState(!muted);
              }}
              aria-pressed={!muted}
              aria-label={muted ? t("detail.sound.off") : t("detail.sound.on")}
              title={muted ? t("detail.sound.off") : t("detail.sound.on")}
              className="grid size-12 place-items-center rounded-full bg-white/10 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
            >
              <span aria-hidden="true">{muted ? "🔇" : "🔊"}</span>
            </button>
            <LangToggle />
          </div>
        </div>

        {/* Segunda fila: forma, juego de sprites y zoom */}
        <div className="no-scrollbar -mx-4 flex items-center gap-3 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          {data && data.forms.length > 1 && (
            <FormPicker
              forms={data.forms}
              currentId={data.id}
              lang={lang}
              onChange={(fid) => navigate(`/pokemon/${fid}`, { replace: true })}
            />
          )}
          {availableGames.length > 1 && (
            <div role="radiogroup" aria-label={t("detail.game")} className="flex shrink-0 items-center gap-1 rounded-full bg-white/10 p-1">
              <span className="px-2 text-slate-400">{t("detail.game")}</span>
              {availableGames.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  role="radio"
                  aria-checked={game === g.id}
                  onClick={() => {
                    setGame(g.id);
                    writeRaw("gbaGame", g.id);
                    setTab(0);
                  }}
                  className={`rounded-full px-3 py-1 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 ${game === g.id ? "bg-white text-slate-900" : "text-slate-300 hover:bg-white/10"}`}
                >
                  {g[lang]}
                </button>
              ))}
            </div>
          )}
          <button type="button" onClick={() => setView((v) => (v === "full" ? "screen" : "full"))} className={`ml-auto shrink-0 ${pill}`}>
            {view === "full" ? t("detail.zoomIn") : t("detail.zoomOut")}
          </button>
        </div>
      </header>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20">
        {/* Ayuda de teclado (escritorio) */}
        <ul className="absolute bottom-4 left-4 hidden flex-col gap-1 text-[1.2rem] text-slate-400 lg:flex">
          {keyHints(lang).map(([k, v]) => (
            <li key={k}>
              <kbd className="rounded bg-white/10 px-2 py-0.5 font-mono text-slate-200">{k}</kbd> {v}
            </li>
          ))}
        </ul>
      </div>

      {/* Mando táctil (móvil / tablet) */}
      <TouchPad ref={padRef} onButton={handleButton} lang={lang} />

      {/* Versión accesible del contenido de la pantalla */}
      {data && (
        <section className="sr-only" aria-live="polite">
          <h2>
            {data.displayName}, {data.genus}
          </h2>
          <p>{data.types.map(typeName).join(", ")}</p>
          <p>
            {data.height} m, {data.weight} kg.
          </p>
          <p>{data.description}</p>
          <ul>
            {data.stats.map((s) => (
              <li key={s.key}>
                {s.label}: {s.value}
              </li>
            ))}
          </ul>
          <p>{data.abilities.map((a) => a.name).join(", ")}</p>
        </section>
      )}
    </div>
  );
}

const TouchPad = forwardRef<HTMLDivElement, { onButton: (b: GBAButton) => void; lang: Lang }>(function TouchPad({ onButton, lang }, ref) {
  const L = PAD_LABELS[lang];
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
  const dir = "gba-pad-btn size-14 bg-[#24242c] text-white/80 text-[1.4rem]";
  return (
    <div ref={ref} className="absolute inset-x-0 bottom-0 z-30 grid grid-cols-[auto_1fr_auto] items-center gap-4 bg-gradient-to-t from-[#0e1217] via-[#0e1217]/90 to-transparent px-6 pb-[max(1.6rem,env(safe-area-inset-bottom))] pt-6 lg:hidden">
      <div className="grid grid-cols-3 grid-rows-3" aria-label={L.pad} role="group">
        <span />
        <button type="button" aria-label={L.up} className={`${dir} rounded-t-lg`} {...press("up")}>▲</button>
        <span />
        <button type="button" aria-label={L.left} className={`${dir} rounded-l-lg`} {...press("left")}>◀</button>
        <span className="size-14 bg-[#24242c]" />
        <button type="button" aria-label={L.right} className={`${dir} rounded-r-lg`} {...press("right")}>▶</button>
        <span />
        <button type="button" aria-label={L.down} className={`${dir} rounded-b-lg`} {...press("down")}>▼</button>
        <span />
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-3">
          <button type="button" className="gba-pad-btn h-10 w-20 rounded-full bg-[#3a3a46] font-bold" {...press("l")} aria-label={L.l}>L</button>
          <button type="button" className="gba-pad-btn h-10 w-20 rounded-full bg-[#3a3a46] font-bold" {...press("r")} aria-label={L.r}>R</button>
        </div>
        <div className="flex gap-3 text-[1.1rem] tracking-wider">
          <button type="button" className="gba-pad-btn h-8 rounded-full bg-[#24242c] px-4" {...press("select")}>SELECT</button>
          <button type="button" className="gba-pad-btn h-8 rounded-full bg-[#24242c] px-4" {...press("start")}>START</button>
        </div>
      </div>

      <div className="relative h-32 w-32">
        <button type="button" aria-label={L.b} className="gba-pad-btn absolute bottom-0 left-0 size-16 rounded-full bg-[#d8d4e6] text-[1.8rem] font-bold text-[#3b3555]" {...press("b")}>B</button>
        <button type="button" aria-label={L.a} className="gba-pad-btn absolute right-0 top-0 size-16 rounded-full bg-[#d8d4e6] text-[1.8rem] font-bold text-[#3b3555]" {...press("a")}>A</button>
      </div>
    </div>
  );
});
