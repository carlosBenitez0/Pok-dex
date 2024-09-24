import { useEffect, useRef } from "react";
import "../css/Toggle.css";

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
/*-----------------------------------------------------------------------*/
type PropsToggleFrontBack = {
  onClic: () => void;
  frontBack: string;
  normalShiny: string;
};

export const ToggleFrontBack = ({
  onClic,
  frontBack,
  normalShiny,
}: PropsToggleFrontBack) => {
  const toggleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (toggleRef.current) {
      toggleRef.current.checked = frontBack === "FRONT" ? false : true;
    }
  }, [frontBack]);

  return (
    <div className={`flex items-center gap-3`}>
      <input
        onClick={onClic}
        type="checkbox"
        id="frontBack"
        className="peer hidden h-0 w-0"
        ref={toggleRef}
      />

      <label
        htmlFor="frontBack"
        className={`relative order-2 flex h-6 w-[50px] cursor-pointer items-center rounded-full bg-green-600 indent-[-9999px] shadow-[0_0_.5rem_0_rgba(255,215,0,.5)] after:absolute after:left-2 after:h-3 after:w-8 after:rounded-full after:bg-white after:content-[''] dark:shadow-[0_0_1rem_0_rgba(0,0,255,1)] ${normalShiny !== "NORMAL" ? "dark:shadow-[0_0_1rem_0_rgba bg-gradient-to-r from-charizard-shiny-red to-metagross-shiny-gold after:bg-gradient-to-r after:from-metagross-normal-gray-blue after:to-metagross-shiny-silver" : ""} ${toggleRef.current?.checked ? "after:left-[calc(100%-0.5rem)] after:translate-x-[-100%]" : ""}`}
      ></label>

      <p
        className={`order-1 font-bold ${normalShiny !== "NORMAL" ? "bg-gradient-to-r from-[#F04038] to-[#F8D030] bg-clip-text text-transparent" : "dark:text-slate-300"}`}
      >
        {frontBack.toUpperCase()}
      </p>
    </div>
  );
};
/*-----------------------------------------------------------------------*/
type PropsToggleCard = {
  changeTypeFunction: () => void;
  isNormal: boolean;
  idPokemon: string;
};

export const ToggleCard = ({
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

/*-----------------------------------------------------------------------*/
type PropsToggleFrontBackCard = {
  changeFrontFunction: () => void;
  isNormal: boolean;
  isFront: boolean;
  idPokemonFront: string;
};

export const ToggleFrontBackCard = ({
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
        className={`relative order-2 flex h-6 w-[50px] cursor-pointer items-center rounded-full bg-green-600 indent-[-9999px] after:absolute after:left-2 after:h-3 after:w-8 after:rounded-full after:bg-white after:content-[''] ${!isFront ? "after:left-[calc(100%-0.5rem)] after:translate-x-[-100%]" : ""} ${!isNormal ? "bg-gradient-to-r from-charizard-shiny-red to-metagross-shiny-gold shadow-[0_0_1rem_0_rgba(0,0,255,1)] after:bg-gradient-to-r after:from-metagross-normal-gray-blue after:to-metagross-shiny-silver" : ""} `}
      ></label>
      <p
        className={`order-1 font-bold ${!isNormal ? "bg-gradient-to-r from-[#F04038] to-[#F8D030] bg-clip-text text-transparent" : ""}`}
      >
        {isFront === true ? "FRONT" : "BACK"}
      </p>
    </div>
  );
};

export default Toggle;
