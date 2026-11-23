type PropsToggleFrontBackCard = {
  changeFrontFunction: () => void;
  isNormal: boolean;
  isFront: boolean;
  idPokemonFront: string;
};

const ToggleFrontBackCard = ({
  changeFrontFunction,
  isFront,
  isNormal,
  idPokemonFront,
}: PropsToggleFrontBackCard) => {
  return (
    <div className="toggle-card flex items-center gap-3">
      <input
        onChange={changeFrontFunction}
        checked={!isFront}
        type="checkbox"
        id={idPokemonFront}
        className="peer sr-only"
      />

      <label
        htmlFor={idPokemonFront}
        className={`relative order-2 flex h-6 w-16 cursor-pointer items-center rounded-full bg-green-600 indent-[-9999px] after:absolute after:left-2 after:h-3 after:w-6 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-blue-500 ${!isFront ? "after:left-[calc(100%-0.5rem)] after:translate-x-[-100%]" : ""} ${!isNormal ? "bg-gradient-to-r from-charizard-shiny-red to-metagross-shiny-gold shadow-md shadow-slate-800 after:bg-gradient-to-r after:from-metagross-normal-gray-blue after:to-metagross-shiny-silver" : ""}`}
      >
        Front / Back
      </label>
      <p
        className={`order-1 font-bold ${!isNormal ? "bg-gradient-to-r from-[#F04038] to-[#F8D030] bg-clip-text text-transparent text-shadow-lg" : ""}`}
      >
        {isFront ? "FRONT" : "BACK"}
      </p>
    </div>
  );
};

export default ToggleFrontBackCard;
