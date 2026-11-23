import { typeColors } from "../constants/constants";
import { useI18n } from "../i18n";
import type { SortDir, SortKey } from "../lib/filter";
import { ROMAN } from "../utils/format";
import Filter from "./Filter";

const scrollRow =
  "no-scrollbar -mx-4 flex snap-x items-center gap-3 overflow-x-auto px-4 py-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0";

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

const SORTS: SortKey[] = ["number", "name", "total", "weight", "height"];

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
  const { t } = useI18n();
  return (
    <div className="flex items-center gap-3">
      <label htmlFor="sort" className="font-bold text-slate-900 dark:text-slate-200">
        {t("sort.label").toUpperCase()}
      </label>
      <div className="flex items-center rounded-full bg-slate-200 p-1 dark:bg-[#1c1f26]">
        <select
          id="sort"
          value={sort}
          onChange={(e) => onSort(e.target.value as SortKey)}
          className="cursor-pointer appearance-none rounded-full bg-transparent py-1.5 pl-4 pr-2 font-semibold text-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-slate-100 [&>option]:text-slate-900"
        >
          {SORTS.map((s) => (
            <option key={s} value={s}>
              {t(`sort.${s}`)}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => onDir(dir === "asc" ? "desc" : "asc")}
          aria-label={t(dir === "asc" ? "sort.asc" : "sort.desc")}
          title={t(dir === "asc" ? "sort.asc" : "sort.desc")}
          className="grid size-10 place-items-center rounded-full bg-blue-600 font-bold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        >
          {dir === "asc" ? "↑" : "↓"}
        </button>
      </div>
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
