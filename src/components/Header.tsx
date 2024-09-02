import { ReactNode } from "react";
import "../css/Header.css";

type Props = {
  children: ReactNode;
};

function Header({ children }: Props) {
  return (
    <div className="header-container">
      <header className="header">{children}</header>
    </div>
  );
}

type logoProps = {
  urlLogo: string;
};
export function Logo({ urlLogo }: logoProps) {
  return (
    <div className="logo-container">
      <img src={urlLogo} alt="Logo Pokédex" />
    </div>
  );
}

export default Header;
