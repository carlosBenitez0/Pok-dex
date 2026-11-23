import { forwardRef, useImperativeHandle, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { PokemonDetail } from "../../interfaces/IPokemonDetail";
import {
  defensiveProfile,
  TYPE_ES,
  TYPE_HEX,
} from "../../constants/typeChart";
import { addZeros, capitalize } from "../../utils/format";
import "./gba.css";

export const TABS = ["INFO", "STATS", "DATOS", "MOVS", "EVO", "TIPOS"] as const;

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
  booted: boolean;
  onBootDone: () => void;
  onNavigate: (id: number) => void;
};

const spriteFor = (id: number) =>
  id <= 386
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/${id}.png`
    : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

const TypeChip = ({ type }: { type: string }) => (
  <span className="gba-type gba-pixel" style={{ background: TYPE_HEX[type] }}>
    {(TYPE_ES[type] ?? type).toUpperCase()}
  </span>
);

const statColor = (v: number) =>
  v >= 120 ? "#2f9e6b" : v >= 90 ? "#7ab648" : v >= 60 ? "#e0b030" : "#e06040";

// ---------- Pestañas ----------

function InfoTab({ d, shiny, back }: { d: PokemonDetail; shiny: boolean; back: boolean }) {
  const s = d.sprites;
  const src =
    (back ? (shiny ? s.backShiny : s.back) : shiny ? s.frontShiny : s.front) ??
    s.front ??
    s.artwork ??
    "";
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
          <img
            data-sprite
            className="gba-sprite"
            src={src}
            alt=""
            width={128}
            height={128}
            style={{ width: 128, height: 128 }}
          />
        </div>
        <span className="gba-pixel" style={{ fontSize: 8, color: "var(--lcd-dim)" }}>
          {shiny ? "SHINY" : "NORMAL"} · {back ? "ESPALDA" : "FRENTE"}
        </span>
      </div>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
        <div className="gba-pixel" style={{ fontSize: 13 }}>
          {d.displayName.toUpperCase()}
        </div>
        <div className="gba-label">{d.genus}</div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {d.types.map((t) => (
            <TypeChip key={t} type={t} />
          ))}
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          <span>
            <span className="gba-label">ALT </span>
            {d.height.toFixed(1)} m
          </span>
          <span>
            <span className="gba-label">PESO </span>
            {d.weight.toFixed(1)} kg
          </span>
        </div>
        <p className="gba-panel" style={{ fontSize: 18 }}>
          {d.description || "Sin descripción en la Pokédex."}
        </p>
      </div>
    </div>
  );
}

function StatsTab({ d }: { d: PokemonDetail }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      {d.stats.map((s) => (
        <div
          key={s.key}
          style={{ display: "grid", gridTemplateColumns: "78px 36px 1fr", alignItems: "center", gap: 8 }}
        >
          <span className="gba-pixel" style={{ fontSize: 8 }}>
            {s.label}
          </span>
          <span style={{ textAlign: "right" }}>{s.value}</span>
          <div className="gba-stat-track">
            <div
              className="gba-stat-fill"
              style={{ width: `${Math.min(100, (s.value / 180) * 100)}%`, background: statColor(s.value) }}
            />
          </div>
        </div>
      ))}
      <div
        className="gba-panel"
        style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}
      >
        <span className="gba-pixel" style={{ fontSize: 9 }}>
          TOTAL
        </span>
        <span>{d.statTotal}</span>
        <span className="gba-label">EXP. BASE {d.baseExperience ?? "—"}</span>
      </div>
    </div>
  );
}

function genderText(rate: number) {
  if (rate < 0) return "Sin género";
  const female = (rate / 8) * 100;
  return `♂ ${100 - female}%  ♀ ${female}%`;
}

function DataTab({ d }: { d: PokemonDetail }) {
  const rows: [string, string][] = [
    ["GEN.", d.generation],
    ["HÁBITAT", d.habitat ?? "—"],
    ["CAPTURA", `${d.captureRate} / 255`],
    ["AMISTAD", d.baseHappiness != null ? String(d.baseHappiness) : "—"],
    ["CRECIM.", d.growthRate],
    ["HUEVO", d.eggGroups.join(", ") || "—"],
    ["GÉNERO", genderText(d.genderRate)],
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div className="gba-pixel" style={{ fontSize: 9 }}>
        HABILIDADES
      </div>
      {d.abilities.map((a) => (
        <div key={a.name} className="gba-panel">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>{a.name}</strong>
            {a.hidden && (
              <span className="gba-pixel" style={{ fontSize: 7, color: "var(--lcd-accent)" }}>
                OCULTA
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
          {d.isMythical ? "SINGULAR" : "LEGENDARIO"}
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

function MovesTab({ d }: { d: PokemonDetail }) {
  if (d.moves.length === 0) return <p>No aprende movimientos por nivel.</p>;
  return (
    <div>
      <div className="gba-label" style={{ marginBottom: 6 }}>
        Por nivel · {d.movesVersion}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 16, rowGap: 1 }}>
        {d.moves.map((m) => (
          <div key={m.name + m.level} style={{ display: "flex", gap: 8 }}>
            <span className="gba-label" style={{ width: 34, textAlign: "right" }}>
              {m.level === 0 ? "EVO" : m.level}
            </span>
            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {m.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EvoTab({ d, onNavigate }: { d: PokemonDetail; onNavigate: (id: number) => void }) {
  if (d.evolution.length <= 1)
    return <p style={{ marginTop: 8 }}>Este Pokémon no evoluciona.</p>;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, minHeight: 240 }}>
      {d.evolution.map((stage, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {i > 0 && (
            <span className="gba-pixel" style={{ fontSize: 10, color: "var(--lcd-dim)" }}>
              ▶
            </span>
          )}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: stage.length > 3 ? "repeat(3, auto)" : "auto",
              gap: 4,
            }}
          >
            {stage.map((s) => (
              <button
                key={s.id}
                type="button"
                className="gba-link"
                onClick={() => onNavigate(s.id)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: 2,
                  background: s.id === d.id ? "#fff6c9" : undefined,
                }}
              >
                <img
                  className="gba-sprite"
                  src={spriteFor(s.id)}
                  alt=""
                  width={stage.length > 3 ? 48 : 72}
                  height={stage.length > 3 ? 48 : 72}
                />
                <span style={{ fontSize: stage.length > 3 ? 14 : 17 }}>{capitalize(s.name)}</span>
                {s.how && (
                  <span className="gba-label" style={{ fontSize: 14 }}>
                    {s.how}
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

function TypesTab({ d }: { d: PokemonDetail }) {
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
      <div className="gba-label">Daño recibido según el tipo atacante</div>
      {groups
        .filter(([, list]) => list.length > 0)
        .map(([label, list]) => (
          <div key={label} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <span className="gba-pixel" style={{ fontSize: 10, width: 34, paddingTop: 3 }}>
              {label}
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, flex: 1 }}>
              {list.map((t) => (
                <TypeChip key={t} type={t} />
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}

// ---------- Pantalla ----------

const GBAScreen = forwardRef<GBAScreenHandle, Props>(function GBAScreen(
  { data, loading, error, tab, shiny, back, booted, onBootDone, onNavigate },
  ref,
) {
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
        {
          reduce: "(prefers-reduced-motion: reduce)",
          ok: "(prefers-reduced-motion: no-preference)",
        },
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
      gsap.fromTo(
        content.current,
        { x: 24, autoAlpha: 0 },
        { x: 0, autoAlpha: 1, duration: 0.25, ease: "steps(5)" },
      );
      if (TABS[tab] === "STATS") {
        gsap.from(".gba-stat-fill", { scaleX: 0, duration: 0.6, stagger: 0.06, ease: "steps(12)" });
      }
    },
    { scope: root, dependencies: [tab, data?.id] },
  );

  const typeColor = data ? TYPE_HEX[data.types[0]] : "#a8a876";

  return (
    <div
      ref={root}
      className="gba-screen"
      style={{ ["--type" as string]: typeColor }}
      aria-hidden="true"
    >
      <div className="gba-header">
        <span className="gba-pixel" style={{ whiteSpace: "nowrap" }}>
          {data ? `#${addZeros(data.id)} ${data.name.toUpperCase()}` : "POKÉDEX"}
        </span>
        <span className="gba-tabs gba-pixel">
          <span>◀</span>
          <span style={{ minWidth: 52, textAlign: "center" }}>{TABS[tab]}</span>
          <span>▶</span>
          <span style={{ display: "flex", gap: 3, marginLeft: 4 }}>
            {TABS.map((t, i) => (
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
                ERROR
              </span>
              <br />
              No se pudo leer el cartucho ({error}). Pulsa B para volver.
            </p>
          ) : !data ? (
            <p className="gba-pixel gba-blink" style={{ fontSize: 10 }}>
              CARGANDO...
            </p>
          ) : (
            <>
              {TABS[tab] === "INFO" && <InfoTab d={data} shiny={shiny} back={back} />}
              {TABS[tab] === "STATS" && <StatsTab d={data} />}
              {TABS[tab] === "DATOS" && <DataTab d={data} />}
              {TABS[tab] === "MOVS" && <MovesTab d={data} />}
              {TABS[tab] === "EVO" && <EvoTab d={data} onNavigate={onNavigate} />}
              {TABS[tab] === "TIPOS" && <TypesTab d={data} />}
            </>
          )}
        </div>
      </div>

      <div className="gba-footer gba-pixel">
        <span>A:GRITO B:SALIR</span>
        {loading && data ? <span className="gba-blink">CARGANDO</span> : <span>L/R:POKéMON</span>}
        <span>START:SHINY</span>
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
