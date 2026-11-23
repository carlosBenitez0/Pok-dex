import { KeyboardEvent, useEffect, useId, useRef, useState } from "react";
import type { Lang } from "../../i18n/dict";
import { prettify } from "../../utils/format";
import { artworkUrl } from "../../utils/sprites";

const SPRITE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

type Form = { id: number; name: string };

// Etiqueta y color por tipo de forma.
const KINDS: { match: RegExp; es: string; en: string; color: string }[] = [
  { match: /-gmax$/, es: "Gigamax", en: "Gigantamax", color: "#e3350d" },
  { match: /-mega-x$/, es: "Mega X", en: "Mega X", color: "#7c3aed" },
  { match: /-mega-y$/, es: "Mega Y", en: "Mega Y", color: "#7c3aed" },
  { match: /-mega$/, es: "Mega", en: "Mega", color: "#7c3aed" },
  { match: /-primal$/, es: "Primigenio", en: "Primal", color: "#0e7490" },
  { match: /-alola/, es: "Alola", en: "Alolan", color: "#0891b2" },
  { match: /-galar/, es: "Galar", en: "Galarian", color: "#be185d" },
  { match: /-hisui/, es: "Hisui", en: "Hisuian", color: "#a16207" },
  { match: /-paldea/, es: "Paldea", en: "Paldean", color: "#c2410c" },
];

function describe(form: Form, base: Form, lang: Lang) {
  if (form.id === base.id) return { tag: lang === "es" ? "Normal" : "Base", color: "#64748b", label: prettify(base.name) };
  const kind = KINDS.find((k) => k.match.test(form.name));
  // "tauros-paldea-aqua-breed" → resto tras la región: "Aqua Breed"
  const extra = prettify(form.name.replace(base.name, "").replace(/^-/, "").replace(/^(alola|galar|hisui|paldea|mega|gmax|primal)-?/, ""));
  return {
    tag: kind ? kind[lang] : prettify(form.name.replace(`${base.name}-`, "")),
    color: kind?.color ?? "#64748b",
    label: extra && !/^[XY]$/.test(extra) ? `${prettify(base.name)} · ${extra}` : prettify(base.name),
  };
}

function Thumb({ id }: { id: number }) {
  return (
    <img
      src={`${SPRITE}/${id}.png`}
      alt=""
      width={40}
      height={40}
      loading="lazy"
      onError={(e) => {
        // Algunas formas (Gigamax) no tienen sprite pixel: usamos el artwork.
        const img = e.currentTarget;
        if (!img.dataset.fallback) {
          img.dataset.fallback = "1";
          img.src = artworkUrl(id);
          img.style.imageRendering = "auto";
        }
      }}
      className="size-12 object-contain [image-rendering:pixelated]"
    />
  );
}

/** Selector de forma (regional, Mega, Gigamax…) con miniaturas. */
export function FormPicker({
  forms,
  currentId,
  lang,
  onChange,
}: {
  forms: Form[];
  currentId: number;
  lang: Lang;
  onChange: (id: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const base = forms[0];
  const currentIndex = Math.max(0, forms.findIndex((f) => f.id === currentId));
  const [active, setActive] = useState(currentIndex);
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const listId = useId();
  const current = forms[currentIndex];
  const cur = describe(current, base, lang);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [open]);

  useEffect(() => {
    if (open) list.current?.focus();
  }, [open]);

  // Posición fija calculada desde el botón: la fila padre tiene scroll
  // horizontal y recortaría un menú con position: absolute.
  const place = () => {
    const r = button.current?.getBoundingClientRect();
    if (!r) return;
    const width = Math.min(340, window.innerWidth - 32);
    const left = Math.min(Math.max(16, r.left), window.innerWidth - width - 16);
    setPos({ top: r.bottom + 10, left, width });
  };
  const openMenu = () => {
    setActive(currentIndex);
    place();
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [open]);
  const choose = (i: number) => {
    setOpen(false);
    button.current?.focus();
    if (forms[i].id !== currentId) onChange(forms[i].id);
  };

  // Las teclas no deben llegar a los controles de la GBA mientras el menú está abierto.
  const onListKey = (e: KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % forms.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + forms.length) % forms.length);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      choose(active);
    } else if (e.key === "Escape" || e.key === "Tab") {
      e.preventDefault();
      setOpen(false);
      button.current?.focus();
    }
  };

  return (
    <div ref={root} className="relative shrink-0">
      <button
        ref={button}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            e.stopPropagation();
            openMenu();
          }
        }}
        className={`flex h-[4.8rem] items-center gap-3 rounded-2xl bg-white/[0.08] pl-1.5 pr-4 ring-1 backdrop-blur transition-[box-shadow,background-color] hover:bg-white/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${open ? "bg-white/[0.12] shadow-[0_0_0_4px_rgb(96_165_250/0.18)] ring-blue-400/60" : "ring-white/15"}`}
      >
        <span className="grid size-[3.8rem] place-items-center rounded-xl bg-white/10">
          <Thumb id={current.id} />
        </span>
        <span className="flex flex-col items-start leading-tight">
          <span className="text-[1.05rem] font-semibold uppercase tracking-wider text-slate-400">
            {lang === "es" ? "Forma" : "Form"} · {currentIndex + 1}/{forms.length}
          </span>
          <span className="flex items-center gap-2 font-semibold text-white">
            {cur.label}
            <span className="rounded-full px-2 py-px text-[1.1rem] font-bold text-white" style={{ background: cur.color }}>
              {cur.tag}
            </span>
          </span>
        </span>
        <svg viewBox="0 0 20 20" fill="currentColor" className={`ml-1 size-5 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z" clipRule="evenodd" />
        </svg>
      </button>

      {open && pos && (
        <ul
          ref={list}
          id={listId}
          role="listbox"
          tabIndex={-1}
          aria-label={lang === "es" ? "Forma" : "Form"}
          aria-activedescendant={`${listId}-${active}`}
          onKeyDown={onListKey}
          style={{ top: pos.top, left: pos.left, width: pos.width }}
          className="fixed z-50 max-h-[min(44rem,60vh)] origin-top-left animate-[pop_140ms_ease-out] overflow-y-auto rounded-2xl bg-[#161a21]/95 p-2 shadow-[0_24px_60px_-12px_rgb(0_0_0/0.6)] outline-none ring-1 ring-white/10 backdrop-blur-xl"
        >
          {forms.map((f, i) => {
            const d = describe(f, base, lang);
            const selected = f.id === currentId;
            return (
              <li
                key={f.id}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={selected}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(i)}
                className={`flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 transition-colors ${i === active ? "bg-white/[0.08]" : ""}`}
              >
                <span
                  className="grid size-14 shrink-0 place-items-center rounded-xl"
                  style={{ background: `linear-gradient(135deg, ${d.color}40, ${d.color}10)` }}
                >
                  <Thumb id={f.id} />
                </span>
                <span className="flex min-w-0 flex-1 flex-col leading-tight">
                  <span className="truncate font-semibold text-white">{d.label}</span>
                  <span className="mt-1">
                    <span className="rounded-full px-2 py-px text-[1.1rem] font-bold text-white" style={{ background: d.color }}>
                      {d.tag}
                    </span>
                  </span>
                </span>
                {selected && (
                  <svg viewBox="0 0 20 20" fill="currentColor" className="size-6 shrink-0 text-blue-400" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.58l7.3-7.3a1 1 0 0 1 1.4 0Z" clipRule="evenodd" />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
