import { useI18n } from "../../i18n";
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
  const { t } = useI18n();
  const isBack = frontBack === "BACK";

  return (
    <div className="flex items-center gap-3">
      <input
        onChange={onClic}
        checked={isBack}
        type="checkbox"
        id="switch-front-back"
        className="peer sr-only"
      />

      <label
        htmlFor="switch-front-back"
        className={`relative order-2 flex h-6 w-[50px] cursor-pointer items-center rounded-full bg-green-600 indent-[-9999px] after:absolute after:left-2 after:h-3 after:w-8 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-blue-500 ${normalShiny !== "NORMAL" ? "bg-gradient-to-r from-charizard-shiny-red to-metagross-shiny-gold shadow-md shadow-slate-800 after:bg-gradient-to-r after:from-metagross-normal-gray-blue after:to-metagross-shiny-silver" : ""} ${isBack ? "after:left-[calc(100%-0.5rem)] after:translate-x-[-100%]" : ""}`}
      >
        Front / Back
      </label>

      <p
        className={`order-1 font-bold ${normalShiny !== "NORMAL" ? "bg-gradient-to-r from-[#F04038] to-[#F8D030] bg-clip-text text-transparent text-shadow-lg" : "dark:text-slate-300"}`}
      >
        {t(isBack ? "back" : "front")}
      </p>
    </div>
  );
};

export default ToggleFrontBack;
