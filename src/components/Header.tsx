import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Pokeball } from "./Pokeball";

type Props = {
  children: ReactNode;
};

function Header({ children }: Props) {
  return (
    <div className="z-10 flex w-full justify-center shadow-xl shadow-slate-500/10">
      <header className="w-full max-w-[1280px] px-4 py-6 sm:px-8 sm:py-8">
        {children}
      </header>
    </div>
  );
}

export function Logo() {
  return (
    <Link
      to="/"
      aria-label="Pokédex, inicio"
      className="group flex shrink-0 items-center gap-3 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500"
    >
      <Pokeball className="size-12 transition-transform duration-500 group-hover:rotate-[360deg] sm:size-14" />
      <span className="text-[2.4rem] font-extrabold leading-none tracking-tight text-slate-900 sm:text-[2.8rem] dark:text-white">
        Poké<span className="text-[#e3350d]">dex</span>
      </span>
    </Link>
  );
}

export default Header;
