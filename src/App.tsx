import "./best-css-reset.css";
import "./App.css";
import Header, { Logo } from "./components/Header";
import Filter from "./components/Filter";
import Card from "./components/Card";
import Toggle, { ToggleFrontBack } from "./components/Toggle";
import axios from "axios";
import { useEffect, useState } from "react";
import { IResponse, Type } from "./interfaces/IResponse";
import { typeColors, typeColorsShiny } from "./constants/constants";
import ButtonDarkMode from "./components/ButtonDarkMode";

/* TODO:
  ------change color of filters in cards to gradients when user clicks on normalShiny Toggle
  -add shiny mode
*/

function App() {
  const [pokemonData, setPokemonData] = useState<(IResponse | null)[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>("All");

  const [normalShiny, setNormalShiny] = useState<string>(() => {
    const normalShinyStorage = window.localStorage.getItem("normalShiny");
    try {
      return normalShinyStorage ? JSON.parse(normalShinyStorage) : "NORMAL";
    } catch (error) {
      console.error("Error parsing normalShiny from localStorage:", error);
      return "NORMAL"; // Valor por defecto en caso de error ya que no se puede leer un json que es undefined
    }
  });

  const [frontBack, setFrontBack] = useState<string>(() => {
    const frontBackStorage = window.localStorage.getItem("frontBack");
    try {
      return frontBackStorage ? JSON.parse(frontBackStorage) : "FRONT";
    } catch (error) {
      console.error("Error parsing frontBack from localStorage:", error);
      return "FRONT";
    }
  });

  const getPokemonData = async (id: number): Promise<IResponse | null> => {
    const endPoint: string = `https://pokeapi.co/api/v2/pokemon-form/${id}/`;
    try {
      const response = await axios.get(endPoint);
      return response.data;
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  useEffect(() => {
    const getAllPokemon = async (): Promise<void> => {
      const promises = [];
      for (let i = 1; i <= 151; i++) {
        promises.push(getPokemonData(i));
      }
      const results = await Promise.all(promises);
      setPokemonData(results);
    };

    getAllPokemon();
  }, []);

  useEffect(() => {
    // Actualizar localStorage cuando normalShiny cambie
    window.localStorage.setItem("normalShiny", JSON.stringify(normalShiny));
  }, [normalShiny]);

  useEffect(() => {
    window.localStorage.setItem("frontBack", JSON.stringify(frontBack));
  }, [frontBack]);

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

  const handleFilterClick = (filterName: string) => {
    setSelectedFilter(filterName);
  };

  const changeNormalShiny = () => {
    setNormalShiny((prev) => (prev === "NORMAL" ? "SHINY" : "NORMAL"));
  };

  const changeFrontBack = () => {
    setFrontBack((prev) => (prev === "FRONT" ? "BACK" : "FRONT"));
  };

  const filtersNormalShiny =
    normalShiny === "NORMAL" ? typeColors : typeColorsShiny;

  return (
    <div className="min-h-screen w-full bg-slate-100 text-[1.6rem] dark:bg-[#0e1217]">
      <Header>
        <div className="mb-8 flex items-center justify-between gap-8">
          <Logo urlLogo="https://res.cloudinary.com/dc69f3e0o/image/upload/v1726878134/Pokedex/giyntoth5j2dy870vuud.png" />
          <div className="flex items-center justify-end gap-8">
            <Toggle onClic={changeNormalShiny} typeOfPokemon={normalShiny} />
            <ToggleFrontBack
              onClic={changeFrontBack}
              frontBack={frontBack}
              normalShiny={normalShiny}
            />
            <ButtonDarkMode />
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          {filtersNormalShiny.map((element) => (
            <Filter
              key={element}
              filterName={element}
              filterColor={element}
              onClick={handleFilterClick}
            />
          ))}
        </div>
      </Header>
      <main className="mx-auto w-3/4 p-8 pt-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
          {filterPokemon().map(
            (pokemon) =>
              pokemon && (
                <Card
                  key={pokemon.id}
                  id={pokemon.id}
                  image={{
                    normal_f: pokemon.sprites.front_default,
                    normal_b: pokemon.sprites.back_default,
                    shiny_f: pokemon.sprites.front_shiny,
                    shiny_b: pokemon.sprites.back_shiny,
                  }}
                  name={pokemon.name}
                  filters={pokemon.types.map((type: Type) => type.type.name)}
                  normalShiny={normalShiny}
                  frontBack={frontBack}
                  onFilterClick={handleFilterClick}
                />
              ),
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
