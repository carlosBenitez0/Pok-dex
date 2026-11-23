import { KeyboardEvent, useId, useState } from "react";
import type { PokedexEntry } from "../data/types";
import { useI18n } from "../i18n";
import { addZeros, prettify } from "../utils/format";
import { spriteUrl } from "../utils/sprites";

interface Props {
  value: string;
  onChange: (value: string) => void;
  suggestions: PokedexEntry[];
  onPick: (p: PokedexEntry) => void;
}

/** Búsqueda con autocompletado (combobox accesible). Enter abre la sugerencia activa. */
const Search = ({ value, onChange, suggestions, onPick }: Props) => {
  const { t, typeName } = useI18n();
  const [focus, setFocus] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();
  const open = focus && suggestions.length > 0 && value.trim().length > 0;

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      onPick(suggestions[Math.min(active, suggestions.length - 1)]);
    } else if (e.key === "Escape") {
      setFocus(false);
    }
  };

  return (
    <div className="relative w-full min-w-0">
      <form
        role="search"
        onSubmit={(event) => event.preventDefault()}
        className={`flex w-full min-w-0 items-center rounded-3xl bg-slate-200 dark:bg-[#1c1f26] dark:text-slate-200 ${focus ? "outline outline-2 outline-slate-500" : ""}`}
      >
        <span className="flex items-center justify-center px-4 py-3 text-slate-400" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-9">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </span>
        <label htmlFor="search" className="sr-only">
          {t("search.label")}
        </label>
        <input
          className="w-full min-w-0 appearance-none bg-transparent py-3 outline-none [&::-webkit-search-cancel-button]:hidden"
          id="search"
          type="search"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open ? `${listId}-${active}` : undefined}
          placeholder={t("search.placeholder")}
          onFocus={() => setFocus(true)}
          onBlur={() => setTimeout(() => setFocus(false), 120)}
          onChange={(e) => {
            setActive(0);
            onChange(e.target.value);
          }}
          onKeyDown={onKeyDown}
          value={value}
          autoComplete="off"
        />
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label={t("search.clear")}
          className={`flex items-center justify-center p-3 text-slate-500 dark:text-slate-300 ${value.length > 0 ? "visible" : "invisible"}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-10" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </form>

      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-full z-40 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#1c1f26]"
        >
          {suggestions.map((p, i) => (
            <li
              key={p.id}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => {
                e.preventDefault();
                onPick(p);
              }}
              onMouseEnter={() => setActive(i)}
              className={`flex cursor-pointer items-center gap-4 px-4 py-2 ${i === active ? "bg-slate-100 dark:bg-white/10" : ""}`}
            >
              <img src={spriteUrl(p.id, p.sprites)} alt="" width={48} height={48} className="size-16 [image-rendering:pixelated]" loading="lazy" />
              <span className="w-16 text-slate-400">#{addZeros(p.id)}</span>
              <span className="flex-1 font-semibold">{prettify(p.name)}</span>
              <span className="hidden text-[1.3rem] text-slate-500 sm:inline dark:text-slate-400">
                {p.types.map(typeName).join(" · ")}
              </span>
              {i === active && (
                <kbd className="hidden rounded bg-slate-200 px-2 text-[1.2rem] text-slate-600 sm:inline dark:bg-white/10 dark:text-slate-300">
                  {t("search.hint")}
                </kbd>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Search;
