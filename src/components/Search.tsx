import { KeyboardEvent, useEffect, useId, useRef, useState } from "react";
import type { PokedexEntry } from "../data/types";
import { useI18n } from "../i18n";
import { PokemonOption } from "./PokemonOption";

interface Props {
  value: string;
  onChange: (value: string) => void;
  suggestions: PokedexEntry[];
  onPick: (p: PokedexEntry) => void;
  /** Total de resultados con el filtro actual (se muestra a la derecha). */
  resultCount?: number;
}

const isTyping = (el: Element | null) =>
  !!el && (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || (el as HTMLElement).isContentEditable);

/** Buscador con autocompletado (combobox accesible). "/" enfoca, Enter abre, Esc cierra. */
const Search = ({ value, onChange, suggestions, onPick, resultCount }: Props) => {
  const { t, lang } = useI18n();
  const [focus, setFocus] = useState(false);
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const listId = useId();
  const open = focus && suggestions.length > 0 && value.trim().length > 0;

  // Atajo global "/" para enfocar el buscador.
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "/" && !isTyping(document.activeElement)) {
        e.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      if (value) onChange("");
      else input.current?.blur();
      return;
    }
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
    }
  };

  return (
    <div className="relative w-full min-w-0">
      <form
        role="search"
        onSubmit={(event) => event.preventDefault()}
        className={`group flex h-[5.6rem] w-full min-w-0 items-center gap-1 rounded-2xl bg-white/80 pl-3 pr-2 shadow-sm ring-1 backdrop-blur transition-[box-shadow,background-color] duration-200 dark:bg-white/[0.04] ${
          focus
            ? "bg-white shadow-[0_0_0_5px_rgb(227_53_13/0.12),0_10px_30px_-10px_rgb(227_53_13/0.35)] ring-[#e3350d]/60 dark:bg-white/[0.07] dark:shadow-[0_0_0_5px_rgb(255_107_74/0.14),0_10px_30px_-10px_rgb(255_107_74/0.4)] dark:ring-[#ff6b4a]/60"
            : "ring-slate-200 hover:ring-slate-300 dark:ring-white/10 dark:hover:ring-white/20"
        }`}
      >
        <span
          className={`grid size-11 shrink-0 place-items-center rounded-xl transition-colors ${focus ? "bg-[#e3350d] text-white" : "bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400"}`}
          aria-hidden="true"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </span>
        <label htmlFor="search" className="sr-only">
          {t("search.label")}
        </label>
        <input
          ref={input}
          className="h-full w-full min-w-0 appearance-none bg-transparent px-2 text-[1.7rem] font-medium text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-400 dark:text-white [&::-webkit-search-cancel-button]:hidden"
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
          spellCheck={false}
        />
        {value ? (
          <>
            {resultCount !== undefined && (
              <span className="hidden shrink-0 rounded-full bg-slate-100 px-3 py-1 text-[1.2rem] font-semibold tabular-nums text-slate-500 sm:inline dark:bg-white/5 dark:text-slate-400">
                {resultCount}
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                onChange("");
                input.current?.focus();
              }}
              aria-label={t("search.clear")}
              className="grid size-10 shrink-0 place-items-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-6" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </>
        ) : (
          <kbd className="mr-2 hidden shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-0.5 font-mono text-[1.3rem] text-slate-400 sm:inline dark:border-white/10 dark:bg-white/5">
            /
          </kbd>
        )}
      </form>

      {open && (
        <div className="absolute inset-x-0 top-full z-40 mt-3 origin-top animate-[pop_140ms_ease-out] overflow-hidden rounded-2xl bg-white/95 shadow-[0_20px_50px_-12px_rgb(15_23_42/0.35)] ring-1 ring-slate-200 backdrop-blur-xl dark:bg-[#161a21]/95 dark:ring-white/10">
          <ul id={listId} role="listbox" className="max-h-[42rem] overflow-y-auto p-2">
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
                className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 transition-colors ${i === active ? "bg-slate-100 dark:bg-white/[0.07]" : ""}`}
              >
                <PokemonOption p={p} query={value} active={i === active} />
                <span
                  aria-hidden="true"
                  className={`shrink-0 text-[1.8rem] text-slate-300 transition-transform dark:text-slate-600 ${i === active ? "translate-x-0 opacity-100" : "-translate-x-1 opacity-0"}`}
                >
                  ↵
                </span>
              </li>
            ))}
          </ul>
          <div className="hidden items-center gap-4 border-t border-slate-100 px-4 py-2 text-[1.2rem] text-slate-400 sm:flex dark:border-white/5">
            <span>
              <kbd className="font-mono">↑↓</kbd> {lang === "es" ? "navegar" : "navigate"}
            </span>
            <span>
              <kbd className="font-mono">↵</kbd> {lang === "es" ? "abrir" : "open"}
            </span>
            <span>
              <kbd className="font-mono">esc</kbd> {lang === "es" ? "limpiar" : "clear"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
