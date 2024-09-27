import { useState } from "react";
export const useSeelectedFilter = () => {
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

  const filterPokemon = () => {
    const filteredPokemon =
      selectedFilter === "All"
        ? pokemonData
        : pokemonData.filter(
            (pokemon) =>
              pokemon &&
              pokemon.types.some(
                (type: Type) => type.type.name === selectedFilter.split("_")[0],
              ),
          );
    return filteredPokemon;
  };

  return { selectedFilter, handleFilterClick, filterPokemon };
};
