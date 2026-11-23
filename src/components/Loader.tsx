import { Pokeball } from "./Pokeball";

export const Loader = ({ label = "Cargando Pokémon…" }: { label?: string }) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center gap-4 py-8"
    >
      <Pokeball className="size-24 animate-[spin_1.1s_linear_infinite] motion-reduce:animate-none" />
      <span className="font-medium text-slate-500 dark:text-slate-400">{label}</span>
    </div>
  );
};
