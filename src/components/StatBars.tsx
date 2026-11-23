import { useI18n } from "../i18n";
import { STAT_KEYS } from "../i18n/dict";

const color = (v: number) =>
  v >= 120 ? "bg-emerald-500" : v >= 90 ? "bg-lime-500" : v >= 60 ? "bg-amber-400" : "bg-orange-500";

/** Barras de stats base. Con `compare`, dibuja una segunda barra del rival. */
export function StatBars({
  stats,
  compare,
  max = 200,
}: {
  stats: number[];
  compare?: number[];
  max?: number;
}) {
  const { t } = useI18n();
  return (
    <dl className="grid grid-cols-[minmax(7rem,auto)_3.6rem_1fr] items-center gap-x-4 gap-y-3">
      {stats.map((v, i) => {
        const other = compare?.[i];
        const better = other !== undefined && v > other;
        return (
          <div key={i} className="contents">
            <dt className="text-[1.3rem] font-semibold text-slate-500 dark:text-slate-400">{t(STAT_KEYS[i])}</dt>
            <dd className={`text-right font-bold tabular-nums ${better ? "text-emerald-600 dark:text-emerald-400" : ""}`}>{v}</dd>
            <dd className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
              <div className={`h-full rounded-full ${color(v)}`} style={{ width: `${Math.min(100, (v / max) * 100)}%` }} />
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
