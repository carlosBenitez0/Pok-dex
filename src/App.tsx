import "./best-css-reset.css";
import "./App.css";
import Header, { Logo } from "./components/Header";
import Filter from "./components/Filter";
import Card from "./components/Card";
import Toggle from "./components/toggles/Toggle";
import { Type } from "./interfaces/IResponse";
import ButtonDarkMode from "./components/ButtonDarkMode";
import ToggleFrontBack from "./components/toggles/ToggleFrontBack";
// custom hooks
import { useNormalShiny } from "./hooks/useNormalShiny";
import { useFrontBack } from "./hooks/useFrontBack";
import { useSelectedFilter } from "./hooks/useSelectedFilter";
import Search from "./components/Search";

function App() {
  const { selectedFilter, handleFilterClick, filterPokemon } =
    useSelectedFilter();
  const { normalShiny, changeNormalShiny, filtersNormalShiny } =
    useNormalShiny();
  const { frontBack, changeFrontBack } = useFrontBack();

  return (
    <div className="relative min-h-screen w-full bg-slate-100 text-[1.6rem] dark:bg-[#0e1217]">
      {/* Video de fondo */}
      {/* {normalShiny !== "NORMAL" ? (
        <div className="fixed inset-0 z-0">
          <video
            id="myVideo"
            className="h-full w-full object-cover"
            autoPlay
            muted
            playsInline
            loop
          >
            <source
              src="https://res.cloudinary.com/dc69f3e0o/video/upload/v1727183826/Pokedex/a2llxdijettw42fkkceh.mp4"
              type="video/mp4"
            />
            Tu navegador no soporta el elemento video.
          </video>
        </div>
      ) : null} */}

      {/* Video de fondo */}

      {/* Contenido principal */}
      <div className="relative z-10 min-h-screen w-full">
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
                selectedFilter={selectedFilter}
                onClick={handleFilterClick}
              />
            ))}
          </div>
        </Header>
        <main className="z-10 mx-auto w-3/4 p-8 pt-12">
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
                    selectedFilter={selectedFilter}
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
    </div>
  );
}
export default App;
