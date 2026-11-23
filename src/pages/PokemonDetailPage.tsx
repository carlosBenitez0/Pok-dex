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

  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Cerrar el panel de ajustes al pulsar fuera o con Esc.
  useEffect(() => {
    if (!settingsOpen) return;
    const onDown = (e: globalThis.PointerEvent) => {
      const target = e.target as Node;
      if (settingsRef.current?.contains(target) || headerRef.current?.contains(target)) return;
      setSettingsOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSettingsOpen(false);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [settingsOpen]);

  const shellSwatches = (size: string) => (
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
            className={`${size} rounded-full border-2 transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 ${shellId === s.id ? "scale-110 border-white" : "border-white/30"}`}
            style={{ background: s.id === "type" ? `conic-gradient(${c} 0 50%, #f4f1de 50% 100%)` : c }}
          />
        );
      })}
    </fieldset>
  );

  const soundButton = (
    <button
      type="button"
      onClick={() => {
        setMuted(!muted);
        setMutedState(!muted);
      }}
      aria-pressed={!muted}
      aria-label={muted ? t("detail.sound.off") : t("detail.sound.on")}
      title={muted ? t("detail.sound.off") : t("detail.sound.on")}
      className="grid size-12 shrink-0 place-items-center rounded-full bg-white/10 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
    >
      <span aria-hidden="true">{muted ? "🔇" : "🔊"}</span>
    </button>
  );

  const gamesGroup =
    availableGames.length > 1 ? (
      <div role="radiogroup" aria-label={t("detail.game")} className="flex w-fit shrink-0 items-center gap-1 rounded-full bg-white/10 p-1">
        <span className="hidden px-2 text-slate-400 sm:inline">{t("detail.game")}</span>
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
    ) : null;

  const zoomButton = (
    <button
      type="button"
      onClick={() => {
        setView((v) => (v === "full" ? "screen" : "full"));
        setSettingsOpen(false);
      }}
      className="shrink-0 rounded-full bg-white/10 px-4 py-2 font-medium hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
    >
      {view === "full" ? t("detail.zoomIn") : t("detail.zoomOut")}
    </button>
  );

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
      <header ref={headerRef} className="absolute inset-x-0 top-0 z-30 flex flex-col gap-3 px-4 pb-2 pt-3 sm:px-8 sm:py-4">
        <div className="flex items-center gap-3 sm:gap-6">
          <Link
            to="/"
            aria-label={t("detail.back")}
            className="flex h-12 shrink-0 items-center gap-2 rounded-full bg-white/10 px-4 font-medium hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
          >
            <span aria-hidden="true">←</span>
            <span className="hidden sm:inline">{t("detail.back")}</span>
          </Link>

          <h1 className="min-w-0 flex-1 truncate py-1 text-[1.9rem] font-bold leading-normal sm:text-[2.2rem]">
            {data ? (
              <>
                <span className="text-slate-400">#{addZeros(data.speciesId)}</span> {data.displayName}
              </>
            ) : (
              t("detail.loading")
            )}
          </h1>

          {/* Escritorio: controles en línea */}
          <div className="hidden items-center gap-3 sm:flex">
            {shellSwatches("size-8")}
            {soundButton}
            <LangToggle />
          </div>

          {/* Móvil: todo en un panel de ajustes */}
          <button
            type="button"
            onClick={() => setSettingsOpen((v) => !v)}
            aria-expanded={settingsOpen}
            aria-controls="gba-settings"
            aria-label={lang === "es" ? "Ajustes" : "Settings"}
            className={`grid size-12 shrink-0 place-items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 sm:hidden ${settingsOpen ? "bg-white text-slate-900" : "bg-white/10 hover:bg-white/20"}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-7" aria-hidden="true">
              <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
              <circle cx="16" cy="7" r="2" />
              <circle cx="10" cy="17" r="2" />
            </svg>
          </button>
        </div>

        {/* Segunda fila: forma (+ sprites y zoom en escritorio) */}
        {(data?.forms.length ?? 0) > 1 || availableGames.length > 1 ? (
          <div className="flex items-center gap-3">
            {data && data.forms.length > 1 && (
              <FormPicker
                forms={data.forms}
                currentId={data.id}
                lang={lang}
                onChange={(fid) => navigate(`/pokemon/${fid}`, { replace: true })}
              />
            )}
            <div className="hidden flex-1 items-center gap-3 sm:flex">
              {gamesGroup}
              <span className="ml-auto">{zoomButton}</span>
            </div>
          </div>
        ) : (
          <div className="hidden justify-end sm:flex">{zoomButton}</div>
        )}
      </header>

      {/* Panel de ajustes (móvil) */}
      {settingsOpen && (
        <div
          id="gba-settings"
          ref={settingsRef}
          style={{ top: insets.top }}
          className="absolute inset-x-3 z-40 origin-top animate-[pop_140ms_ease-out] rounded-3xl bg-[#161a21]/95 p-5 shadow-[0_24px_60px_-12px_rgb(0_0_0/0.7)] ring-1 ring-white/10 backdrop-blur-xl sm:hidden"
        >
          <p className="mb-3 text-[1.2rem] font-semibold uppercase tracking-wider text-slate-400">{t("detail.shell")}</p>
          {shellSwatches("size-12")}
          {availableGames.length > 1 && (
            <>
              <p className="mb-3 mt-5 text-[1.2rem] font-semibold uppercase tracking-wider text-slate-400">{t("detail.game")}</p>
              {gamesGroup}
            </>
          )}
          <div className="mt-5 flex items-center gap-3">
            {soundButton}
            <LangToggle />
            <span className="ml-auto">{zoomButton}</span>
          </div>
        </div>
      )}

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
      <TouchPad ref={padRef} onButton={handleButton} lang={lang} shellColor={shellColor} />

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

/** Mando táctil con el aspecto de la mitad inferior de una GBA. */
const TouchPad = forwardRef<HTMLDivElement, { onButton: (b: GBAButton) => void; lang: Lang; shellColor: string }>(
  function TouchPad({ onButton, lang, shellColor }, ref) {
    const L = PAD_LABELS[lang];
    // Táctil/ratón: al bajar el dedo (más rápido). Teclado: click sin puntero.
    const press = (b: GBAButton) => ({
      onPointerDown: (e: PointerEvent) => {
        e.preventDefault();
        if (navigator.vibrate) navigator.vibrate(8);
        onButton(b);
      },
      onClick: (e: MouseEvent) => {
        if (e.detail === 0) onButton(b);
      },
    });

    // Botón gris claro con "profundidad" (sombra inferior que se aplasta al pulsar).
    const key =
      "gba-pad-btn select-none bg-[#d6d6dc] text-[#6f6f7c] shadow-[0_3px_0_#a5a5b0,0_6px_12px_-4px_rgb(0_0_0/0.45)] active:translate-y-[2px] active:shadow-[0_1px_0_#a5a5b0,0_2px_6px_-2px_rgb(0_0_0/0.4)]";
    const arm = `${key} grid size-[4.8rem] place-items-center text-[1.3rem]`;
    const engraved = "text-[1rem] font-bold tracking-[0.12em] text-white/70";

    return (
      <div
        ref={ref}
        className="absolute inset-x-0 bottom-0 z-30 overflow-hidden rounded-t-[3.6rem] pb-[max(1.6rem,env(safe-area-inset-bottom))] pt-4 shadow-[0_-20px_40px_-10px_rgb(0_0_0/0.6)] lg:hidden"
        style={{
          backgroundColor: shellColor,
          backgroundImage:
            "linear-gradient(180deg, rgb(255 255 255 / 0.18), rgb(255 255 255 / 0.02) 30%, rgb(0 0 0 / 0.18))",
        }}
      >
        {/* Brillo del borde superior */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-10 top-0 h-px bg-white/50" />

        {/* Gatillos L / R en las esquinas */}
        <div className="mb-2 flex justify-between px-4">
          <button type="button" aria-label={L.l} className={`${key} h-10 w-28 rounded-b-xl rounded-t-[2rem] text-[1.3rem] font-bold`} {...press("l")}>
            L
          </button>
          <button type="button" aria-label={L.r} className={`${key} h-10 w-28 rounded-b-xl rounded-t-[2rem] text-[1.3rem] font-bold`} {...press("r")}>
            R
          </button>
        </div>

        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-1 px-4 min-[400px]:px-6">
          {/* Cruceta en cruz, como la del modelo 3D */}
          <div role="group" aria-label={L.pad} className="grid grid-cols-3 grid-rows-3 drop-shadow-[0_6px_8px_rgb(0_0_0/0.35)]">
            <span />
            <button type="button" aria-label={L.up} className={`${arm} rounded-t-xl`} {...press("up")}>▲</button>
            <span />
            <button type="button" aria-label={L.left} className={`${arm} rounded-l-xl`} {...press("left")}>◀</button>
            <span className="grid size-[4.8rem] place-items-center bg-[#d6d6dc]">
              <span className="size-5 rounded-full bg-[#bdbdc6] shadow-inner" />
            </span>
            <button type="button" aria-label={L.right} className={`${arm} rounded-r-xl`} {...press("right")}>▶</button>
            <span />
            <button type="button" aria-label={L.down} className={`${arm} rounded-b-xl`} {...press("down")}>▼</button>
            <span />
          </div>

          {/* Start / Select al centro */}
          <div className="flex flex-col items-center justify-end gap-4 self-end pb-2">
            {(["select", "start"] as const).map((b) => (
              <div key={b} className="flex flex-col items-center gap-1">
                <button type="button" aria-label={b.toUpperCase()} className={`${key} h-5 w-14 rounded-full`} {...press(b)} />
                <span className={engraved}>{b.toUpperCase()}</span>
              </div>
            ))}
          </div>

          {/* A / B en diagonal */}
          <div className="relative h-[13.6rem] w-[11.6rem]">
            <div className="absolute bottom-6 left-0 flex flex-col items-center gap-1">
              <button type="button" aria-label={L.b} className={`${key} grid size-[5.6rem] place-items-center rounded-full text-[1.8rem] font-bold`} {...press("b")}>
                B
              </button>
            </div>
            <div className="absolute right-0 top-4 flex flex-col items-center gap-1">
              <button type="button" aria-label={L.a} className={`${key} grid size-[5.6rem] place-items-center rounded-full text-[1.8rem] font-bold`} {...press("a")}>
                A
              </button>
            </div>
          </div>
        </div>

        {/* Ranuras del altavoz (decorativas) */}
        <div aria-hidden="true" className="pointer-events-none absolute bottom-[max(1.2rem,env(safe-area-inset-bottom))] right-8 flex flex-col gap-1.5 opacity-40">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="h-1 rounded-full bg-black/60" style={{ width: `${5.6 - i * 0.4}rem`, transform: "rotate(-10deg)" }} />
          ))}
        </div>
      </div>
    );
  },
);
