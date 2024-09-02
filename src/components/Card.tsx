import Filter from "./Filter";
import "../css/Card.css";

type Props = {
  id: number;
  image: string;
  name: string;
  filters: string[];
  onFilterClick: (filter: string) => void;
};

function Card({ id, image, name, filters, onFilterClick }: Props) {
  function addZeros(id: number): string {
    let newId = "";

    if (id.toString().length === 1) {
      newId = "00" + id.toString();
    } else if (id.toString().length === 2) {
      newId = "0" + id.toString();
    } else {
      newId = id.toString();
    }
    return newId;
  }

  return (
    <div className="card">
      <div className="card-header">
        <p className="poke-id-bg">#{addZeros(id)}</p>
        <img src={image} alt={name} />
      </div>
      <div className="card-body">
        <div className="card-body-info">
          <p className="poke-info">#{addZeros(id)}</p>
          <p className="poke-info">{name}</p>
        </div>
        <div className="card-body-filters">
          {filters.map((filter) => (
            <Filter
              key={filter}
              filterColor={filter}
              filterName={filter}
              onClick={onFilterClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Card;
