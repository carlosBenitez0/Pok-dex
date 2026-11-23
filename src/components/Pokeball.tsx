type Props = {
  className?: string;
  title?: string;
};

/** Pokéball en SVG (sin dependencias externas). */
export function Pokeball({ className, title }: Props) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      <circle cx="32" cy="32" r="29" fill="#fff" stroke="#1f2230" strokeWidth="4" />
      <path d="M3 32a29 29 0 0 1 58 0Z" fill="#e3350d" />
      <path d="M3 32h58" stroke="#1f2230" strokeWidth="4" />
      <circle cx="32" cy="32" r="9" fill="#fff" stroke="#1f2230" strokeWidth="4" />
      <circle cx="32" cy="32" r="3.5" fill="#1f2230" opacity="0.15" />
      <path d="M14 20a20 20 0 0 1 9-8" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" opacity="0.55" fill="none" />
    </svg>
  );
}
