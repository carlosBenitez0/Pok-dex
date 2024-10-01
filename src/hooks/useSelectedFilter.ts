import { useState } from "react";
import { usePokemonData } from "./usePokemonData";
import { Type } from "../interfaces/IResponse";

export const useSelectedFilter = () => {
  const { pokemonData } = usePokemonData();
  const [selectedFilter, setSelectedFilter] = useState<string>(() => {
    const selectedFilterStorage = window.localStorage.getItem("selectedFilter");
    try {
      return selectedFilterStorage ? JSON.parse(selectedFilterStorage) : "All";
    } catch (error) {
      console.error("Error parsing selectedFilter from localStorage:", error);
      return "All"; // Valor por defecto en caso de error ya que no se puede leer un json que es undefined
    }
  });

  const handleFilterClick = (filterName: string) => {
    setSelectedFilter(filterName);
    window.localStorage.setItem("selectedFilter", JSON.stringify(filterName));
  };

  const filterPokemon = (search?: string) => {
    console.log(selectedFilter);
    let _pokemon;
    if (search !== undefined && search?.length > 0) {
      _pokemon = pokemonData
        ? pokemonData.filter(
            (pokemon) =>
              pokemon &&
              pokemon.name.toLowerCase().includes(search.toLowerCase()),
          )
        : null;
    } else {
      _pokemon =
        selectedFilter === "All"
          ? pokemonData
          : pokemonData.filter(
              (pokemon) =>
                pokemon &&
                pokemon.types.some(
                  (type: Type) =>
                    type.type.name === selectedFilter.split("_")[0],
                ),
            );
    }

    console.log(_pokemon);
    return _pokemon;
  };

  return { selectedFilter, handleFilterClick, filterPokemon };
};
