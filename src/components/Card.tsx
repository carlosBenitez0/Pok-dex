import Filter from "./Filter";
import { useState, useEffect } from "react";
import "../css/Card.css";
import { ToggleCard, ToggleFrontBackCard } from "./Toggle";

type Props = {
  id: number;
  image: ImageType;
  name: string;
  filters: string[];
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
    <div className="card dark:bg-[#1c1f26] dark:border-2 dark:border-[#383d47]  border-2 border-[#d4d4d4] dark:text-slate-300">
      <div className="card-header">
        <div className="toggles-card-container">
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
        <p className="poke-id-bg text-gray-300 dark:text-gray-300 dark:opacity-10">
          #{addZeros(id)}
        </p>
        <img src={getSelectedImage()} alt={name} />
      </div>
      <div className="card-body">
        <div className="card-body-info">
          {/* background-color: rgb(228, 228, 228);
    padding: .3rem 1rem;
    border-radius: 50px; */}
          <p className="dark:bg-[rgba(107,114,128,0.1)] rounded-full py-1 px-4">
            #{addZeros(id)}
          </p>
          <p className="poke-info">{name.toUpperCase()}</p>
        </div>
        <div className="card-body-filters">
          {filters.map((filter) => (
            <Filter
              key={filter}
              filterColor={filter}
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
