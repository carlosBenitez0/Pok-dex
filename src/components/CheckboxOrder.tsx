interface Props {
  sortOrDisorder: () => void;
  normalShiny: string;
  checked: boolean; // true = A-Z, false = por número
}

const OPTIONS = [
  { sorted: false, label: "Nº", title: "Ordenar por número" },
  { sorted: true, label: "A-Z", title: "Ordenar alfabéticamente" },
];

/** Control segmentado Nº / A-Z (sustituye al checkbox "sorted/disordered"). */
export const CheckboxOrder = ({ sortOrDisorder, normalShiny, checked }: Props) => {
  const shiny = normalShiny === "SHINY";

  return (
    <div className="flex items-center gap-3">
      <span
        id="sort-label"
        className={`font-bold text-slate-900 dark:text-slate-200 ${shiny ? "text-shadow-lg dark:[text-shadow:0_0_8px_rgb(59_130_246/0.6)]" : ""}`}
      >
        ORDEN
      </span>
      <div
        role="radiogroup"
        aria-labelledby="sort-label"
        className={`relative grid grid-cols-2 rounded-full p-1 ${shiny ? "bg-gradient-to-r from-charizard-shiny-black to-[#1e3a8a] shadow-md shadow-slate-800" : "bg-slate-200 dark:bg-[#1c1f26]"}`}
      >
        {/* Pastilla deslizante */}
        <span
          aria-hidden="true"
          className={`absolute inset-y-1 left-1 w-[calc(50%-0.4rem)] rounded-full shadow transition-transform duration-200 ease-out motion-reduce:transition-none ${checked ? "translate-x-full" : "translate-x-0"} ${shiny ? "bg-gradient-to-r from-metagross-normal-gray-blue to-metagross-shiny-silver" : "bg-blue-600"}`}
        />
        {OPTIONS.map((o) => {
          const active = checked === o.sorted;
          return (
            <button
              key={o.label}
              type="button"
              role="radio"
              aria-checked={active}
              title={o.title}
              onClick={() => {
                if (!active) sortOrDisorder();
              }}
              className={`relative z-10 min-w-[4.4rem] rounded-full px-4 py-1.5 text-[1.3rem] font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${active ? (shiny ? "text-slate-900" : "text-white") : shiny ? "text-slate-300" : "text-slate-500 dark:text-slate-400"}`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
