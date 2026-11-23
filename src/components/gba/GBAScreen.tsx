import { forwardRef, useImperativeHandle, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { PokemonDetail, SpriteGame } from "../../interfaces/IPokemonDetail";
import { defensiveProfile, TYPE_HEX } from "../../constants/typeChart";
import { TYPE_NAMES, type Lang } from "../../i18n/dict";
import { addZeros, capitalize } from "../../utils/format";
import { gen3SpriteUrl } from "../../utils/sprites";
import "./gba.css";

export const TAB_COUNT = 7;

// Textos de la pantalla. El <Html> de drei se monta en otra raíz de React,
// así que no ve el contexto de idioma: recibe `lang` por props.
const S = {
  es: {
    tabs: ["INFO", "STATS", "DATOS", "MOVS", "EVO", "TIPOS", "LUGAR"],
    normal: "NORMAL", shiny: "SHINY", front: "FRENTE", back: "ESPALDA",
    height: "ALT", weight: "PESO", noDesc: "Sin descripción en la Pokédex.",
    total: "TOTAL", baseExp: "EXP. BASE", abilities: "HABILIDADES", hidden: "OCULTA",
    mythical: "SINGULAR", legendary: "LEGENDARIO",
    gen: "GEN.", habitat: "HÁBITAT", capture: "CAPTURA", happiness: "AMISTAD",
    growth: "CRECIM.", egg: "HUEVO", gender: "GÉNERO", genderless: "Sin género",
    noMoves: "No aprende movimientos por nivel.", byLevel: "Por nivel",
    moveHead: ["NV", "MOVIMIENTO", "POT", "PREC"], evo: "EVO",
    noEvo: "Este Pokémon no evoluciona.",
    damageTaken: "Daño recibido según el tipo atacante",
    noEncounters: "No aparece en estado salvaje. Se obtiene por evolución, evento o intercambio.",
    where: "Dónde encontrarlo",
    error: "ERROR", cartridge: "No se pudo leer el cartucho ({e}). Pulsa B para volver.",
    loading: "CARGANDO...",
    footer: ["A:GRITO B:SALIR", "L/R:POKéMON", "START:SHINY"],
  },
  en: {
    tabs: ["INFO", "STATS", "DATA", "MOVES", "EVO", "TYPES", "WHERE"],
    normal: "NORMAL", shiny: "SHINY", front: "FRONT", back: "BACK",
    height: "HT", weight: "WT", noDesc: "No Pokédex entry.",
    total: "TOTAL", baseExp: "BASE EXP", abilities: "ABILITIES", hidden: "HIDDEN",
    mythical: "MYTHICAL", legendary: "LEGENDARY",
    gen: "GEN.", habitat: "HABITAT", capture: "CATCH", happiness: "FRIEND.",
    growth: "GROWTH", egg: "EGG", gender: "GENDER", genderless: "Genderless",
    noMoves: "Learns no moves by level.", byLevel: "By level",
    moveHead: ["LV", "MOVE", "PWR", "ACC"], evo: "EVO",
    noEvo: "This Pokémon does not evolve.",
    damageTaken: "Damage taken by attacking type",
    noEncounters: "Not found in the wild. Obtained by evolution, event or trade.",
    where: "Where to find it",
    error: "ERROR", cartridge: "Couldn't read the cartridge ({e}). Press B to go back.",
    loading: "LOADING...",
    footer: ["A:CRY B:EXIT", "L/R:POKéMON", "START:SHINY"],
  },
};
type Strings = (typeof S)["es"];

export type GBAScreenHandle = {
  scroll: (dir: 1 | -1) => void;
  glitch: () => void;
};

type Props = {
  data: PokemonDetail | null;
  loading: boolean;
  error: string | null;
  tab: number;
  shiny: boolean;
  back: boolean;
  game: SpriteGame;
  lang: Lang;
  booted: boolean;
  onBootDone: () => void;
  onNavigate: (id: number) => void;
};

const statColor = (v: number) =>
  v >= 120 ? "#2f9e6b" : v >= 90 ? "#7ab648" : v >= 60 ? "#e0b030" : "#e06040";

function TypeChip({ type, lang, small }: { type: string; lang: Lang; small?: boolean }) {
  return (
    <span className="gba-type gba-pixel" style={{ background: TYPE_HEX[type], fontSize: small ? 6 : undefined, padding: small ? "2px 4px 1px" : undefined }}>
      {(TYPE_NAMES[lang][type] ?? type).toUpperCase()}
    </span>
  );
}

// ---------- Pestañas ----------

function InfoTab({ d, shiny, back, game, s, lang }: { d: PokemonDetail; shiny: boolean; back: boolean; game: SpriteGame; s: Strings; lang: Lang }) {
  const sp = d.sprites;
  const gameSet = d.spritesByGame[game] ?? d.spritesByGame.modern;
  const front = (shiny ? gameSet?.frontShiny : gameSet?.front) ?? (shiny ? sp.frontShiny : sp.front);
  const src = (back ? (shiny ? sp.backShiny : sp.back) : front) ?? sp.front ?? sp.artwork ?? "";
  return (
    <div style={{ display: "flex", gap: 12 }}>
      <div style={{ flex: "0 0 150px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <div
          style={{
            width: 150,
            height: 150,
            display: "grid",
            placeItems: "center",
            background: `radial-gradient(circle at 50% 60%, ${TYPE_HEX[d.types[0]]}55 0 45%, transparent 46%)`,
          }}
        >
          <img data-sprite className="gba-sprite" src={src} alt="" width={128} height={128} style={{ width: 128, height: 128, objectFit: "contain" }} />
        </div>
        <span className="gba-pixel" style={{ fontSize: 8, color: "var(--lcd-dim)" }}>
          {shiny ? s.shiny : s.normal} · {back ? s.back : s.front}
        </span>
      </div>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
        <div className="gba-pixel" style={{ fontSize: 13 }}>
          {d.displayName.toUpperCase()}
        </div>
        <div className="gba-label">{d.genus}</div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {d.types.map((t) => (
            <TypeChip key={t} type={t} lang={lang} />
          ))}
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          <span>
            <span className="gba-label">{s.height} </span>
            {d.height.toFixed(1)} m
          </span>
          <span>
            <span className="gba-label">{s.weight} </span>
            {d.weight.toFixed(1)} kg
          </span>
        </div>
        <p className="gba-panel" style={{ fontSize: 18 }}>
          {d.description || s.noDesc}
        </p>
      </div>
    </div>
  );
}

function StatsTab({ d, s }: { d: PokemonDetail; s: Strings }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      {d.stats.map((st) => (
        <div key={st.key} style={{ display: "grid", gridTemplateColumns: "78px 36px 1fr", alignItems: "center", gap: 8 }}>
          <span className="gba-pixel" style={{ fontSize: 8 }}>
            {st.label}
          </span>
          <span style={{ textAlign: "right" }}>{st.value}</span>
          <div className="gba-stat-track">
            <div className="gba-stat-fill" style={{ width: `${Math.min(100, (st.value / 180) * 100)}%`, background: statColor(st.value) }} />
          </div>
        </div>
      ))}
      <div className="gba-panel" style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        <span className="gba-pixel" style={{ fontSize: 9 }}>
          {s.total}
        </span>
        <span>{d.statTotal}</span>
        <span className="gba-label">
          {s.baseExp} {d.baseExperience ?? "—"}
        </span>
      </div>
    </div>
  );
}

function genderText(rate: number, s: Strings) {
  if (rate < 0) return s.genderless;
  const female = (rate / 8) * 100;
  return `♂ ${100 - female}%  ♀ ${female}%`;
}

function DataTab({ d, s }: { d: PokemonDetail; s: Strings }) {
  const rows: [string, string][] = [
    [s.gen, d.generation],
    [s.habitat, d.habitat ?? "—"],
    [s.capture, `${d.captureRate} / 255`],
    [s.happiness, d.baseHappiness != null ? String(d.baseHappiness) : "—"],
    [s.growth, d.growthRate],
    [s.egg, d.eggGroups.join(", ") || "—"],
    [s.gender, genderText(d.genderRate, s)],
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div className="gba-pixel" style={{ fontSize: 9 }}>
        {s.abilities}
      </div>
      {d.abilities.map((a) => (
        <div key={a.name} className="gba-panel">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>{a.name}</strong>
            {a.hidden && (
              <span className="gba-pixel" style={{ fontSize: 7, color: "var(--lcd-accent)" }}>
                {s.hidden}
              </span>
            )}
          </div>
          {a.description && (
            <div className="gba-label" style={{ fontSize: 17 }}>
              {a.description}
            </div>
          )}
        </div>
      ))}
      {(d.isLegendary || d.isMythical) && (
        <div className="gba-pixel" style={{ fontSize: 8, color: "var(--lcd-accent)" }}>
          {d.isMythical ? s.mythical : s.legendary}
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "96px 1fr", rowGap: 2 }}>
        {rows.map(([k, v]) => (
          <div key={k} style={{ display: "contents" }}>
            <span className="gba-label">{k}</span>
            <span>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const CLASS_ICON: Record<string, string> = { physical: "✸", special: "◎", status: "○" };

function MovesTab({ d, s, lang }: { d: PokemonDetail; s: Strings; lang: Lang }) {
  if (d.moves.length === 0) return <p>{s.noMoves}</p>;
  const cols = "30px 1fr 58px 30px 34px";
  return (
    <div>
      <div className="gba-label" style={{ marginBottom: 4 }}>
        {s.byLevel} · {d.movesVersion}
      </div>
      <div className="gba-pixel" style={{ display: "grid", gridTemplateColumns: cols, gap: 6, fontSize: 7, color: "var(--lcd-dim)", paddingBottom: 3, borderBottom: "2px solid #d4cfb0" }}>
        <span style={{ textAlign: "right" }}>{s.moveHead[0]}</span>
        <span>{s.moveHead[1]}</span>
        <span />
        <span style={{ textAlign: "right" }}>{s.moveHead[2]}</span>
        <span style={{ textAlign: "right" }}>{s.moveHead[3]}</span>
      </div>
      {d.moves.map((m) => (
        <div key={m.name + m.level} style={{ display: "grid", gridTemplateColumns: cols, gap: 6, alignItems: "center", padding: "1px 0" }}>
          <span className="gba-label" style={{ textAlign: "right" }}>
            {m.level === 0 ? s.evo : m.level}
          </span>
          <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            <span title={m.cls ?? ""} style={{ color: "var(--lcd-dim)", marginRight: 4 }}>{m.cls ? CLASS_ICON[m.cls] : ""}</span>
            {m.name}
          </span>
          <span>{m.type && <TypeChip type={m.type} lang={lang} small />}</span>
          <span style={{ textAlign: "right" }}>{m.power ?? "—"}</span>
          <span style={{ textAlign: "right" }}>{m.acc ?? "—"}</span>
        </div>
      ))}
    </div>
  );
}

function EvoTab({ d, s, onNavigate }: { d: PokemonDetail; s: Strings; onNavigate: (id: number) => void }) {
  if (d.evolution.length <= 1) return <p style={{ marginTop: 8 }}>{s.noEvo}</p>;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, minHeight: 240 }}>
      {d.evolution.map((stage, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {i > 0 && (
            <span className="gba-pixel" style={{ fontSize: 10, color: "var(--lcd-dim)" }}>
              ▶
            </span>
          )}
          <div style={{ display: "grid", gridTemplateColumns: stage.length > 3 ? "repeat(3, auto)" : "auto", gap: 4 }}>
            {stage.map((st) => (
              <button
                key={st.id}
                type="button"
                className="gba-link"
                onClick={() => onNavigate(st.id)}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 2, background: st.id === d.speciesId ? "#fff6c9" : undefined }}
              >
                <img className="gba-sprite" src={gen3SpriteUrl(st.id)} alt="" width={stage.length > 3 ? 48 : 72} height={stage.length > 3 ? 48 : 72} />
                <span style={{ fontSize: stage.length > 3 ? 14 : 17 }}>{capitalize(st.name)}</span>
                {st.how && (
                  <span className="gba-label" style={{ fontSize: 14 }}>
                    {st.how}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TypesTab({ d, s, lang }: { d: PokemonDetail; s: Strings; lang: Lang }) {
  const p = defensiveProfile(d.types);
  const groups: [string, string[]][] = [
    ["x4", p["4"]],
    ["x2", p["2"]],
    ["x½", p["0.5"]],
    ["x¼", p["0.25"]],
    ["x0", p["0"]],
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div className="gba-label">{s.damageTaken}</div>
      {groups
        .filter(([, list]) => list.length > 0)
        .map(([label, list]) => (
          <div key={label} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <span className="gba-pixel" style={{ fontSize: 10, width: 34, paddingTop: 3 }}>
              {label}
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, flex: 1 }}>
              {list.map((t) => (
                <TypeChip key={t} type={t} lang={lang} />
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}

function WhereTab({ d, s }: { d: PokemonDetail; s: Strings }) {
  if (d.encounters.length === 0) return <p style={{ marginTop: 8 }}>{s.noEncounters}</p>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div className="gba-label">{s.where}</div>
      {d.encounters.map((e) => (
        <div key={e.location} className="gba-panel" style={{ padding: "4px 8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
            <strong style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.location}</strong>
            <span className="gba-label">{e.chance}%</span>
          </div>
          <div className="gba-label" style={{ fontSize: 15 }}>
            {e.versions.join(" · ")}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------- Pantalla ----------

const GBAScreen = forwardRef<GBAScreenHandle, Props>(function GBAScreen(
  { data, loading, error, tab, shiny, back, game, lang, booted, onBootDone, onNavigate },
  ref,
) {
  const s = S[lang];
  const root = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const boot = useRef<HTMLDivElement>(null);
  const { contextSafe } = useGSAP({ scope: root });

  useImperativeHandle(ref, () => ({
    scroll: (dir) => body.current?.scrollBy({ top: dir * 70, behavior: "smooth" }),
    glitch: contextSafe(() => {
      gsap.fromTo(
        content.current,
        { x: -8, filter: "contrast(2) hue-rotate(60deg)", opacity: 0.4 },
        { x: 0, filter: "none", opacity: 1, duration: 0.3, ease: "steps(4)" },
      );
    }),
  }));

  // Arranque: flash blanco → logo → desaparece.
  useGSAP(
    () => {
      if (booted) {
        gsap.set(boot.current, { autoAlpha: 0 });
        return;
      }
      const mm = gsap.matchMedia();
      mm.add(
        { reduce: "(prefers-reduced-motion: reduce)", ok: "(prefers-reduced-motion: no-preference)" },
        (ctx) => {
          const reduce = ctx.conditions?.reduce;
          const tl = gsap.timeline({ delay: reduce ? 0 : 1.1, onComplete: onBootDone });
          tl.fromTo(".gba-boot-logo", { y: -60, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: reduce ? 0.01 : 0.9, ease: "steps(12)" })
            .fromTo(".gba-boot-sub", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 }, reduce ? 0 : "+=0.1")
            .to(boot.current, { autoAlpha: 0, duration: reduce ? 0.01 : 0.35, ease: "steps(5)" }, reduce ? 0 : "+=0.5");
        },
      );
    },
    { scope: root, dependencies: [] },
  );

  // Transición al cambiar de pestaña.
  useGSAP(
    () => {
      body.current?.scrollTo({ top: 0 });
      gsap.fromTo(content.current, { x: 24, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.25, ease: "steps(5)" });
      if (tab === 1) {
        gsap.from(".gba-stat-fill", { scaleX: 0, duration: 0.6, stagger: 0.06, ease: "steps(12)" });
      }
    },
    { scope: root, dependencies: [tab, data?.id] },
  );

  const typeColor = data ? TYPE_HEX[data.types[0]] : "#a8a876";

  return (
    <div ref={root} className="gba-screen" style={{ ["--type" as string]: typeColor }} aria-hidden="true">
      <div className="gba-header">
        <span className="gba-pixel" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}>
          {data ? `#${addZeros(data.speciesId)} ${data.name.toUpperCase()}` : "POKéDEX"}
        </span>
        <span className="gba-tabs gba-pixel">
          <span>◀</span>
          <span style={{ minWidth: 52, textAlign: "center" }}>{s.tabs[tab]}</span>
          <span>▶</span>
          <span style={{ display: "flex", gap: 3, marginLeft: 4 }}>
            {s.tabs.map((t, i) => (
              <span key={t} className="gba-tab-dot" data-active={i === tab} />
            ))}
          </span>
        </span>
      </div>

      <div ref={body} className="gba-body">
        <div ref={content}>
          {error && !data ? (
            <p>
              <span className="gba-pixel" style={{ fontSize: 10, color: "var(--lcd-accent)" }}>
                {s.error}
              </span>
              <br />
              {s.cartridge.replace("{e}", error)}
            </p>
          ) : !data ? (
            <p className="gba-pixel gba-blink" style={{ fontSize: 10 }}>
              {s.loading}
            </p>
          ) : (
            <>
              {tab === 0 && <InfoTab d={data} shiny={shiny} back={back} game={game} s={s} lang={lang} />}
              {tab === 1 && <StatsTab d={data} s={s} />}
              {tab === 2 && <DataTab d={data} s={s} />}
              {tab === 3 && <MovesTab d={data} s={s} lang={lang} />}
              {tab === 4 && <EvoTab d={data} s={s} onNavigate={onNavigate} />}
              {tab === 5 && <TypesTab d={data} s={s} lang={lang} />}
              {tab === 6 && <WhereTab d={data} s={s} />}
            </>
          )}
        </div>
      </div>

      <div className="gba-footer gba-pixel">
        <span>{s.footer[0]}</span>
        {loading && data ? <span className="gba-blink">{s.loading}</span> : <span>{s.footer[1]}</span>}
        <span>{s.footer[2]}</span>
      </div>

      <div ref={boot} className="gba-boot">
        <div className="gba-boot-logo gba-pixel" style={{ fontSize: 22, color: "#3b4cca" }}>
          POKéDEX
        </div>
        <div className="gba-boot-sub gba-pixel" style={{ fontSize: 9, color: "#6b7780" }}>
          ADVANCE
        </div>
      </div>
    </div>
  );
});

export default GBAScreen;
