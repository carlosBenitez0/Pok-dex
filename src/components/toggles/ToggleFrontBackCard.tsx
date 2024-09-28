import { useEffect, useRef } from "react";

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
  const toggleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (toggleRef.current) {
      //Al inicio es true el isFront poque los pokemon tienen el estado inicial front, lo negamos para que el check sea false al inicio
      toggleRef.current.checked = !isFront;
    }
  }, [isFront]);

  return (
    <div className={`toggle-card flex gap-3`}>
      <input
        onClick={changeFrontFunction}
        type="checkbox"
        id={idPokemonFront}
        ref={toggleRef}
        className="hidden h-0 w-0"
      />

      <label
        htmlFor={idPokemonFront}
        className={`relative order-2 flex h-6 w-[50px] cursor-pointer items-center rounded-full bg-green-600 indent-[-9999px] after:absolute after:left-2 after:h-3 after:w-8 after:rounded-full after:bg-white after:content-[''] ${!isFront ? "after:left-[calc(100%-0.5rem)] after:translate-x-[-100%]" : ""} ${!isNormal ? "bg-gradient-to-r from-charizard-shiny-red to-metagross-shiny-gold shadow-md shadow-slate-800 after:bg-gradient-to-r after:from-metagross-normal-gray-blue after:to-metagross-shiny-silver" : ""} `}
      ></label>
      <p
        className={`order-1 font-bold ${!isNormal ? "bg-gradient-to-r from-[#F04038] to-[#F8D030] bg-clip-text text-transparent text-shadow-lg" : ""}`}
      >
        {isFront === true ? "FRONT" : "BACK"}
      </p>
    </div>
  );
};

export default ToggleFrontBackCard;
