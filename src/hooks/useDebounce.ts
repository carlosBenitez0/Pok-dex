import { useState, useEffect } from "react";

export function useDebounce(search: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(search);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(search);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [search, delay]);

  return debouncedValue;
}
