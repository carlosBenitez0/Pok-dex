import { useEffect, useState } from "react";

/** useState persistido en localStorage (JSON). Tolera storage bloqueado. */
export function usePersistentState<T>(key: string, initial: T, isValid?: (v: unknown) => v is T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return initial;
      const parsed = JSON.parse(raw);
      return !isValid || isValid(parsed) ? parsed : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage no disponible */
    }
  }, [key, value]);

  return [value, setValue] as const;
}
