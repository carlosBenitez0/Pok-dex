import { useMemo } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "../components/Header";
import { TopBar } from "../components/TopBar";
import { Loader } from "../components/Loader";
import { StatBars } from "../components/StatBars";
import { findEntry, usePokedex } from "../hooks/usePokedex";
import { collections, TEAM_MAX, useCollection } from "../lib/collections";
import { teamDefense, teamOffense, teamThreats } from "../lib/team";
import { useI18n } from "../i18n";
import { TYPE_HEX } from "../constants/typeChart";
import { addZeros, prettify } from "../utils/format";
import { spriteUrl } from "../utils/sprites";

const TypeBadge = ({ type, label }: { type: string; label: string }) => (
  <span
    className="inline-block rounded-full px-3 py-0.5 text-[1.2rem] font-bold text-white [text-shadow:0_1px_1px_rgb(0_0_0/0.4)]"
    style={{ background: TYPE_HEX[type] }}
  >
    {label}
  </span>
);

export default function TeamPage() {
  const { t, typeName } = useI18n();
  const { list, loading } = usePokedex();
  const ids = useCollection("team");

  const members = useMemo(
    () => ids.map((id) => findEntry(list, id)?.entry).filter((e) => e !== undefined),
    [ids, list],
  );
  const memberTypes = members.map((m) => m.types);
  const defense = teamDefense(memberTypes);
  const offense = teamOffense(memberTypes);
  const threats = teamThreats(memberTypes);
  const avg =
    members.length > 0
      ? [0, 1, 2, 3, 4, 5].map((i) => Math.round(members.reduce((a, m) => a + m.stats[i], 0) / members.length))
      : [];

  return (
    <PageShell header={<TopBar />}>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[3rem] font-extrabold leading-tight">{t("team.title")}</h1>
          <p className="text-slate-500 dark:text-slate-400">{t("team.subtitle")}</p>
        </div>
        {ids.length > 0 && (
          <button
            type="button"
            onClick={() => collections.clear("team")}
            className="rounded-full bg-slate-200 px-5 py-2 font-semibold hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20"
          >
            {t("team.clear")}
          </button>
        )}
      </div>

      {loading ? (
        <Loader label={t("loading")} />
      ) : (
        <>
          {/* Huecos del equipo */}
          <ol className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: TEAM_MAX }, (_, i) => {
              const m = members[i];
              return (
                <li
                  key={i}
                  className={`flex min-h-[18rem] flex-col items-center justify-center gap-2 rounded-2xl border-2 p-4 text-center ${m ? "border-slate-300 bg-white/60 dark:border-white/10 dark:bg-[#1c1f26]" : "border-dashed border-slate-300 text-slate-400 dark:border-white/10"}`}
                >
                  {m ? (
                    <>
                      <Link to={`/pokemon/${m.id}`} className="flex flex-col items-center rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500">
                        <img src={spriteUrl(m.id, m.sprites)} alt="" width={96} height={96} className="size-32 [image-rendering:pixelated]" />
                        <span className="text-[1.2rem] text-slate-400">#{addZeros(m.id)}</span>
                        <span className="font-bold">{prettify(m.name)}</span>
                      </Link>
                      <div className="flex flex-wrap justify-center gap-1">
                        {m.types.map((ty) => (
                          <TypeBadge key={ty} type={ty} label={typeName(ty)} />
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => collections.remove("team", m.id)}
                        className="mt-1 text-[1.3rem] font-semibold text-[#e3350d] hover:underline"
                      >
                        {t("team.remove")}
                      </button>
                    </>
                  ) : (
                    <span>{t("team.slot")}</span>
                  )}
                </li>
              );
            })}
          </ol>

          {members.length === 0 ? (
            <p className="py-12 text-center text-slate-500 dark:text-slate-400">
              {t("team.empty")}{" "}
              <Link to="/" className="font-semibold text-blue-600 underline dark:text-blue-400">
                {t("nav.pokedex")}
              </Link>
            </p>
          ) : (
            <div className="mt-10 grid gap-8 lg:grid-cols-2">
              {threats.length > 0 && (
                <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-900 sm:flex-row sm:items-center lg:col-span-2 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
                  <p className="font-semibold">⚠ {t("team.warn")}</p>
                  <ul className="flex flex-wrap gap-2">
                    {threats.map((r) => (
                      <li key={r.attack} className="flex items-center gap-1.5 rounded-full bg-white/70 py-0.5 pl-0.5 pr-3 dark:bg-black/20">
                        <TypeBadge type={r.attack} label={typeName(r.attack)} />
                        <span className="text-[1.3rem] font-bold">×{r.weak}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <section className="rounded-2xl bg-white/60 p-6 dark:bg-[#1c1f26]">
                <h2 className="mb-4 text-[1.8rem] font-bold">{t("team.defense")}</h2>
                <table className="w-full text-left">
                  <thead className="text-[1.3rem] text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="py-1 font-semibold" />
                      <th className="py-1 text-center font-semibold">{t("team.weak")}</th>
                      <th className="py-1 text-center font-semibold">{t("team.resist")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {defense.map((r) => (
                      <tr key={r.attack} className="border-t border-slate-200 dark:border-white/5">
                        <td className="py-1.5">
                          <TypeBadge type={r.attack} label={typeName(r.attack)} />
                        </td>
                        <td className={`text-center font-bold tabular-nums ${r.weak >= 3 ? "text-red-600 dark:text-red-400" : r.weak > 0 ? "text-orange-600 dark:text-orange-400" : "text-slate-400"}`}>
                          {r.weak || "–"}
                        </td>
                        <td className={`text-center font-bold tabular-nums ${r.resist > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}>
                          {r.resist || "–"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              <div className="flex flex-col gap-8">
                <section className="rounded-2xl bg-white/60 p-6 dark:bg-[#1c1f26]">
                  <h2 className="mb-4 text-[1.8rem] font-bold">{t("team.offense")}</h2>
                  <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {offense.map((o) => (
                      <li
                        key={o.target}
                        title={o.by.map(typeName).join(", ")}
                        className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2 ${o.by.length ? "bg-emerald-50 dark:bg-emerald-500/10" : "bg-slate-100 opacity-60 dark:bg-white/5"}`}
                      >
                        <TypeBadge type={o.target} label={typeName(o.target)} />
                        <span className="text-[1.2rem] font-bold">{o.by.length ? "✓" : "✗"}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="rounded-2xl bg-white/60 p-6 dark:bg-[#1c1f26]">
                  <h2 className="mb-4 text-[1.8rem] font-bold">{t("team.stats")}</h2>
                  <StatBars stats={avg} />
                </section>
              </div>
            </div>
          )}
        </>
      )}
    </PageShell>
  );
}
