import { NavLink } from "react-router-dom";
import { Logo } from "./Header";
import ButtonDarkMode from "./ButtonDarkMode";
import { useI18n } from "../i18n";
import { useCollection } from "../lib/collections";

const navClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2 rounded-full px-4 py-2 font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 ${
    isActive
      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
      : "text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-white/10"
  }`;

const Count = ({ n }: { n: number }) =>
  n > 0 ? (
    <span className="grid min-w-[2rem] place-items-center rounded-full bg-[#e3350d] px-1.5 text-[1.2rem] leading-[2rem] text-white">
      {n}
    </span>
  ) : null;

export function LangToggle() {
  const { lang, setLang, t } = useI18n();
  return (
    <button
      type="button"
      onClick={() => setLang(lang === "es" ? "en" : "es")}
      aria-label={t("lang.switch")}
      title={t("lang.switch")}
      className="grid h-14 min-w-14 shrink-0 place-items-center rounded-full bg-slate-200 px-3 font-bold text-slate-700 hover:bg-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 dark:bg-[#1c1f26] dark:text-slate-200 dark:hover:bg-white/10"
    >
      {lang === "es" ? "EN" : "ES"}
    </button>
  );
}

/** Logo + navegación + idioma + tema. Compartida por todas las páginas de lista. */
export function TopBar() {
  const { t } = useI18n();
  const team = useCollection("team");
  const compare = useCollection("compare");

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
      <Logo />
      <nav aria-label="Principal" className="order-3 flex w-full items-center gap-2 sm:order-2 sm:w-auto">
        <NavLink to="/" end className={navClass}>
          {t("nav.pokedex")}
        </NavLink>
        <NavLink to="/equipo" className={navClass}>
          {t("nav.team")} <Count n={team.length} />
        </NavLink>
        <NavLink to="/comparar" className={navClass}>
          {t("nav.compare")} <Count n={compare.length} />
        </NavLink>
      </nav>
      <div className="order-2 flex items-center gap-3 sm:order-3">
        <LangToggle />
        <ButtonDarkMode />
      </div>
    </div>
  );
}
