import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Pokeball } from "./Pokeball";
import { useI18n } from "../i18n";

type Props = {
  children: ReactNode;
};

function Header({ children }: Props) {
  return (
    <div className="z-10 flex w-full justify-center shadow-xl shadow-slate-500/10">
      <header className="w-full max-w-[1280px] px-[1.6rem] py-6 sm:px-8 sm:py-8">
        {children}
      </header>
    </div>
  );
}

export function Logo() {
  const { t } = useI18n();
  return (
    <Link
      to="/"
      aria-label={t("nav.home")}
      className="group flex shrink-0 items-center gap-3 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500"
    >
      <Pokeball className="size-12 transition-transform duration-500 group-hover:rotate-[360deg] sm:size-14" />
      <span className="text-[2.4rem] font-extrabold leading-none tracking-tight text-slate-900 sm:text-[2.8rem] dark:text-white">
        Poké<span className="text-[#e3350d]">dex</span>
      </span>
    </Link>
  );
}

/** Contenedor común de las páginas de lista (fondo, ancho máximo). */
export function PageShell({ header, children }: { header: ReactNode; children: ReactNode }) {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-slate-100 text-[1.6rem] text-slate-900 dark:bg-[#0e1217] dark:text-slate-200">
      <Header>{header}</Header>
      <main className="mx-auto w-full max-w-[1280px] px-[1.6rem] pb-24 pt-8 sm:px-8 sm:pt-10">{children}</main>
    </div>
  );
}

export default Header;
