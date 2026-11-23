import { useCallback, useState } from "react";
import { usePokemonData } from "./usePokemonData";
import { IResponse } from "../interfaces/IResponse";

const readStoredFilter = (): string => {
  try {
    const stored = window.localStorage.getItem("selectedFilter");
    return stored ? JSON.parse(stored) : "All";
  } catch (error) {
    console.error("Error parsing selectedFilter from localStorage:", error);
    return "All";
  }
};

const hasType = (pokemon: IResponse, typeName: string) =>
  pokemon.types.some((t) => t.type.name === typeName);

export const useSelectedFilter = () => {
  const { pokemonData, loader } = usePokemonData();
  const [selectedFilter, setSelectedFilter] = useState<string>(readStoredFilter);

  const handleFilterClick = (filterName: string) => {
    setSelectedFilter(filterName);
    try {
      window.localStorage.setItem("selectedFilter", JSON.stringify(filterName));
    } catch {
      /* storage no disponible */
    }
  };

  /**
   * 1. Filtra por el chip de tipo seleccionado.
   * 2. Si hay búsqueda: coincide con un tipo exacto, o si no, por nombre/número.
   * 3. Ordena alfabéticamente si `sorted`.
   */
  const filterPokemon = useCallback(
    (search: string, sorted = false): IResponse[] => {
      let list = pokemonData.filter((p): p is IResponse => p !== null);

      const selectedType = selectedFilter.split("_")[0];
      if (selectedType !== "All") {
        list = list.filter((p) => hasType(p, selectedType));
      }

      const term = search.trim().toLowerCase();
      if (term) {
        const byType = list.filter((p) => hasType(p, term));
        list =
          byType.length > 0
            ? byType
            : list.filter(
                (p) =>
                  p.name.toLowerCase().includes(term) ||
                  String(p.id) === term.replace(/^#?0*/, ""),
              );
      }

      if (sorted) {
        list = [...list].sort((a, b) => a.name.localeCompare(b.name));
      }
      return list;
    },
    [pokemonData, selectedFilter],
  );

  return { selectedFilter, handleFilterClick, filterPokemon, loader };
};
