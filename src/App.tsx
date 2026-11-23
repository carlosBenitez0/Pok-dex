import "./best-css-reset.css";
import "./App.css";
import Header, { Logo } from "./components/Header";
import Filter from "./components/Filter";
import Card from "./components/Card";
import Toggle from "./components/toggles/Toggle";
import ButtonDarkMode from "./components/ButtonDarkMode";
import ToggleFrontBack from "./components/toggles/ToggleFrontBack";
import Search from "./components/Search";
import { CheckboxOrder } from "./components/CheckboxOrder";
import { Loader } from "./components/Loader";
// custom hooks
import { useNormalShiny } from "./hooks/useNormalShiny";
import { useFrontBack } from "./hooks/useFrontBack";
import { useSelectedFilter } from "./hooks/useSelectedFilter";
import { useDebounce } from "./hooks/useDebounce";
import { useMemo, useState } from "react";

function App() {
  const { selectedFilter, handleFilterClick, filterPokemon, loader } =
    useSelectedFilter();
  const { normalShiny, changeNormalShiny, filtersNormalShiny } =
    useNormalShiny();
  const { frontBack, changeFrontBack } = useFrontBack();
  const [search, setSearch] = useState("");
  const [sorted, setSorted] = useState(false);

  const debouncedSearch = useDebounce(search, 250);

  // Lista derivada: búsqueda + filtro de tipo + orden, sin estado espejo.
  const listOfPokemons = useMemo(
    () => filterPokemon(debouncedSearch, sorted),
    [filterPokemon, debouncedSearch, sorted],
  );

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-slate-100 text-[1.6rem] dark:bg-[#0e1217]">
      <div className="relative z-10 min-h-screen w-full">
        <Header>
          <div className="mb-6 flex flex-col gap-6 sm:mb-8">
            {/* Móvil: logo + modo oscuro arriba, búsqueda a todo el ancho abajo */}
            <div className="flex flex-wrap items-center justify-between gap-4 sm:flex-nowrap sm:gap-8">
              <Logo urlLogo="https://res.cloudinary.com/dc69f3e0o/image/upload/v1726878134/Pokedex/giyntoth5j2dy870vuud.png" />
              <div className="order-3 w-full sm:order-2 sm:flex-1">
                <Search onSearchChange={setSearch} />
              </div>
              <div className="order-2 sm:order-3">
                <ButtonDarkMode />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
              <CheckboxOrder
                sortOrDisorder={() => setSorted((v) => !v)}
                normalShiny={normalShiny}
                checked={sorted}
              />
              <Toggle onClic={changeNormalShiny} typeOfPokemon={normalShiny} />
              <ToggleFrontBack
                onClic={changeFrontBack}
                frontBack={frontBack}
                normalShiny={normalShiny}
              />
            </div>
          </div>

          {/* Móvil: una fila con scroll horizontal; desde sm: chips en varias filas */}
          <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 py-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
            {filtersNormalShiny.map((element) => (
              <Filter
                key={element}
                filterName={element}
                filterColor={element}
                selectedFilter={selectedFilter}
                changeFilter={handleFilterClick}
              />
            ))}
          </div>
        </Header>

        <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-8 sm:px-8 sm:pt-12">
          {loader ? (
            <div className="flex w-full justify-center">
              <Loader />
            </div>
          ) : listOfPokemons.length === 0 ? (
            <p className="py-16 text-center font-medium text-slate-500 dark:text-slate-400">
              Ningún Pokémon coincide con «{debouncedSearch}».
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 min-[480px]:grid-cols-2 sm:gap-8 md:grid-cols-3 xl:grid-cols-4">
              {listOfPokemons.map((pokemon) => (
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
                  selectedFilter={selectedFilter}
                  filters={pokemon.types.map((type) => type.type.name)}
                  normalShiny={normalShiny}
                  frontBack={frontBack}
                  onFilterClick={handleFilterClick}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
export default App;
