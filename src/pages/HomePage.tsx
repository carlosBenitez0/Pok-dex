import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageShell } from "../components/Header";
import { TopBar } from "../components/TopBar";
import Card from "../components/Card";
import Search from "../components/Search";
import Toggle from "../components/toggles/Toggle";
import ToggleFrontBack from "../components/toggles/ToggleFrontBack";
import { Loader } from "../components/Loader";
import { FavoritesToggle, GenerationTabs, SortControl, TypeChips } from "../components/ListControls";
import { useNormalShiny } from "../hooks/useNormalShiny";
import { useFrontBack } from "../hooks/useFrontBack";
import { usePokedex } from "../hooks/usePokedex";
import { usePersistentState } from "../hooks/usePersistentState";
import { filterPokedex, suggest, SortDir, SortKey } from "../lib/filter";
import { useCollection } from "../lib/collections";
import { useI18n } from "../i18n";
import type { PokedexEntry } from "../data/types";
import { Link } from "react-router-dom";

const PAGE = 48;

const isNum = (v: unknown): v is number => typeof v === "number";
const isStrArr = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === "string");
const isSort = (v: unknown): v is SortKey => ["number", "name", "total", "weight", "height"].includes(v as string);
const isDir = (v: unknown): v is SortDir => v === "asc" || v === "desc";
const isBool = (v: unknown): v is boolean => typeof v === "boolean";

function HomePage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { list, loading } = usePokedex();
  const { normalShiny, changeNormalShiny } = useNormalShiny();
  const { frontBack, changeFrontBack } = useFrontBack();

  const [search, setSearch] = useState("");
  const [gen, setGen] = usePersistentState("pokedex.gen", 0, isNum);
  const [types, setTypes] = usePersistentState<string[]>("pokedex.types", [], isStrArr);
  const [sort, setSort] = usePersistentState<SortKey>("pokedex.sort", "number", isSort);
  const [dir, setDir] = usePersistentState<SortDir>("pokedex.dir", "asc", isDir);
  const [favoritesOnly, setFavoritesOnly] = usePersistentState("pokedex.favOnly", false, isBool);
  const favoritesList = useCollection("favorites");
  const compare = useCollection("compare");
  const favorites = useMemo(() => new Set(favoritesList), [favoritesList]);

  // La lista se recalcula con un valor diferido: escribir nunca se bloquea.
  const deferredSearch = useDeferredValue(search);
  const results = useMemo(
    () => filterPokedex(list, { search: deferredSearch, gen, types, sort, dir, favoritesOnly, favorites }),
    [list, deferredSearch, gen, types, sort, dir, favoritesOnly, favorites],
  );
  const suggestions = useMemo(() => suggest(list, search), [list, search]);

  // Scroll infinito: se pintan bloques de 48 a medida que aparece el centinela.
  const [visible, setVisible] = useState(PAGE);
  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => setVisible(PAGE), [deferredSearch, gen, types, sort, dir, favoritesOnly]);
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries[0].isIntersecting && setVisible((v) => v + PAGE),
      { rootMargin: "800px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [results.length, loading]);

  const toggleType = useCallback(
    (type: string) =>
      setTypes((prev) =>
        prev.includes(type) ? prev.filter((x) => x !== type) : [...prev, type].slice(-2),
      ),
    [setTypes],
  );

  const openPokemon = (p: PokedexEntry) => navigate(`/pokemon/${p.id}`);
  const shown = results.slice(0, visible);

  return (
    <PageShell
      header={
        <div className="flex flex-col gap-6">
          <TopBar />
          <Search value={search} onChange={setSearch} suggestions={suggestions} onPick={openPokemon} />
          <GenerationTabs gen={gen} onChange={setGen} />
          <TypeChips
            types={types}
            shiny={normalShiny === "SHINY"}
            onToggle={toggleType}
            onClear={() => setTypes([])}
          />
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <SortControl sort={sort} dir={dir} onSort={setSort} onDir={setDir} />
            <FavoritesToggle on={favoritesOnly} onChange={setFavoritesOnly} />
            <Toggle onClic={changeNormalShiny} typeOfPokemon={normalShiny} />
            <ToggleFrontBack onClic={changeFrontBack} frontBack={frontBack} normalShiny={normalShiny} />
          </div>
        </div>
      }
    >
      {loading ? (
        <div className="flex w-full justify-center">
          <Loader label={t("loading")} />
        </div>
      ) : (
        <>
          <p className="mb-6 font-medium text-slate-500 dark:text-slate-400" aria-live="polite">
            {t("results", { n: results.length })}
          </p>
          {results.length === 0 ? (
            <p className="py-16 text-center font-medium text-slate-500 dark:text-slate-400">
              {favoritesOnly && favorites.size === 0 ? t("empty.favorites") : t("empty")}
            </p>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,24rem),1fr))] gap-6 sm:gap-8">
              {shown.map((p) => (
                <Card
                  key={p.id}
                  entry={p}
                  selectedTypes={types}
                  onTypeClick={toggleType}
                  normalShiny={normalShiny}
                  frontBack={frontBack}
                />
              ))}
            </div>
          )}
          {visible < results.length && (
            <div ref={sentinel} className="flex justify-center py-10 text-slate-500" role="status">
              {t("loading.more")}
            </div>
          )}
        </>
      )}

      {/* Bandeja del comparador */}
      {compare.length > 0 && (
        <Link
          to="/comparar"
          className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-full bg-blue-600 px-6 py-3 font-bold text-white shadow-2xl shadow-blue-900/40 hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        >
          ⇄ {t("nav.compare")} ({compare.length}/2) →
        </Link>
      )}
    </PageShell>
  );
}

export default HomePage;
