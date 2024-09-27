import Filter from "./Filter";
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

  // Función para agregar ceros a los IDs de los Pokémon
  function addZeros(id: number): string {
    return id.toString().padStart(3, "0");
  }

  // Función para obtener la imagen según los estados de isNormal y isFront
  const getSelectedImage = (): string => {
    if (isNormal && isFront) return image.normal_f;
    if (isNormal && !isFront) return image.normal_b;
    if (!isNormal && isFront) return image.shiny_f;
    return image.shiny_b;
  };

  const changeCardType = (): void => {
    setIsNormal(!isNormal);
  };

  const changeCardFrontBack = (): void => {
    setIsFront(!isFront);
  };

  return (
    <div
      className={`flex flex-col gap-4 rounded-[1.3rem] border-2 border-[#d4d4d4] p-8 dark:border-2 dark:border-[#383d47] dark:text-slate-300 ${normalShiny === "SHINY" ? "backdrop-blur-md dark:border-[#d4d4d4] dark:backdrop-blur-md" : "dark:bg-[#1c1f26]"} `}
    >
      <div className="relative flex items-center justify-center pt-8">
        <div className="absolute top-0 z-[1000] flex w-full items-center justify-center gap-4">
          <ToggleCard
            idPokemon={name}
            changeTypeFunction={changeCardType}
            isNormal={isNormal}
          />
          <ToggleFrontBackCard
            changeFrontFunction={changeCardFrontBack}
            isFront={isFront}
            isNormal={isNormal}
            idPokemonFront={name + "_fb"}
          />
        </div>

        <p
          className={`absolute text-[8rem] font-bold text-gray-300 ${normalShiny !== "SHINY" ? "dark:opacity-10" : ""}`}
        >
          #{addZeros(id)}
        </p>
        <img src={getSelectedImage()} alt={name} className="z-10" />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-center gap-4">
          <p
            className={`w-fit rounded-full bg-[rgba(107,114,128,0.1)] px-4 py-3 font-medium ${normalShiny === "SHINY" ? "dark:text-black" : ""}`}
          >
            #{addZeros(id)}
          </p>
          <p
            className={`text-3xl font-bold ${normalShiny === "SHINY" ? "dark:text-black" : ""}`}
          >
            {name.toUpperCase()}
          </p>
        </div>

        <div className="flex items-center justify-center gap-4">
          {filters.map((filter) => (
            <Filter
              key={filter}
              selectedFilter={selectedFilter}
              filterColor={isNormal ? filter : filter + "_shiny"}
              filterName={filter}
              onClick={() => onFilterClick(filter)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Card;
