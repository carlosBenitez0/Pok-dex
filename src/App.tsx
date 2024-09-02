import "./best-css-reset.css";
import "./App.css";
import Header, { Logo } from "./components/Header";
import Filter from "./components/Filter";
import Card from "./components/Card";
import axios from "axios";
import { useEffect, useState } from "react";

type Props = {};

function App({}: Props) {
  const typeColors = [
    "All",
    "normal",
    "fire",
    "water",
    "grass",
    "electric",
    "ice",
    "fighting",
    "poison",
    "ground",
    "flying",
    "psychic",
    "bug",
    "rock",
    "ghost",
    "dark",
    "dragon",
    "steel",
    "fairy",
  ];

  const [pokemonData, setPokemonData] = useState<any[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>("All");

  const getPokemonData = async (id: number) => {
    const endPoint = `https://pokeapi.co/api/v2/pokemon-form/${id}/`;
    try {
      const response = await axios.get(endPoint);
      return response.data;
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  useEffect(() => {
    const getAllPokemon = async () => {
      const promises = [];
      for (let i = 1; i <= 151; i++) {
        promises.push(getPokemonData(i));
      }
      const results = await Promise.all(promises);
      setPokemonData(results);
    };

    getAllPokemon();
  }, []);

  const filteredPokemon =
    selectedFilter === "All"
      ? pokemonData
      : pokemonData.filter((pokemon) =>
          pokemon.types.some((type: any) => type.type.name === selectedFilter)
        );

  const handleFilterClick = (filterName: string) => {
    setSelectedFilter(filterName);
  };

  return (
    <div className="main-container">
      <Header>
        <Logo urlLogo="./src/assets/pokédex_logo.png" />
        <div className="filters-container">
          {typeColors.map((element) => (
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
          {filteredPokemon.map((pokemon) => (
            <Card
              key={pokemon.id}
              id={pokemon.id}
              image={pokemon.sprites.front_shiny}
              name={pokemon.name}
              filters={pokemon.types.map((type: any) => type.type.name)}
              onFilterClick={handleFilterClick}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;
