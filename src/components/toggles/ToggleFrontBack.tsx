import { useRef, useEffect } from "react";

type PropsToggleFrontBack = {
  onClic: () => void;
  frontBack: string;
  normalShiny: string;
};

const ToggleFrontBack = ({
  onClic,
  frontBack,
  normalShiny,
}: PropsToggleFrontBack) => {
  const toggleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (toggleRef.current) {
      toggleRef.current.checked = frontBack === "FRONT" ? false : true;
    }
  }, [frontBack]);

  return (
    <div className={`flex items-center gap-3`}>
      <input
        onClick={onClic}
        type="checkbox"
        id="frontBack"
        className="peer hidden h-0 w-0"
        ref={toggleRef}
      />

      <label
        htmlFor="frontBack"
        className={`relative order-2 flex h-6 w-[50px] cursor-pointer items-center rounded-full bg-green-600 indent-[-9999px] after:absolute after:left-2 after:h-3 after:w-8 after:rounded-full after:bg-white after:content-[''] ${normalShiny !== "NORMAL" ? "bg-gradient-to-r from-charizard-shiny-red to-metagross-shiny-gold shadow-md shadow-slate-800 after:bg-gradient-to-r after:from-metagross-normal-gray-blue after:to-metagross-shiny-silver" : ""} ${toggleRef.current?.checked ? "after:left-[calc(100%-0.5rem)] after:translate-x-[-100%]" : ""}`}
      ></label>

      <p
        className={`order-1 font-bold ${normalShiny !== "NORMAL" ? "bg-gradient-to-r from-[#F04038] to-[#F8D030] bg-clip-text text-transparent text-shadow-lg" : "dark:text-slate-300"}`}
      >
        {frontBack.toUpperCase()}
      </p>
    </div>
  );
};

export default ToggleFrontBack;
