import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  normalShiny: string;
};

function Header({ children, normalShiny }: Props) {
  return (
    <div
      className={`z-10 flex w-full items-center justify-center ${normalShiny !== "SHINY" ? "shadow-xl shadow-slate-500/10" : ""}`}
    >
      <header className="w-3/4 p-8">{children}</header>
    </div>
  );
}

type logoProps = {
  urlLogo: string;
};
export function Logo({ urlLogo }: logoProps) {
  return (
    <div className="logo-container">
      <img src={urlLogo} alt="Logo Pokédex" className="h-16" />
    </div>
  );
}

export default Header;
