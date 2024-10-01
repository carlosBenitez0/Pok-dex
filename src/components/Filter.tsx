import "../css/Filters.css";

type Props = {
  filterName: string;
  filterColor: string;
  selectedFilter: string;
  changeFilter: (filterName: string) => void;
};

function Filter({
  filterName,
  filterColor,
  selectedFilter,
  changeFilter,
}: Props) {
  return (
    <div
      className={`user-none flex cursor-pointer items-center rounded-full bg-[#ececec] px-6 py-3 font-medium shadow-[0_0.4rem_1.5rem_rgba(0,0,0,0.219)] hover:scale-110 dark:text-[#0e1217] ${selectedFilter == filterName ? "transform bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-[0.3rem_0.3rem_0.1rem_#000000] dark:text-white dark:shadow-[0.3rem_0.3rem_0.1rem_#00ffff]" : filterColor}`}
      onClick={() => changeFilter(filterName)}
    >
      <p className="filter-text">{filterName.split("_")[0].toUpperCase()}</p>
    </div>
  );
}

export default Filter;
