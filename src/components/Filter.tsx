import "../css/Filters.css";

type Props = {
  filterName: string;
  filterColor: string;
  onClick: (filterName: string) => void;
};

function Filter({ filterName, filterColor, onClick }: Props) {
  return (
    <div
      className={`filter ${filterColor} shadow-[0_0.4rem_1.5rem_rgba(0,0,0,0.219)] bg-[#ececec]  dark:text-[#0e1217]`}
      onClick={() => onClick(filterName)}
    >
      <p className="filter-text">{filterName.split("_")[0].toUpperCase()}</p>
    </div>
  );
}

export default Filter;
