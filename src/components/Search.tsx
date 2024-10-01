import { useRef, useState } from "react";

const styles = {
  WebkitAppearance: "none",
  appearance: "none",
};

interface props {
  onSearchChange: (value: string) => void;
}
const Search = ({ onSearchChange }: props) => {
  const [focus, setFocus] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFocus = () => {
    setFocus(true);
  };

  // Manejador cuando el input pierde el foco
  const handleBlur = () => {
    if (search?.length > 0) {
      setFocus(false);
    }
  };

  const handleChange = () => {
    const value = inputRef.current?.value;
    if (value != undefined) {
      setSearch(value);
      onSearchChange(value);
    }
  };

  const deleteText = () => {
    if (inputRef.current != null) {
      inputRef.current.value = "";
      setSearch("");
      onSearchChange("");
      setFocus(false);
    }
  };

  return (
    <form
      id="search-form"
      onSubmit={(event) => event.preventDefault()}
      className={`flex w-full items-center rounded-3xl bg-slate-200 outline-none dark:bg-[#1c1f26] dark:text-slate-200 ${focus ? "outline outline-slate-500" : ""}`}
    >
      <div className="flex w-full items-center rounded-3xl">
        <button
          type="submit"
          className={`flex items-center justify-center rounded-l-3xl px-4 py-3 text-slate-400 ${focus ? "text-slate-600 dark:text-slate-200" : ""}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            className="min-h-9 min-w-9"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
        </button>

        <input
          className={`bg-transparent py-3 ${styles} w-full outline-none ${focus ? "text-slate-600 dark:text-slate-200" : ""}`}
          id="search"
          type="text"
          placeholder="Bulbasaur, Ivysaur, Venusaur..."
          ref={inputRef}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          value={search}
          autoComplete="off"
        />
        <div className="flex items-center justify-center rounded-r-3xl p-3 text-slate-500 dark:text-slate-300">
          <div className="h-10 w-10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              className={`size-10 cursor-pointer ${search.length > 0 ? "block" : "hidden"}`}
              onClick={deleteText}
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>
      </div>
    </form>
  );
};

export default Search;
