import { useRef, useEffect } from "react";

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
  const toggleRef = useRef<HTMLInputElement>(null);

  // Actualizando el estado del input
  useEffect(() => {
    if (toggleRef.current) {
      /* El estado inicial es true porque manejo true si es normal
        pero el checkbox debe ser false al inicio asi que lo niego */
      toggleRef.current.checked = !isNormal;
    }
  }, [isNormal]);

  return (
    <div
      className={`toggle-card flex gap-3 ${
        !isNormal
          ? "bg-gradient-to-r from-[#36403E] to-[#F04038] bg-clip-text text-transparent"
          : ""
      }`}
    >
      <input
        ref={toggleRef}
        onClick={changeTypeFunction}
        type="checkbox"
        id={idPokemon}
        className="hidden h-0 w-0"
      />
      <label
        htmlFor={idPokemon}
        className={`relative order-2 flex h-6 w-20 cursor-pointer items-center rounded-full bg-orange-500 indent-[-9999px] after:absolute after:left-2 after:h-3 after:w-8 after:rounded-full after:bg-white after:content-[''] ${!isNormal ? "bg-gradient-to-r from-charizard-shiny-black to-charizard-shiny-red shadow-[0_0_1rem_0_rgba(0,0,255,1)] after:left-[calc(100%-0.5rem)] after:translate-x-[-100%] after:bg-gradient-to-r after:from-metagross-normal-gray-blue after:to-metagross-shiny-silver" : ""} `}
      ></label>
      <p className="order-1 font-bold">{isNormal ? "NORMAL" : "SHINY"}</p>
    </div>
  );
};

export default ToggleCard;
