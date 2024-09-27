import { useEffect, useRef } from "react";

type Props = {
  onClic: () => void;
  typeOfPokemon: string;
};

const Toggle = ({ onClic, typeOfPokemon }: Props) => {
  const toggleRef = useRef<HTMLInputElement>(null);

  // Actualizando el estado del input
  useEffect(() => {
    if (toggleRef.current) {
      /* El estado inicial es true porque manejo true si es normal
      pero el checkbox debe ser false al inicio asi que lo niego */
      toggleRef.current.checked = typeOfPokemon !== "NORMAL" ? true : false;
    }
  }, [typeOfPokemon]);

  return (
    <div
      className={`flex items-center gap-2 font-bold ${
        typeOfPokemon === "SHINY"
          ? "bg-gradient-to-r from-charizard-shiny-black to-charizard-shiny-red bg-clip-text text-transparent"
          : ""
      }`}
    >
      <input
        onClick={onClic}
        type="checkbox"
        id="switch"
        ref={toggleRef}
        className="hidden h-0 w-0"
      />

      <label
        htmlFor="switch"
        className={`after:top-2/7 relative order-2 flex h-6 w-[50px] cursor-pointer items-center rounded-full bg-orange-500 indent-[-9999px] shadow-[0_0_.5rem_0_rgba(255,215,0,.5)] after:absolute after:left-2 after:h-3 after:w-8 after:rounded-full after:bg-white after:content-[''] dark:shadow-[0_0_1rem_0_rgba(0,0,255,1)] ${
          typeOfPokemon === "SHINY"
            ? "bg-gradient-to-r from-charizard-shiny-red to-charizard-shiny-black"
            : ""
        } ${
          toggleRef.current?.checked
            ? "after:left-[calc(100%-0.5rem)] after:translate-x-[-100%] after:bg-gradient-to-r after:from-metagross-normal-gray-blue after:to-metagross-shiny-silver"
            : ""
        }`}
      ></label>

      <p
        className={`order-1 font-bold ${typeOfPokemon !== "SHINY" ? "dark:text-slate-300" : ""}`}
      >
        {typeOfPokemon}
      </p>
    </div>
  );
};

export default Toggle;
