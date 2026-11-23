import { memo, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Filter from "./Filter";
import ToggleCard from "./toggles/ToggleCard";
import ToggleFrontBackCard from "./toggles/ToggleFrontBackCard";
import type { PokedexEntry } from "../data/types";
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

const actionBtn =
  "grid size-11 place-items-center rounded-full text-[1.6rem] transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-40";

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

  return (
    <article
      className={`relative flex min-w-0 flex-col gap-4 overflow-hidden rounded-[1.3rem] border-2 border-[#d4d4d4] p-6 sm:p-8 dark:border-[#383d47] dark:text-slate-300 ${shinyGlobal ? "border-black backdrop-blur-md dark:border-[#d4d4d4]" : "bg-white/40 dark:bg-[#1c1f26]"}`}
    >
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
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
        className="group flex flex-col gap-4 rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500"
      >
        <div className="relative flex items-center justify-center">
          <p
            aria-hidden="true"
            className={`pointer-events-none absolute select-none text-7xl font-bold text-gray-300 sm:text-8xl ${!shinyGlobal ? "dark:opacity-10" : "bg-gradient-to-r from-white to-gray-800 bg-clip-text text-transparent text-shadow-xl dark:bg-gradient-to-l"}`}
          >
            #{addZeros(id)}
          </p>
          <img
            src={spriteUrl(id, entry.sprites, { shiny: !isNormal, back: !isFront })}
            alt={label}
            width={96}
            height={96}
            loading="lazy"
            decoding="async"
            className="z-10 h-48 w-48 object-contain transition-transform duration-300 [image-rendering:pixelated] group-hover:scale-110"
          />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <p
            className={`w-fit rounded-full bg-[rgba(107,114,128,0.1)] px-4 py-2 font-medium ${shinyGlobal ? "bg-black text-gray-200 shadow-md shadow-slate-800 dark:bg-gray-300 dark:text-black" : ""}`}
          >
            #{addZeros(id)}
          </p>
          <h2 className={`break-words text-center text-[2.2rem] font-bold ${shinyGlobal ? "text-shadow-xl dark:text-gray-300" : ""}`}>
            {label.toUpperCase()}
          </h2>
        </div>
      </Link>

      <div className="flex flex-wrap items-center justify-center gap-3">
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

      {/* Acciones: favorito, equipo, comparar */}
      <div className="flex items-center justify-center gap-3 border-t border-slate-200 pt-4 dark:border-white/10">
        <button
          type="button"
          aria-pressed={isFav}
          aria-label={t(isFav ? "card.fav.remove" : "card.fav.add", { name: label })}
          title={t(isFav ? "card.fav.remove" : "card.fav.add", { name: label })}
          onClick={() => collections.toggle("favorites", id)}
          className={`${actionBtn} ${isFav ? "bg-amber-400 text-white" : "bg-slate-200 text-slate-500 dark:bg-white/10 dark:text-slate-300"}`}
        >
          {isFav ? "★" : "☆"}
        </button>
        <button
          type="button"
          aria-pressed={inTeam}
          disabled={teamFull}
          aria-label={teamFull ? t("card.team.full") : t(inTeam ? "card.team.remove" : "card.team.add", { name: label })}
          title={teamFull ? t("card.team.full") : t(inTeam ? "card.team.remove" : "card.team.add", { name: label })}
          onClick={() => collections.toggle("team", id)}
          className={`${actionBtn} font-bold ${inTeam ? "bg-[#e3350d] text-white" : "bg-slate-200 text-slate-500 dark:bg-white/10 dark:text-slate-300"}`}
        >
          {inTeam ? "✓" : "+"}
        </button>
        <button
          type="button"
          aria-pressed={inCompare}
          aria-label={t(inCompare ? "card.compare.remove" : "card.compare.add", { name: label })}
          title={t(inCompare ? "card.compare.remove" : "card.compare.add", { name: label })}
          onClick={() => collections.toggle("compare", id)}
          className={`${actionBtn} ${inCompare ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500 dark:bg-white/10 dark:text-slate-300"}`}
        >
          ⇄
        </button>
        {entry.forms && entry.forms.length > 0 && (
          <Link
            to={`/pokemon/${id}`}
            className="ml-1 rounded-full bg-violet-100 px-3 py-1 text-[1.2rem] font-semibold text-violet-700 dark:bg-violet-500/20 dark:text-violet-300"
          >
            {t("card.forms", { n: entry.forms.length })}
          </Link>
        )}
      </div>
    </article>
  );
}

export default memo(Card);
