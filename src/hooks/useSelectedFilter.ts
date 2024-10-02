import { useEffect, useState } from "react";
import { usePokemonData } from "./usePokemonData";
import { IResponse, Type } from "../interfaces/IResponse";

export const useSelectedFilter = () => {
  const { pokemonData } = usePokemonData();
  const [selectedFilter, setSelectedFilter] = useState<string>(() => {
    const selectedFilterStorage = window.localStorage.getItem("selectedFilter");
    try {
      return selectedFilterStorage ? JSON.parse(selectedFilterStorage) : "All";
    } catch (error) {
      console.error("Error parsing selectedFilter from localStorage:", error);
      return "All"; // Valor por defecto en caso de error
    }
  });

  // Estado para almacenar la lista filtrada de Pokémon
  //Se hace esto porque el pokemonData al ser asincrono, puede que venga vacio en el primer render
  const [filteredPokemon, setFilteredPokemon] = useState<(IResponse | null)[]>(
    [],
  );

  useEffect(() => {
    if (pokemonData) {
      // Filtra los Pokémon cuando pokemonData o selectedFilter cambian
      setFilteredPokemon(filterPokemon(""));
    }
  }, [pokemonData]);

  const handleFilterClick = (filterName: string) => {
    setSelectedFilter(filterName);
    window.localStorage.setItem("selectedFilter", JSON.stringify(filterName));
  };

  const filterPokemon = (search: string, checked?: boolean) => {
    if (!pokemonData) return [];
    // console.log(pokemonData);
    let _pokemon;

    if (search && search.length > 0) {
      // Comprobamos si el 'search' coincide con un tipo de Pokémon
      if (checked) {
        _pokemon = [...pokemonData].sort((a, b) =>
          a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
        );
        _pokemon = _pokemon.filter(
          (pokemon) =>
            pokemon &&
            pokemon.types.some(
              (type: Type) =>
                type.type.name.toLowerCase() === search.toLowerCase(),
            ),
        );
      } else {
        _pokemon = pokemonData.filter(
          (pokemon) =>
            pokemon &&
            pokemon.types.some(
              (type: Type) =>
                type.type.name.toLowerCase() === search.toLowerCase(),
            ),
        );
      }

      // Si no encuentra Pokémon por tipo, filtramos por nombre
      if (_pokemon.length === 0) {
        _pokemon = pokemonData.filter(
          (pokemon) =>
            pokemon &&
            pokemon.name.toLowerCase().includes(search.toLowerCase()),
        );
      }
    } else {
      // Si no hay búsqueda activa, filtra según el filtro seleccionado
      if (checked) {
        _pokemon = [...pokemonData].sort((a, b) =>
          a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
        );

        if (selectedFilter !== "All") {
          _pokemon = _pokemon.filter((pokemon) =>
            pokemon?.types.some(
              (type: Type) => type.type.name === selectedFilter.split("_")[0],
            ),
          );
        }
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
    }

    return _pokemon;
  };

  return {
    selectedFilter,
    handleFilterClick,
    filterPokemon,
    filteredPokemon,
  };
};
