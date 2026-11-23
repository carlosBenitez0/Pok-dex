type PropsToggleCard = {
  changeTypeFunction: () => void;
  isNormal: boolean;
  idPokemon: string;
};

const ToggleCard = ({
  changeTypeFunction,
  isNormal,
  idPokemon,
}: PropsToggleCard) => {
  return (
    <div
      className={`toggle-card flex items-center gap-3 ${
        !isNormal
          ? "bg-gradient-to-r from-[#36403E] to-[#F04038] bg-clip-text text-transparent"
          : ""
      }`}
    >
      <input
        onChange={changeTypeFunction}
        checked={!isNormal}
        type="checkbox"
        id={idPokemon}
        className="peer sr-only"
      />
      <label
        htmlFor={idPokemon}
        className={`relative order-2 flex h-6 w-16 cursor-pointer items-center rounded-full bg-orange-500 indent-[-9999px] after:absolute after:left-2 after:h-3 after:w-6 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-blue-500 ${!isNormal ? "bg-gradient-to-r from-charizard-shiny-black to-charizard-shiny-red shadow-md shadow-slate-800 after:left-[calc(100%-0.5rem)] after:translate-x-[-100%] after:bg-gradient-to-r after:from-metagross-normal-gray-blue after:to-metagross-shiny-silver" : ""}`}
      >
        Normal / Shiny
      </label>
      <p className={`order-1 font-bold ${!isNormal ? "text-shadow-lg" : ""}`}>
        {isNormal ? "NORMAL" : "SHINY"}
      </p>
    </div>
  );
};

export default ToggleCard;
