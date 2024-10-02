import { useEffect, useState } from "react";
import axios from "axios";
import { IResponse } from "../interfaces/IResponse";

export const usePokemonData = () => {
  const [pokemonData, setPokemonData] = useState<(IResponse | null)[]>([]);
  const [loader, setLoader] = useState(true);

  const getPokemonData = async (id: number): Promise<IResponse | null> => {
    const endPoint: string = `https://pokeapi.co/api/v2/pokemon-form/${id}/`;
    try {
      const response = await axios.get(endPoint);
      return response.data;
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  useEffect(() => {
    const getAllPokemon = async (): Promise<void> => {
      const promises = [];
      for (let i = 1; i <= 151; i++) {
        promises.push(getPokemonData(i));
      }
      const results = await Promise.all(promises);

      setPokemonData(results);
      setLoader(false);
    };

    getAllPokemon();
  }, []);

  return { pokemonData, loader };
};
