import { useEffect, useState } from "react";

type Props = {};

function ButtonDarkMode({}: Props) {
  const [theme, setTheme] = useState<string>(() => {
    if (window.matchMedia(`(prefers-color-scheme: dark)`).matches) {
      return "dark";
    }
    return "light";
  });

  const changeTheme = (): void => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  /* useEffect(() => {
    theme === "dark"
      ? document.querySelector(".main-container")?.classList.add("dark")
      : document.querySelector(".main-container")?.classList.remove("dark");
  }, [theme]); */

  //Verificar el thema del dispositivo y escuchar los cambios
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleThemeChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleThemeChange);

    return () => {
      mediaQuery.removeEventListener("change", handleThemeChange);
    };
  }, []);

  useEffect(() => {
    if (theme === "dark") {
      document.querySelector("#root")?.classList.add("dark");
    } else {
      document.querySelector("#root")?.classList.remove("dark");
    }
  }, [theme]);

  return (
    <div
      className="text-gradient-to-r flex cursor-pointer items-center rounded-full bg-[#444444] from-cyan-500 to-blue-500 p-2 hover:bg-[#666666] dark:bg-[#2c3e50] dark:hover:bg-[#2c3e70]"
      onClick={changeTheme}
    >
      {theme === "light" ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="url(#goldGradient)" // Gradiente dorado
          className="size-10"
        >
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop
                offset="0%"
                style={{ stopColor: "#FFD700", stopOpacity: 1 }}
              />{" "}
              {/* Oro */}
              <stop
                offset="100%"
                style={{ stopColor: "#FFA500", stopOpacity: 1 }}
              />{" "}
              {/* Naranja */}
            </linearGradient>
          </defs>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="url(#blueGradient)" // Gradiente azul
          className="size-10"
        >
          <defs>
            <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop
                offset="0%"
                style={{ stopColor: "#1E90FF", stopOpacity: 1 }}
              />{" "}
              {/* Azul Dodger */}
              <stop
                offset="100%"
                style={{ stopColor: "#00BFFF", stopOpacity: 1 }}
              />{" "}
              {/* Azul Cielo */}
            </linearGradient>
          </defs>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
          />
        </svg>
      )}
    </div>
  );
}

export default ButtonDarkMode;
