import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DICT, Lang, TYPE_NAMES } from "./dict";

export type { Lang };

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof (typeof DICT)["es"], vars?: Record<string, string | number>) => string;
  typeName: (type: string) => string;
};

const LangContext = createContext<Ctx | null>(null);

const readLang = (): Lang => {
  try {
    const v = window.localStorage.getItem("lang");
    if (v === "es" || v === "en") return v;
  } catch {
    /* storage no disponible */
  }
  return navigator.language?.toLowerCase().startsWith("es") ? "es" : "en";
};

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readLang);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem("lang", l);
    } catch {
      /* storage no disponible */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo<Ctx>(
    () => ({
      lang,
      setLang,
      t: (key, vars) => {
        let s: string = DICT[lang][key] ?? DICT.es[key] ?? String(key);
        if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
        return s;
      },
      typeName: (type) => TYPE_NAMES[lang][type] ?? type,
    }),
    [lang, setLang],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useI18n() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useI18n debe usarse dentro de <LangProvider>");
  return ctx;
}
