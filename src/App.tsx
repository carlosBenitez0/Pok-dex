import "./best-css-reset.css";
import "./App.css";
import Header, { Logo } from "./components/Header";
import Filter from "./components/Filter";
import Card from "./components/Card";
import Toggle, { ToggleFrontBack } from "./components/Toggle";
import axios from "axios";
import { useEffect, useState } from "react";

export interface IResponse {
  abilities: Ability[];
  base_experience: number;
  cries: Cries;
  forms: Species[];
  game_indices: GameIndex[];
  height: number;
  held_items: any[];
  id: number;
  is_default: boolean;
  location_area_encounters: string;
  moves: Move[];
  name: string;
  order: number;
  past_abilities: any[];
  past_types: any[];
  species: Species;
  sprites: Sprites;
  stats: Stat[];
  types: Type[];
  weight: number;
  names: Names;
}

export interface Ability {
  ability: Species;
  is_hidden: boolean;
  slot: number;
}

export interface Names {
  names: string[];
}

export interface Species {
  name: string;
  url: string;
}

export interface Cries {
  latest: string;
  legacy: string;
}

export interface GameIndex {
  game_index: number;
  version: Species;
}

export interface Move {
  move: Species;
  version_group_details: VersionGroupDetail[];
}

export interface VersionGroupDetail {
  level_learned_at: number;
  move_learn_method: Species;
  version_group: Species;
}

export interface GenerationV {
  "black-white": Sprites;
}

export interface GenerationIv {
  "diamond-pearl": Sprites;
  "heartgold-soulsilver": Sprites;
  platinum: Sprites;
}

export interface Versions {
  "generation-i": GenerationI;
  "generation-ii": GenerationIi;
  "generation-iii": GenerationIii;
  "generation-iv": GenerationIv;
  "generation-v": GenerationV;
  "generation-vi": { [key: string]: Home };
  "generation-vii": GenerationVii;
  "generation-viii": GenerationViii;
}

export interface Other {
  dream_world: DreamWorld;
  home: Home;
  "official-artwork": OfficialArtwork;
  showdown: Sprites;
}

export interface Sprites {
  back_default: string;
  back_female: null;
  back_shiny: string;
  back_shiny_female: null;
  front_default: string;
  front_female: null;
  front_shiny: string;
  front_shiny_female: null;
  other?: Other;
  versions?: Versions;
  animated?: Sprites;
}

export interface GenerationI {
  "red-blue": RedBlue;
  yellow: RedBlue;
}

export interface RedBlue {
  back_default: string;
  back_gray: string;
  back_transparent: string;
  front_default: string;
  front_gray: string;
  front_transparent: string;
}

export interface GenerationIi {
  crystal: Crystal;
  gold: Gold;
  silver: Gold;
}

export interface Crystal {
  back_default: string;
  back_shiny: string;
  back_shiny_transparent: string;
  back_transparent: string;
  front_default: string;
  front_shiny: string;
  front_shiny_transparent: string;
  front_transparent: string;
}

export interface Gold {
  back_default: string;
  back_shiny: string;
  front_default: string;
  front_shiny: string;
  front_transparent?: string;
}

export interface GenerationIii {
  emerald: OfficialArtwork;
  "firered-leafgreen": Gold;
  "ruby-sapphire": Gold;
}

export interface OfficialArtwork {
  front_default: string;
  front_shiny: string;
}

export interface Home {
  front_default: string;
  front_female: null;
  front_shiny: string;
  front_shiny_female: null;
}

export interface GenerationVii {
  icons: DreamWorld;
  "ultra-sun-ultra-moon": Home;
}

export interface DreamWorld {
  front_default: string;
  front_female: null;
}

export interface GenerationViii {
  icons: DreamWorld;
}

export interface Stat {
  base_stat: number;
  effort: number;
  stat: Species;
}

export interface Type {
  slot: number;
  type: Species;
}

function App() {
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
                (type: Type) => type.type.name === selectedFilter
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

    /* const filteredPokemon =
      normalShiny === "NORMAL"
        ? pokemonData
        : pokemonData.filter(
            (pokemon) => pokemon?.sprites && pokemon.sprites.front_shiny
          );

    return filteredPokemon; */
  };

  const changeFrontBack = () => {
    frontBack === "FRONT" ? setFrontBack("BACK") : setFrontBack("FRONT");

    /* const filteredPokemon =
      frontBack === "FRONT"
        ? pokemonData
        : pokemonData.filter(
            (pokemon) => pokemon?.sprites && pokemon.sprites.back_default
          ); */
  };

  return (
    <div className="main-container">
      <Header>
        <div className="header-top">
          <Logo urlLogo="./src/assets/pokédex_logo.png" />
          <div className="toggles-container">
            <Toggle onClic={changeNormalShiny} typeOfPokemon={normalShiny} />
            <ToggleFrontBack
              onClic={changeFrontBack}
              frontBack={frontBack}
              normalShiny={normalShiny}
            />
          </div>
        </div>
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
          {filterPokemon().map(
            (pokemon) =>
              pokemon && (
                <Card
                  key={pokemon.id}
                  id={pokemon.id}
                  // hacer que normalshiny yfrontback sean 2 objetos y llamarlos aqui cuando se necesiten
                  image={
                    {
                      normal_f: pokemon.sprites.front_default,
                      normal_b: pokemon.sprites.back_default,
                      shiny_f: pokemon.sprites.front_shiny,
                      shiny_b: pokemon.sprites.back_shiny,
                    }
                    /* normalShiny === "NORMAL" && frontBack === "FRONT"
                      ? pokemon.sprites.front_default
                      : normalShiny === "NORMAL" && frontBack === "BACK"
                      ? pokemon.sprites.back_default
                      : normalShiny === "SHINY" && frontBack === "FRONT"
                      ? pokemon.sprites.front_shiny
                      : pokemon.sprites.back_shiny */
                  }
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
