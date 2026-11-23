import type { PokedexEntry } from "../data/types";
import { TYPE_HEX } from "../constants/typeChart";
import { useI18n } from "../i18n";
import { addZeros, prettify } from "../utils/format";
import { spriteUrl } from "../utils/sprites";

/** Resalta la parte del nombre que coincide con la búsqueda. */
function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim().toLowerCase().replace(/\s+/g, " ");
  const i = q ? text.toLowerCase().indexOf(q) : -1;
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded-sm bg-[#e3350d]/15 text-inherit dark:bg-[#ff6b4a]/25">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

/** Fila de Pokémon para listas de sugerencias (buscador y comparador). */
export function PokemonOption({ p, query = "", active = false }: { p: PokedexEntry; query?: string; active?: boolean }) {
  const { typeName } = useI18n();
  const tint = TYPE_HEX[p.types[0]];
  return (
    <span className="flex min-w-0 flex-1 items-center gap-4">
      <span
        className="grid size-14 shrink-0 place-items-center rounded-xl"
        style={{ background: `linear-gradient(135deg, ${tint}33, ${tint}11)` }}
      >
        <img src={spriteUrl(p.id, p.sprites)} alt="" width={56} height={56} loading="lazy" className="size-14 object-contain [image-rendering:pixelated]" />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="flex min-w-0 items-baseline gap-2">
          <span className="shrink-0 font-mono text-[1.3rem] tabular-nums text-slate-400">#{addZeros(p.id)}</span>
          <span className={`truncate font-semibold ${active ? "text-slate-900 dark:text-white" : ""}`}>
            <Highlight text={prettify(p.name)} query={query} />
          </span>
        </span>
        <span className="mt-0.5 flex gap-1.5">
          {p.types.map((ty) => (
            <span
              key={ty}
              className="rounded-full px-2 py-px text-[1.1rem] font-semibold text-white [text-shadow:0_1px_1px_rgb(0_0_0/0.35)]"
              style={{ background: TYPE_HEX[ty] }}
            >
              {typeName(ty)}
            </span>
          ))}
        </span>
      </span>
    </span>
  );
}
