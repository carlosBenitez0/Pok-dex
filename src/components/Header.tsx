import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

function Header({ children }: Props) {
  return (
    <div className="z-10 flex w-full justify-center shadow-xl shadow-slate-500/10">
      <header className="w-full max-w-7xl px-4 py-6 sm:px-8 sm:py-8">
        {children}
      </header>
    </div>
  );
}

type logoProps = {
  urlLogo: string;
};
export function Logo({ urlLogo }: logoProps) {
  return (
    <div className="logo-container shrink-0">
      <img src={urlLogo} alt="Pokédex" className="h-12 w-auto sm:h-16" />
    </div>
  );
}

export default Header;
