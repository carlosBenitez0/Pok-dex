interface Props {
  sortOrDisorder: () => void;
  normalShiny: string;
  checked: boolean;
}

export const CheckboxOrder = ({
  sortOrDisorder,
  normalShiny,
  checked,
}: Props) => {
  return (
    <div className="flex items-center">
      <input
        id="checked-checkbox"
        type="checkbox"
        checked={checked}
        onChange={sortOrDisorder}
        className={`h-6 w-6 cursor-pointer rounded border-gray-300 bg-gray-100 text-blue-600 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600 ${normalShiny === "SHINY" ? "shadow-[0_0_10px_blue] dark:shadow-[0_0_10px_2px_blue]" : ""}`}
      />
      <label
        htmlFor="checked-checkbox"
        className={`ml-2 cursor-pointer font-bold uppercase ${normalShiny === "SHINY" ? "bg-gradient-to-r from-blue-400 to-blue-800 bg-clip-text text-transparent text-shadow-lg dark:from-blue-600 dark:via-blue-800 dark:to-transparent dark:bg-[length:100%_90%]" : "dark:text-gray-300"}`}
      >
        {checked ? "Sorted" : "disordered"}
      </label>
    </div>
  );
};
