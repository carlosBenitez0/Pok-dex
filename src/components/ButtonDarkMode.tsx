import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const readInitialTheme = (): Theme => {
  try {
    const stored = window.localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* storage no disponible */
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

function ButtonDarkMode() {
  const [currentTheme, setCurrentTheme] = useState<Theme>(readInitialTheme);

  const toggleTheme = () => {
    const next: Theme = currentTheme === "light" ? "dark" : "light";
    setCurrentTheme(next);
    try {
      window.localStorage.setItem("theme", next);
    } catch {
      /* storage no disponible */
    }
  };

  // Sigue al sistema solo si el usuario no eligió un tema manualmente.
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleThemeChange = (e: MediaQueryListEvent) => {
      try {
        if (window.localStorage.getItem("theme")) return;
      } catch {
        /* sin storage: seguimos al sistema */
      }
      setCurrentTheme(e.matches ? "dark" : "light");
    };
    mediaQuery.addEventListener("change", handleThemeChange);
    return () => mediaQuery.removeEventListener("change", handleThemeChange);
  }, []);

  useEffect(() => {
    document
      .querySelector("#root")
      ?.classList.toggle("dark", currentTheme === "dark");
  }, [currentTheme]);

  const isLight = currentTheme === "light";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isLight ? "Activar modo oscuro" : "Activar modo claro"}
      className="flex shrink-0 cursor-pointer items-center rounded-full bg-[#233b53] p-2 hover:bg-[#2c3e70] focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 dark:bg-[#444444] dark:hover:bg-[#666666]"
    >
      {isLight ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="url(#blueGradient)"
          className="size-12"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1E90FF" />
              <stop offset="100%" stopColor="#00BFFF" />
            </linearGradient>
          </defs>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="url(#goldGradient)"
          className="size-12"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFD700" />
              <stop offset="100%" stopColor="#FFA500" />
            </linearGradient>
          </defs>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
          />
        </svg>
      )}
    </button>
  );
}

export default ButtonDarkMode;
