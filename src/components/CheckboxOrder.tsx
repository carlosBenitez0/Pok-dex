import { useEffect, useRef } from "react";

interface props {
  sortOrDisorder: () => void;
  normalShiny: string;
  checked: boolean;
}

export const CheckboxOrder = ({
  sortOrDisorder,
  normalShiny,
  checked,
}: props) => {
  const checkboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (checkboxRef.current) {
      if (checked) {
        checkboxRef.current.checked = false;
      } else {
        checkboxRef.current.checked = true;
      }
    }
  }, [checked]);

  return (
    <div className="flex items-center">
      <input
        id="checked-checkbox"
        type="checkbox"
        ref={checkboxRef}
        onClick={sortOrDisorder}
        className={`h-6 w-6 rounded border-gray-300 bg-gray-100 text-blue-600 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600 ${normalShiny === "SHINY" ? "shadow-[0_0_10px_blue] dark:shadow-[0_0_10px_2px_blue]" : ""}`}
      />
      <label
        htmlFor="checked-checkbox"
        className={`ml-2 font-bold uppercase ${normalShiny === "SHINY" ? "bg-gradient-to-r from-blue-400 to-blue-800 bg-clip-text text-transparent text-shadow-lg dark:from-blue-600 dark:via-blue-800 dark:to-transparent dark:bg-[length:100%_90%]" : "dark:text-gray-300"}`}
      >
        {!checked ? "Sorted" : "disordered"}
      </label>
    </div>
  );
};
