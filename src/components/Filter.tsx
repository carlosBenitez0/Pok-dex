import "../css/Filters.css";

type Props = {
  /** Clave del tipo ("fire") o "All". */
  filterName: string;
  /** Texto visible (ya traducido). */
  label: string;
  /** Clase de color: "fire" o "fire_shiny". */
  filterColor: string;
  active: boolean;
  changeFilter: (filterName: string) => void;
  size?: "md" | "sm";
};

function Filter({ filterName, label, filterColor, active, changeFilter, size = "md" }: Props) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={`flex shrink-0 cursor-pointer select-none snap-start items-center rounded-full bg-[#ececec] font-medium shadow-[0_0.4rem_1.5rem_rgba(0,0,0,0.219)] transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:text-[#0e1217] ${size === "sm" ? "px-4 py-1.5 text-[1.3rem]" : "px-6 py-3"} ${active ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-[0.3rem_0.3rem_0.1rem_#000000] dark:text-white dark:shadow-[0.3rem_0.3rem_0.1rem_#00ffff]" : `type-${filterColor}`}`}
      onClick={() => changeFilter(filterName)}
    >
      <span className="filter-text">{label.toUpperCase()}</span>
    </button>
  );
}

export default Filter;
