import { useState } from "react";

interface Props {
  onSearchChange: (value: string) => void;
}

const Search = ({ onSearchChange }: Props) => {
  const [focus, setFocus] = useState(false);
  const [search, setSearch] = useState("");

  const update = (value: string) => {
    setSearch(value);
    onSearchChange(value);
  };

  return (
    <form
      id="search-form"
      role="search"
      onSubmit={(event) => event.preventDefault()}
      className={`flex w-full min-w-0 items-center rounded-3xl bg-slate-200 dark:bg-[#1c1f26] dark:text-slate-200 ${focus ? "outline outline-2 outline-slate-500" : ""}`}
    >
      <span
        className={`flex items-center justify-center px-4 py-3 text-slate-400 ${focus ? "text-slate-600 dark:text-slate-200" : ""}`}
        aria-hidden="true"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="size-9"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
      </span>

      <label htmlFor="search" className="sr-only">
        Buscar Pokémon
      </label>
      <input
        className="w-full min-w-0 appearance-none bg-transparent py-3 outline-none [&::-webkit-search-cancel-button]:hidden"
        id="search"
        type="search"
        placeholder="Search by name, number or type"
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        onChange={(e) => update(e.target.value)}
        value={search}
        autoComplete="off"
      />

      <button
        type="button"
        onClick={() => update("")}
        aria-label="Borrar búsqueda"
        className={`flex items-center justify-center p-3 text-slate-500 dark:text-slate-300 ${search.length > 0 ? "visible" : "invisible"}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="size-10"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>
    </form>
  );
};

export default Search;
