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

function App() {
  const [pokemonData, setPokemonData] = useState<(IResponse | null)[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const [normalShiny, setNormalShiny] = useState<string>("NORMAL");
  const [frontBack, setFrontBack] = useState<string>("FRONT");

  const getPokemonData = async (id: number): Promise<IResponse | null> => {
    const endPoint: string = `https://pokeapi.co/api/v2/pokemon-form/${id}/`;
    try {
      const response = await axios.get(endPoint);
      let data = response.data;
      return data;
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

  const filterPokemon = () => {
    const filteredPokemon =
      selectedFilter === "All"
        ? pokemonData
        : pokemonData.filter(
            (pokemon) =>
              pokemon &&
              pokemon.types.some(
                (type: Type) => type.type.name === selectedFilter.split("_")[0]
              )
          );
    return filteredPokemon;
  };
  filterPokemon();

  const handleFilterClick = (filterName: string) => {
    setSelectedFilter(filterName);
  };

  const changeNormalShiny = () => {
    normalShiny === "NORMAL"
      ? setNormalShiny("SHINY")
      : setNormalShiny("NORMAL");
  };

  const changeFrontBack = () => {
    frontBack === "FRONT" ? setFrontBack("BACK") : setFrontBack("FRONT");
  };

  const filtersNormalShiny =
    normalShiny === "NORMAL" ? typeColors : typeColorsShiny;

  return (
    <div className="main-container dark:bg-[#0e1217]">
      <Header>
        <div className="header-top">
          <Logo urlLogo="./src/assets/pokédex_logo.png" />
          <div className="toggles-container flex">
            <Toggle onClic={changeNormalShiny} typeOfPokemon={normalShiny} />
            <ToggleFrontBack
              onClic={changeFrontBack}
              frontBack={frontBack}
              normalShiny={normalShiny}
            />
            <ButtonDarkMode />
          </div>
        </div>
        <div className="filters-container">
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
      <main className="main">
        <div className="cards">
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
                ></Card>
              )
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
