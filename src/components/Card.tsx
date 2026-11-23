import { memo, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Filter from "./Filter";
import ToggleCard from "./toggles/ToggleCard";
import ToggleFrontBackCard from "./toggles/ToggleFrontBackCard";
import type { PokedexEntry } from "../data/types";
import { TYPE_HEX } from "../constants/typeChart";
import { addZeros, prettify } from "../utils/format";
import { spriteUrl } from "../utils/sprites";
import { useI18n } from "../i18n";
import { collections, useCollection } from "../lib/collections";

type Props = {
  entry: PokedexEntry;
  selectedTypes: string[];
  onTypeClick: (type: string) => void;
  normalShiny: string; // 'NORMAL' | 'SHINY'
  frontBack: string; // 'FRONT' | 'BACK'
};

// Botón de acción del pie: fantasma en reposo, con color cuando está activo.
const action =
  "grid size-11 place-items-center rounded-xl transition-all hover:scale-110 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100";
const idle = "text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-white/10 dark:hover:text-slate-200";

const Sparkle = ({ className }: { className: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={`pointer-events-none absolute z-20 fill-amber-300 drop-shadow-[0_0_4px_rgb(252_211_77/0.9)] motion-safe:animate-pulse ${className}`}>
    <path d="M12 0c.6 5.6 2.4 7.4 8 8-5.6.6-7.4 2.4-8 8-.6-5.6-2.4-7.4-8-8 5.6-.6 7.4-2.4 8-8Z" />
  </svg>
);

function Card({ entry, selectedTypes, onTypeClick, normalShiny, frontBack }: Props) {
  const { t, typeName } = useI18n();
  const { id, name } = entry;
  const label = prettify(name);
  const [isNormal, setIsNormal] = useState(normalShiny === "NORMAL");
  const [isFront, setIsFront] = useState(frontBack === "FRONT");

  useEffect(() => setIsNormal(normalShiny === "NORMAL"), [normalShiny]);
  useEffect(() => setIsFront(frontBack === "FRONT"), [frontBack]);

  const favorites = useCollection("favorites");
  const team = useCollection("team");
  const compare = useCollection("compare");
  const isFav = favorites.includes(id);
  const inTeam = team.includes(id);
  const inCompare = compare.includes(id);
  const teamFull = !inTeam && team.length >= 6;
  const shinyGlobal = normalShiny === "SHINY";
  const shiny = !isNormal;

  const c1 = TYPE_HEX[entry.types[0]];
  const c2 = TYPE_HEX[entry.types[1] ?? entry.types[0]];
  const formCount = entry.forms?.length ?? 0;

  return (
    // El envoltorio pinta el borde: degradado de los tipos en shiny, línea fina en normal.
    <div
      className={`group/card rounded-[2.2rem] p-[1.5px] transition-transform duration-300 hover:-translate-y-1 ${shiny ? "shadow-[0_10px_30px_-12px_var(--glow)]" : "bg-slate-200 dark:bg-white/10"}`}
      style={
        {
          "--glow": `${c1}aa`,
          background: shiny ? `linear-gradient(135deg, ${c1}, #fde68a 35%, ${c2} 65%, #f0abfc)` : undefined,
        } as React.CSSProperties
      }
    >
      <article className="relative flex h-full min-w-0 flex-col overflow-hidden rounded-[2.1rem] bg-white transition-shadow duration-300 group-hover/card:shadow-[0_18px_40px_-18px_rgb(15_23_42/0.35)] dark:bg-[#161a21] dark:text-slate-300">
        {/* Escenario del sprite: resplandor del tipo + número difuminado */}
        <div
          className="relative flex flex-col items-center px-4 pt-4"
          style={{
            background: `radial-gradient(62% 52% at 50% 58%, ${c1}3d 0%, ${c2}17 55%, transparent 100%)`,
          }}
        >
          <div className="relative z-30 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[1.3rem]">
            <ToggleCard idPokemon={`${name}-ns`} changeTypeFunction={() => setIsNormal((v) => !v)} isNormal={isNormal} />
            <ToggleFrontBackCard
              changeFrontFunction={() => setIsFront((v) => !v)}
              isFront={isFront}
              isNormal={isNormal}
              idPokemonFront={`${name}-fb`}
            />
          </div>

          <Link
            to={`/pokemon/${id}`}
            aria-label={t("card.open", { name: label })}
            className="relative flex h-[17rem] w-full items-center justify-center rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          >
            <p
              aria-hidden="true"
              className={`pointer-events-none absolute select-none text-7xl font-bold text-gray-300 sm:text-8xl ${!shinyGlobal ? "dark:opacity-10" : "bg-gradient-to-r from-white to-gray-800 bg-clip-text text-transparent text-shadow-xl dark:bg-gradient-to-l"}`}
            >
              #{addZeros(id)}
            </p>
            {/* Sombra de suelo */}
            <span
              aria-hidden="true"
              className="absolute bottom-7 h-4 w-28 rounded-[50%] bg-slate-900/20 blur-[3px] transition-all duration-300 group-hover/card:w-24 group-hover/card:opacity-70 dark:bg-black/50"
            />
            <img
              src={spriteUrl(id, entry.sprites, { shiny, back: !isFront })}
              alt={label}
              width={96}
              height={96}
              loading="lazy"
              decoding="async"
              className="relative z-10 size-48 object-contain drop-shadow-[0_6px_6px_rgb(0_0_0/0.18)] transition-transform duration-300 [image-rendering:pixelated] group-hover/card:-translate-y-2 group-hover/card:scale-110"
            />
            {shiny && (
              <>
                <Sparkle className="left-[24%] top-6 size-5" />
                <Sparkle className="right-[22%] top-12 size-3.5 [animation-delay:300ms]" />
                <Sparkle className="bottom-12 right-[28%] size-4 [animation-delay:700ms]" />
              </>
            )}
          </Link>
        </div>

        {/* Nombre y tipos */}
        <div className="flex flex-1 flex-col items-center gap-3 px-5 pb-4 pt-1">
          <Link to={`/pokemon/${id}`} tabIndex={-1} className="flex min-w-0 max-w-full items-baseline gap-2">
            <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[1.3rem] font-semibold tabular-nums text-slate-500 dark:bg-white/5 dark:text-slate-400">
              #{addZeros(id)}
            </span>
            <h2 className="truncate pb-1 text-[2.1rem] font-extrabold leading-[1.35] tracking-tight text-slate-900 dark:text-white">{label}</h2>
          </Link>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {entry.types.map((type) => (
              <Filter
                key={type}
                size="sm"
                filterName={type}
                label={typeName(type)}
                active={selectedTypes.includes(type)}
                filterColor={isNormal ? type : type + "_shiny"}
                changeFilter={onTypeClick}
              />
            ))}
          </div>
        </div>

        {/* Pie: formas + acciones */}
        <div className="mt-auto flex items-center gap-1 border-t border-slate-100 py-2.5 pl-5 pr-3 dark:border-white/5">
          {formCount > 0 ? (
            <Link
              to={`/pokemon/${id}`}
              className="flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-[1.2rem] font-semibold text-violet-700 transition-colors hover:bg-violet-100 dark:bg-violet-500/15 dark:text-violet-300 dark:hover:bg-violet-500/25"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="size-4" aria-hidden="true">
                <path d="M10 2 3 6v8l7 4 7-4V6l-7-4Zm0 2.3L15 7v6l-5 2.8L5 13V7l5-2.7Z" />
              </svg>
              {t(formCount === 1 ? "card.forms.one" : "card.forms", { n: formCount })}
            </Link>
          ) : (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[1.2rem] font-semibold text-slate-500 dark:bg-white/5 dark:text-slate-400">
              {t("card.gen", { g: entry.gen })}
            </span>
          )}

          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              aria-pressed={isFav}
              aria-label={t(isFav ? "card.fav.remove" : "card.fav.add", { name: label })}
              title={t(isFav ? "card.fav.remove" : "card.fav.add", { name: label })}
              onClick={() => collections.toggle("favorites", id)}
              className={`${action} ${isFav ? "bg-amber-100 text-amber-500 dark:bg-amber-400/15 dark:text-amber-300" : idle}`}
            >
              <svg viewBox="0 0 24 24" className="size-6" fill={isFav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
                <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" />
              </svg>
            </button>
            <button
              type="button"
              aria-pressed={inTeam}
              disabled={teamFull}
              aria-label={teamFull ? t("card.team.full") : t(inTeam ? "card.team.remove" : "card.team.add", { name: label })}
              title={teamFull ? t("card.team.full") : t(inTeam ? "card.team.remove" : "card.team.add", { name: label })}
              onClick={() => collections.toggle("team", id)}
              className={`${action} ${inTeam ? "bg-red-100 text-[#e3350d] dark:bg-[#e3350d]/20 dark:text-[#ff7a5c]" : idle}`}
            >
              {/* Pokéball: en el equipo aparece rellena */}
              <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                {inTeam && <path d="M3 12a9 9 0 0 1 18 0Z" fill="currentColor" stroke="none" />}
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h6m6 0h6" />
                <circle cx="12" cy="12" r="2.6" fill={inTeam ? "white" : "none"} />
              </svg>
            </button>
            <button
              type="button"
              aria-pressed={inCompare}
              aria-label={t(inCompare ? "card.compare.remove" : "card.compare.add", { name: label })}
              title={t(inCompare ? "card.compare.remove" : "card.compare.add", { name: label })}
              onClick={() => collections.toggle("compare", id)}
              className={`${action} ${inCompare ? "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300" : idle}`}
            >
              <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M7 4 3 8l4 4M3 8h13M17 20l4-4-4-4M21 16H8" />
              </svg>
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}

export default memo(Card);
