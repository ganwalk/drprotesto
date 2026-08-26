import { cn } from "@/lib/cn";

/**
 * Marca DR PROTESTO.
 *
 * O símbolo é um selo notarial reduzido ao essencial: o anel do carimbo, o
 * "D" de dívida em traço grosso e a barra de protocolo que o subscreve.
 * Legível a 20px na sidebar e a 96px no rodapé.
 *
 * As duas cores são explícitas — nunca herdadas — para que a marca funcione
 * sobre o hero escuro, sobre superfície clara e no tema escuro.
 */
export function LogoMark({
  className,
  size = 32,
  corSelo = "text-navy-900 dark:text-ice-100",
  corGlifo = "text-white dark:text-navy-950",
}: {
  className?: string;
  size?: number;
  corSelo?: string;
  corGlifo?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <g className={corSelo}>
        <rect width="32" height="32" rx="8" fill="currentColor" />
      </g>
      <g className={corGlifo}>
        <circle cx="16" cy="15" r="8.6" stroke="currentColor" strokeWidth="1.6" opacity="0.32" />
        <path
          d="M11.9 10.2h3.7a4.5 4.5 0 0 1 0 9h-3.7v-9Z"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinejoin="round"
          fill="none"
        />
        <path d="M11.9 23.1h8.9" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export function Logo({
  className,
  size = 32,
  variante = "auto",
  compacto = false,
  subtitulo = true,
}: {
  className?: string;
  size?: number;
  /** "claro" para fundos escuros; "escuro" para fundos claros fixos. */
  variante?: "auto" | "claro" | "escuro";
  compacto?: boolean;
  subtitulo?: boolean;
}) {
  const selo =
    variante === "claro"
      ? "text-white"
      : variante === "escuro"
        ? "text-navy-900"
        : "text-navy-900 dark:text-ice-100";

  const glifo =
    variante === "claro"
      ? "text-navy-900"
      : variante === "escuro"
        ? "text-white"
        : "text-white dark:text-navy-950";

  const corTexto =
    variante === "claro"
      ? "text-white"
      : variante === "escuro"
        ? "text-navy-900"
        : "text-fg";

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={size} corSelo={selo} corGlifo={glifo} />
      {!compacto && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "font-display text-[15px] font-bold tracking-[0.13em] uppercase",
              corTexto,
            )}
          >
            DR Protesto
          </span>
          {subtitulo && (
            <span
              className={cn(
                "mt-1 text-[9px] font-medium tracking-[0.2em] uppercase",
                variante === "claro" ? "text-white/55" : "text-fg-subtle",
              )}
            >
              Recuperação de crédito
            </span>
          )}
        </span>
      )}
    </span>
  );
}
