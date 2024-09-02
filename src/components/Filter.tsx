import "../css/Filters.css";

type Props = {
  filterName: string;
  filterColor: string;
  onClick: (filterName: string) => void;
};

function Filter({ filterName, filterColor, onClick }: Props) {
  return (
    <div
      className={`filter ${filterColor}`}
      onClick={() => onClick(filterName)}
    >
      <p className={"filter-text"}>{filterName.toUpperCase()}</p>
    </div>
  );
}

export default Filter;
