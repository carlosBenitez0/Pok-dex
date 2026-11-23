import { addZeros } from "../utils/format";
import Filter from "./Filter";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import ToggleCard from "./toggles/ToggleCard";
import ToggleFrontBackCard from "./toggles/ToggleFrontBackCard";

type Props = {
  id: number;
  image: ImageType;
  name: string;
  filters: string[];
  selectedFilter: string;
  onFilterClick: (filter: string) => void;
  normalShiny: string; // 'NORMAL' o 'SHINY'
  frontBack: string; // 'FRONT' o 'BACK'
};

type ImageType = {
  normal_f: string;
  normal_b: string;
  shiny_f: string;
  shiny_b: string;
};

function Card({
  id,
  image,
  name,
  filters,
  selectedFilter,
  onFilterClick,
  normalShiny,
  frontBack,
}: Props) {
  const [isNormal, setIsNormal] = useState(normalShiny === "NORMAL");
  const [isFront, setIsFront] = useState(frontBack === "FRONT");

  useEffect(() => {
    setIsNormal(normalShiny === "NORMAL");
  }, [normalShiny]);

  useEffect(() => {
    setIsFront(frontBack === "FRONT");
  }, [frontBack]);

  const getSelectedImage = (): string => {
    if (isNormal && isFront) return image.normal_f;
    if (isNormal && !isFront) return image.normal_b;
    if (!isNormal && isFront) return image.shiny_f;
    return image.shiny_b;
  };

  return (
    <article
      className={`flex min-w-0 flex-col gap-4 overflow-hidden rounded-[1.3rem] border-2 border-[#d4d4d4] p-6 sm:p-8 dark:border-2 dark:border-[#383d47] dark:text-slate-300 ${normalShiny === "SHINY" ? "border-black backdrop-blur-md dark:border-[#d4d4d4] dark:backdrop-blur-md" : "dark:bg-[#1c1f26]"}`}
    >
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <ToggleCard
          idPokemon={name}
          changeTypeFunction={() => setIsNormal((v) => !v)}
          isNormal={isNormal}
        />
        <ToggleFrontBackCard
          changeFrontFunction={() => setIsFront((v) => !v)}
          isFront={isFront}
          isNormal={isNormal}
          idPokemonFront={name + "_fb"}
        />
      </div>

      <Link
        to={`/pokemon/${id}`}
        aria-label={`Ver ficha de ${name}`}
        className="group flex flex-col gap-4 rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500"
      >
        <div className="relative flex items-center justify-center">
          <p
            aria-hidden="true"
            className={`pointer-events-none absolute select-none text-7xl font-bold text-gray-300 sm:text-8xl ${normalShiny !== "SHINY" ? "dark:opacity-10" : "bg-gradient-to-r from-white to-gray-800 bg-clip-text text-transparent text-shadow-xl dark:bg-gradient-to-l"}`}
          >
            #{addZeros(id)}
          </p>
          <img
            src={getSelectedImage()}
            alt={name}
            width={96}
            height={96}
            loading="lazy"
            className="z-10 h-48 w-48 transition-transform duration-300 [image-rendering:pixelated] group-hover:scale-110"
          />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <p
            className={`w-fit rounded-full bg-[rgba(107,114,128,0.1)] px-4 py-3 font-medium ${normalShiny === "SHINY" ? "bg-black text-gray-200 shadow-md shadow-slate-800 text-shadow-xl dark:bg-gray-300 dark:text-black dark:shadow-slate-500" : ""}`}
          >
            #{addZeros(id)}
          </p>
          <h2
            className={`break-words text-center text-[2.2rem] font-bold ${normalShiny === "SHINY" ? "text-shadow-xl dark:text-gray-300" : ""}`}
          >
            {name.toUpperCase()}
          </h2>
        </div>
      </Link>

      <div className="flex flex-wrap items-center justify-center gap-4">
        {filters.map((filter) => (
          <Filter
            key={filter}
            selectedFilter={selectedFilter}
            filterColor={isNormal ? filter : filter + "_shiny"}
            filterName={filter}
            changeFilter={() => onFilterClick(filter)}
          />
        ))}
      </div>
    </article>
  );
}

export default Card;
