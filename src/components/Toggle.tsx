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
        typeOfPokemon === "SHINY" ? "toggle-container-input-checked" : ""
      }`}
    >
      <input
        onClick={onClic}
        type="checkbox"
        id="switch"
        ref={toggleRef}
        className="hidden h-0 w-0"
      />
      {/*      label {
    cursor: pointer;
    text-indent: -9999px;
    width: 50px;
    height: 25px;
    background: var(--charizard-normal-orange);
    display: flex;
    align-items: center;
    border-radius: 100px;
    position: relative;
    order: 2;
} */}
      <label htmlFor="switch"></label>

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
    <div
      className={`flex items-center gap-3 ${
        normalShiny === "NORMAL" ? "toggle-back-normal" : "toggle-front-back"
      }`}
    >
      <input
        onClick={onClic}
        type="checkbox"
        id="frontBack"
        className="peer hidden h-0 w-0"
        ref={toggleRef}
      />
      <label
        htmlFor="frontBack"
        className={`flex items-center ${normalShiny === "SHINY" ? "toggleIsShinyLA" : ""}`}
      ></label>
      <p className="order-1 font-bold dark:text-slate-300">
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
        !isNormal ? "toggle-container-input-checked" : ""
      }`}
    >
      <input
        ref={toggleRef}
        onClick={changeTypeFunction}
        type="checkbox"
        id={idPokemon}
        className="hidden h-0 w-0"
      />
      <label htmlFor={idPokemon}></label>
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
    <div
      className={`toggle-card flex gap-3 ${
        isNormal === true ? "toggle-back-normal" : "toggle-front-back"
      }`}
    >
      <input
        onClick={changeFrontFunction}
        type="checkbox"
        id={idPokemonFront}
        ref={toggleRef}
        className="hidden h-0 w-0"
      />
      <label
        htmlFor={idPokemonFront}
        className={!isNormal ? "toggleIsShinyLA" : ""}
      ></label>
      <p className="order-1 font-bold">{isFront === true ? "FRONT" : "BACK"}</p>
    </div>
  );
};

export default Toggle;
