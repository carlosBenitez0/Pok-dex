import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "../components/Header";
import { TopBar } from "../components/TopBar";
import { Loader } from "../components/Loader";
import { StatBars } from "../components/StatBars";
import { findEntry, usePokedex } from "../hooks/usePokedex";
import { collections, useCollection } from "../lib/collections";
import { suggest } from "../lib/filter";
import { useI18n } from "../i18n";
import { damageMultiplier, TYPE_HEX } from "../constants/typeChart";
import { addZeros, prettify, statTotal } from "../utils/format";
import { artworkUrl } from "../utils/sprites";
import type { PokedexEntry } from "../data/types";

function Picker({ list, onPick }: { list: PokedexEntry[]; onPick: (id: number) => void }) {
  const { t } = useI18n();
  const [q, setQ] = useState("");
  const options = useMemo(() => suggest(list, q, 8), [list, q]);
  return (
    <div className="flex flex-col gap-2">
      <label className="sr-only" htmlFor="compare-pick">
        {t("compare.pick")}
      </label>
      <input
        id="compare-pick"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t("compare.pick")}
        autoComplete="off"
        className="w-full rounded-full bg-slate-200 px-5 py-3 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-[#1c1f26]"
      />
      {options.length > 0 && (
        <ul className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#1c1f26]">
          {options.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => {
                  onPick(p.id);
                  setQ("");
                }}
                className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-slate-100 dark:hover:bg-white/10"
              >
                <span className="w-14 text-slate-400">#{addZeros(p.id)}</span>
                <span className="font-semibold">{prettify(p.name)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const fmtMult = (m: number) => (m === 0.5 ? "½" : m === 0.25 ? "¼" : String(m));

function Column({ p, rival }: { p: PokedexEntry; rival?: PokedexEntry }) {
  const { t, typeName } = useI18n();
  return (
    <section className="flex flex-col gap-5 rounded-2xl bg-white/60 p-6 dark:bg-[#1c1f26]">
      <Link to={`/pokemon/${p.id}`} className="flex flex-col items-center gap-1 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500">
        <img src={artworkUrl(p.id)} alt="" width={200} height={200} className="size-48 object-contain sm:size-56" loading="lazy" />
        <span className="text-slate-400">#{addZeros(p.id)}</span>
        <h2 className="text-center text-[2.4rem] font-extrabold">{prettify(p.name)}</h2>
      </Link>
      <div className="flex justify-center gap-2">
        {p.types.map((ty) => (
          <span key={ty} className="rounded-full px-4 py-1 font-bold text-white [text-shadow:0_1px_1px_rgb(0_0_0/0.4)]" style={{ background: TYPE_HEX[ty] }}>
            {typeName(ty)}
          </span>
        ))}
      </div>
      <dl className="grid grid-cols-3 gap-2 text-center">
        {[
          [t("compare.height"), `${(p.height / 10).toFixed(1)} m`, rival && p.height > rival.height],
          [t("compare.weight"), `${(p.weight / 10).toFixed(1)} kg`, rival && p.weight > rival.weight],
          [t("compare.total"), statTotal(p.stats), rival && statTotal(p.stats) > statTotal(rival.stats)],
        ].map(([k, v, win]) => (
          <div key={String(k)} className="rounded-xl bg-slate-100 py-2 dark:bg-white/5">
            <dt className="text-[1.2rem] text-slate-500 dark:text-slate-400">{k}</dt>
            <dd className={`font-bold ${win ? "text-emerald-600 dark:text-emerald-400" : ""}`}>{v}</dd>
          </div>
        ))}
      </dl>
      <StatBars stats={p.stats} compare={rival?.stats} />
      {rival && (
        <div>
          <h3 className="mb-2 text-[1.3rem] font-semibold text-slate-500 dark:text-slate-400">{t("compare.vs")}</h3>
          <ul className="flex flex-wrap gap-2">
            {rival.types.map((atk) => {
              const m = damageMultiplier(atk, p.types);
              return (
                <li key={atk} className="flex items-center gap-2 rounded-full bg-slate-100 py-1 pl-1 pr-3 dark:bg-white/5">
                  <span className="rounded-full px-3 py-0.5 text-[1.2rem] font-bold text-white" style={{ background: TYPE_HEX[atk] }}>
                    {typeName(atk)}
                  </span>
                  <span className={`font-bold ${m > 1 ? "text-red-600 dark:text-red-400" : m < 1 ? "text-emerald-600 dark:text-emerald-400" : ""}`}>×{fmtMult(m)}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      <button type="button" onClick={() => collections.remove("compare", p.id)} className="self-center text-[1.3rem] font-semibold text-[#e3350d] hover:underline">
        {t("team.remove")}
      </button>
    </section>
  );
}

export default function ComparePage() {
  const { t } = useI18n();
  const { list, loading } = usePokedex();
  const ids = useCollection("compare");
  const picked = ids.map((id) => findEntry(list, id)?.entry).filter((e) => e !== undefined);
  const [a, b] = picked;

  return (
    <PageShell header={<TopBar />}>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-[3rem] font-extrabold leading-tight">{t("compare.title")}</h1>
        {picked.length === 2 && (
          <button
            type="button"
            onClick={() => collections.replace("compare", [ids[1], ids[0]])}
            className="rounded-full bg-slate-200 px-5 py-2 font-semibold hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20"
          >
            ⇄ {t("compare.swap")}
          </button>
        )}
      </div>
      {loading ? (
        <Loader label={t("loading")} />
      ) : (
        <>
          {picked.length < 2 && <p className="mb-6 text-slate-500 dark:text-slate-400">{t("compare.empty")}</p>}
          <div className="grid gap-6 md:grid-cols-2">
            {a ? <Column p={a} rival={b} /> : <Picker list={list} onPick={(id) => collections.toggle("compare", id)} />}
            {b ? <Column p={b} rival={a} /> : a && <Picker list={list} onPick={(id) => collections.toggle("compare", id)} />}
          </div>
        </>
      )}
    </PageShell>
  );
}
