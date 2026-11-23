import { useEffect, useState } from "react";
import { IResponse } from "../interfaces/IResponse";
import { API, fetchJson } from "../api/pokeapi";

export const TOTAL_POKEMON = 151;

// Resultado compartido entre montajes: al volver del detalle no hay loader.
let cachedList: (IResponse | null)[] | null = null;

const getPokemonData = async (id: number): Promise<IResponse | null> => {
  try {
    return await fetchJson<IResponse>(`${API}/pokemon-form/${id}/`, true);
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const usePokemonData = () => {
  const [pokemonData, setPokemonData] = useState<(IResponse | null)[]>(
    () => cachedList ?? [],
  );
  const [loader, setLoader] = useState(cachedList === null);

  useEffect(() => {
    if (cachedList) return;
    let cancelled = false;
    const ids = Array.from({ length: TOTAL_POKEMON }, (_, i) => i + 1);
    Promise.all(ids.map(getPokemonData)).then((results) => {
      cachedList = results;
      if (cancelled) return;
      setPokemonData(results);
      setLoader(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { pokemonData, loader };
};
