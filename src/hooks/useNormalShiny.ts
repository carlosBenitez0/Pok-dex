import { useEffect, useState } from "react";
import { typeColors, typeColorsShiny } from "../constants/constants";

export const useNormalShiny = () => {
  const [normalShiny, setNormalShiny] = useState<string>(() => {
    const normalShinyStorage = window.localStorage.getItem("normalShiny");
    console.log(normalShinyStorage);
    try {
      return normalShinyStorage ? JSON.parse(normalShinyStorage) : "NORMAL";
    } catch (error) {
      console.error("Error parsing normalShiny from localStorage:", error);
      return "NORMAL"; // Valor por defecto en caso de error ya que no se puede leer un json que es undefined
    }
  });

  useEffect(() => {
    // Actualizar localStorage cuando normalShiny cambie
    window.localStorage.setItem("normalShiny", JSON.stringify(normalShiny));
  }, [normalShiny]);

  const changeNormalShiny = () => {
    setNormalShiny((prev) => (prev === "NORMAL" ? "SHINY" : "NORMAL"));
  };

  const filtersNormalShiny =
    normalShiny === "NORMAL" ? typeColors : typeColorsShiny;

  return { normalShiny, changeNormalShiny, filtersNormalShiny };
};
