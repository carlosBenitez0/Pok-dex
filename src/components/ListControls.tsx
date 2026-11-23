import { KeyboardEvent, useEffect, useId, useRef, useState } from "react";
import { typeColors } from "../constants/constants";
import { useI18n } from "../i18n";
import type { SortDir, SortKey } from "../lib/filter";
import { ROMAN } from "../utils/format";
import Filter from "./Filter";

const scrollRow =
  "no-scrollbar -mx-[1.6rem] flex snap-x scroll-px-[1.6rem] items-center gap-3 overflow-x-auto px-[1.6rem] py-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0";

export function GenerationTabs({ gen, onChange }: { gen: number; onChange: (g: number) => void }) {
  const { t } = useI18n();
  return (
    <div role="tablist" aria-label={t("gen.label")} className={scrollRow}>
      {Array.from({ length: 10 }, (_, g) => (
        <button
          key={g}
          type="button"
          role="tab"
          aria-selected={gen === g}
          onClick={() => onChange(g)}
          className={`shrink-0 snap-start rounded-full px-5 py-2 font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 ${
            gen === g
              ? "bg-[#e3350d] text-white"
              : "bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-[#1c1f26] dark:text-slate-300 dark:hover:bg-white/10"
          }`}
        >
          {g === 0 ? t("gen.all") : `${t("gen.label").slice(0, 3)}. ${ROMAN[g]}`}
        </button>
      ))}
    </div>
  );
}

export function TypeChips({
  types,
  shiny,
  onToggle,
  onClear,
}: {
  types: string[];
  shiny: boolean;
  onToggle: (t: string) => void;
  onClear: () => void;
}) {
  const { t, typeName } = useI18n();
  return (
    <div role="group" aria-label={t("types.label")} className={scrollRow}>
      {typeColors.map((type) =>
        type === "All" ? (
          <Filter
            key="All"
            filterName="All"
            label={t("types.all")}
            filterColor="All"
            active={types.length === 0}
            changeFilter={onClear}
          />
        ) : (
          <Filter
            key={type}
            filterName={type}
            label={typeName(type)}
            filterColor={shiny ? `${type}_shiny` : type}
            active={types.includes(type)}
            changeFilter={onToggle}
          />
        ),
      )}
    </div>
  );
}

const SORTS: { key: SortKey; icon: string }[] = [
  { key: "number", icon: "#" },
  { key: "name", icon: "Az" },
  { key: "total", icon: "Σ" },
  { key: "weight", icon: "kg" },
  { key: "height", icon: "m" },
];

const SORT_HINTS: Record<"es" | "en", Record<SortKey, string>> = {
  es: {
    number: "Orden de la Pokédex nacional",
    name: "Alfabético",
    total: "Suma de las 6 stats base",
    weight: "Del más ligero al más pesado",
    height: "Del más bajo al más alto",
  },
  en: {
    number: "National Pokédex order",
    name: "Alphabetical",
    total: "Sum of the 6 base stats",
    weight: "Lightest to heaviest",
    height: "Shortest to tallest",
  },
};

/** Menú de orden propio (listbox accesible) + botón de dirección. */
export function SortControl({
  sort,
  dir,
  onSort,
  onDir,
}: {
  sort: SortKey;
  dir: SortDir;
  onSort: (s: SortKey) => void;
  onDir: (d: SortDir) => void;
}) {
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(() => SORTS.findIndex((o) => o.key === sort));
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const listId = useId();
  const current = SORTS.find((o) => o.key === sort) ?? SORTS[0];

  // Cerrar al pulsar fuera.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [open]);

  useEffect(() => {
    if (open) list.current?.focus();
  }, [open]);

  const openMenu = () => {
    setActive(SORTS.findIndex((o) => o.key === sort));
    setOpen(true);
  };

  const choose = (i: number) => {
    onSort(SORTS[i].key);
    setOpen(false);
    button.current?.focus();
  };

  const onListKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % SORTS.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + SORTS.length) % SORTS.length);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      choose(active);
    } else if (e.key === "Escape" || e.key === "Tab") {
      setOpen(false);
      button.current?.focus();
    }
  };

  const asc = dir === "asc";

  return (
    <div ref={root} className="relative flex items-center gap-2">
      <button
        ref={button}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            openMenu();
          }
        }}
        className={`flex h-[4.4rem] items-center gap-3 rounded-2xl bg-white/80 pl-2 pr-4 shadow-sm ring-1 backdrop-blur transition-[box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-white/[0.04] ${open ? "shadow-[0_0_0_4px_rgb(59_130_246/0.15)] ring-blue-500/60" : "ring-slate-200 hover:ring-slate-300 dark:ring-white/10 dark:hover:ring-white/20"}`}
      >
        <span className="grid size-10 place-items-center rounded-xl bg-blue-600 font-mono text-[1.3rem] font-bold text-white">
          {current.icon}
        </span>
        <span className="flex flex-col items-start leading-tight">
          <span className="text-[1.1rem] font-semibold uppercase tracking-wider text-slate-400">{t("sort.label")}</span>
          <span className="font-semibold text-slate-900 dark:text-white">{t(`sort.${current.key}`)}</span>
        </span>
        <svg viewBox="0 0 20 20" fill="currentColor" className={`size-5 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z" clipRule="evenodd" />
        </svg>
      </button>

      <button
        type="button"
        onClick={() => onDir(asc ? "desc" : "asc")}
        aria-label={t(asc ? "sort.asc" : "sort.desc")}
        title={t(asc ? "sort.asc" : "sort.desc")}
        className="grid size-[4.4rem] place-items-center rounded-2xl bg-white/80 text-slate-700 shadow-sm ring-1 ring-slate-200 transition-colors hover:ring-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-white/[0.04] dark:text-slate-200 dark:ring-white/10"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`size-7 transition-transform duration-300 ${asc ? "" : "-scale-y-100"}`} aria-hidden="true">
          <path d="M7 4v16M3 8l4-4 4 4" />
          <path d="M14 8h7M14 12h5M14 16h3" />
        </svg>
      </button>

      {open && (
        <ul
          ref={list}
          id={listId}
          role="listbox"
          tabIndex={-1}
          aria-label={t("sort.label")}
          aria-activedescendant={`${listId}-${active}`}
          onKeyDown={onListKey}
          className="absolute left-0 top-full z-40 mt-3 w-[30rem] origin-top-left animate-[pop_140ms_ease-out] rounded-2xl bg-white/95 p-2 shadow-[0_20px_50px_-12px_rgb(15_23_42/0.35)] outline-none ring-1 ring-slate-200 backdrop-blur-xl dark:bg-[#161a21]/95 dark:ring-white/10"
        >
          {SORTS.map((o, i) => {
            const selected = o.key === sort;
            return (
              <li
                key={o.key}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={selected}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(i)}
                className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${i === active ? "bg-slate-100 dark:bg-white/[0.07]" : ""}`}
              >
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-xl font-mono text-[1.3rem] font-bold ${selected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400"}`}
                >
                  {o.icon}
                </span>
                <span className="flex min-w-0 flex-1 flex-col leading-tight">
                  <span className="font-semibold text-slate-900 dark:text-white">{t(`sort.${o.key}`)}</span>
                  <span className="text-[1.2rem] text-slate-500 dark:text-slate-400">{SORT_HINTS[lang][o.key]}</span>
                </span>
                {selected && (
                  <svg viewBox="0 0 20 20" fill="currentColor" className="size-6 shrink-0 text-blue-600 dark:text-blue-400" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.58l7.3-7.3a1 1 0 0 1 1.4 0Z" clipRule="evenodd" />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function FavoritesToggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  const { t } = useI18n();
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => onChange(!on)}
      className={`flex items-center gap-2 rounded-full px-4 py-2 font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 ${
        on ? "bg-amber-400 text-amber-950" : "bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-[#1c1f26] dark:text-slate-300 dark:hover:bg-white/10"
      }`}
    >
      <span aria-hidden="true">{on ? "★" : "☆"}</span> {t("favorites.only")}
    </button>
  );
}
