type Props = {
  onClic: () => void;
  typeOfPokemon: string;
};

const Toggle = ({ onClic, typeOfPokemon }: Props) => {
  const isShiny = typeOfPokemon !== "NORMAL";

  return (
    <div
      className={`flex items-center gap-2 font-bold ${
        isShiny
          ? "bg-gradient-to-r from-charizard-shiny-black to-charizard-shiny-red bg-clip-text text-transparent dark:from-slate-200 dark:to-charizard-shiny-red"
          : ""
      }`}
    >
      <input
        onChange={onClic}
        checked={isShiny}
        type="checkbox"
        id="switch-normal-shiny"
        className="peer sr-only"
      />

      <label
        htmlFor="switch-normal-shiny"
        className={`relative order-2 flex h-6 w-[50px] cursor-pointer items-center rounded-full bg-orange-500 indent-[-9999px] shadow-md after:absolute after:left-2 after:h-3 after:w-8 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-blue-500 ${
          isShiny
            ? "bg-gradient-to-r from-charizard-shiny-red to-charizard-shiny-black shadow-md shadow-slate-800 after:left-[calc(100%-0.5rem)] after:translate-x-[-100%] after:bg-gradient-to-r after:from-metagross-normal-gray-blue after:to-metagross-shiny-silver"
            : ""
        }`}
      >
        Normal / Shiny
      </label>

      <p
        className={`order-1 font-bold ${!isShiny ? "dark:text-slate-300" : "text-shadow-lg"}`}
      >
        {typeOfPokemon}
      </p>
    </div>
  );
};

export default Toggle;
