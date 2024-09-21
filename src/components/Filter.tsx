import "../css/Filters.css";

type Props = {
  filterName: string;
  filterColor: string;
  onClick: (filterName: string) => void;
};

function Filter({ filterName, filterColor, onClick }: Props) {
  return (
    <div
      className={`cursor-pointer rounded-full px-6 py-3 font-medium transition duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 ${filterColor} bg-[#ececec] shadow-[0_0.4rem_1.5rem_rgba(0,0,0,0.219)] dark:text-[#0e1217]`}
      onClick={() => onClick(filterName)}
    >
      <p className="filter-text">{filterName.split("_")[0].toUpperCase()}</p>
    </div>
  );
}

export default Filter;
