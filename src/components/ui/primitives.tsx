"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import type { Tone } from "@/lib/status";
import { initials } from "@/lib/format";

/* -------------------------------- Button --------------------------------- */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "dark" | "outline";
type ButtonSize = "sm" | "md" | "lg" | "icon";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-accent-fg hover:bg-accent-hover shadow-[0_1px_2px_rgba(9,30,44,0.12)]",
  secondary:
    "bg-surface-2 text-fg hover:bg-surface-3 border border-line",
  outline:
    "border border-line-strong text-fg hover:bg-surface-2 hover:border-accent",
  ghost: "text-fg-muted hover:bg-surface-2 hover:text-fg",
  danger: "bg-danger text-white hover:opacity-90",
  dark: "bg-navy-900 text-white hover:bg-navy-800 dark:bg-ice-100 dark:text-navy-900 dark:hover:bg-white",
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-[13px] gap-1.5 rounded-md",
  md: "h-10 px-4 text-sm gap-2 rounded-lg",
  lg: "h-12 px-6 text-[15px] gap-2.5 rounded-lg",
  icon: "h-9 w-9 rounded-lg",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", loading, disabled, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-medium whitespace-nowrap",
        "transition-[background-color,color,border-color,opacity,transform] duration-150",
        "active:scale-[0.985] disabled:pointer-events-none disabled:opacity-45",
        BUTTON_VARIANTS[variant],
        BUTTON_SIZES[size],
        className,
      )}
      {...props}
    >
      {loading && (
        <span className="size-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
});

/* --------------------------------- Card ---------------------------------- */

export function Card({
  className,
  as: Tag = "div",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { as?: React.ElementType }) {
  return (
    <Tag
      className={cn(
        "rounded-xl border border-line bg-surface shadow-[var(--shadow-card)]",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  title,
  description,
  actions,
  className,
  icon,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4",
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        {icon && (
          <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <h3 className="font-display text-[15px] font-semibold text-fg">{title}</h3>
          {description && (
            <p className="mt-0.5 text-[13px] leading-relaxed text-fg-muted">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

/* --------------------------------- Badge --------------------------------- */

const TONE_CLASSES: Record<Tone, string> = {
  neutral: "bg-neutral-soft text-fg-muted",
  info: "bg-info-soft text-info",
  ok: "bg-ok-soft text-ok",
  warn: "bg-warn-soft text-warn",
  danger: "bg-danger-soft text-danger",
  accent: "bg-accent-soft text-accent",
};

const TONE_DOT: Record<Tone, string> = {
  neutral: "bg-fg-subtle",
  info: "bg-info",
  ok: "bg-ok",
  warn: "bg-warn",
  danger: "bg-danger",
  accent: "bg-accent",
};

export function Badge({
  tone = "neutral",
  children,
  dot,
  className,
  title,
}: {
  tone?: Tone;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11.5px] font-medium whitespace-nowrap",
        TONE_CLASSES[tone],
        className,
      )}
    >
      {dot && <span className={cn("size-1.5 shrink-0 rounded-full", TONE_DOT[tone])} />}
      {children}
    </span>
  );
}

/* -------------------------------- Avatar --------------------------------- */

const AVATAR_TINTS = [
  "bg-steel-600 text-white",
  "bg-navy-800 text-white",
  "bg-steel-400 text-navy-900",
  "bg-ice-200 text-navy-800",
  "bg-navy-600 text-white",
  "bg-steel-500 text-white",
];

export function Avatar({
  nome,
  size = 32,
  className,
}: {
  nome: string;
  size?: number;
  className?: string;
}) {
  // Tom estável por nome: o mesmo devedor tem sempre a mesma cor.
  const idx = React.useMemo(() => {
    let h = 0;
    for (let i = 0; i < nome.length; i++) h = (h * 31 + nome.charCodeAt(i)) >>> 0;
    return h % AVATAR_TINTS.length;
  }, [nome]);

  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full font-semibold",
        AVATAR_TINTS[idx],
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      aria-hidden
    >
      {initials(nome)}
    </span>
  );
}

/* ------------------------------- Progress -------------------------------- */

export function Progress({
  value,
  tone = "accent",
  className,
  height = 6,
}: {
  value: number;
  tone?: Tone;
  className?: string;
  height?: number;
}) {
  return (
    <div
      className={cn("w-full overflow-hidden rounded-full bg-surface-3", className)}
      style={{ height }}
      role="progressbar"
      aria-valuenow={Math.round(value * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-500", TONE_DOT[tone])}
        style={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }}
      />
    </div>
  );
}

/* ------------------------------ Empty state ------------------------------ */

export function EmptyState({
  icon,
  titulo,
  descricao,
  acao,
  className,
}: {
  icon?: React.ReactNode;
  titulo: string;
  descricao?: string;
  acao?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-16 text-center", className)}>
      {icon && (
        <span className="mb-4 grid size-12 place-items-center rounded-xl bg-surface-2 text-fg-subtle">
          {icon}
        </span>
      )}
      <p className="font-display text-[15px] font-semibold text-fg">{titulo}</p>
      {descricao && <p className="mt-1 max-w-sm text-[13px] leading-relaxed text-fg-muted">{descricao}</p>}
      {acao && <div className="mt-5">{acao}</div>}
    </div>
  );
}

/* ------------------------------- Skeleton -------------------------------- */

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-md", className)} />;
}

/* -------------------------------- KPI card ------------------------------- */

export function KpiCard({
  label,
  valor,
  sub,
  icon,
  tone = "accent",
  delta,
  className,
}: {
  label: string;
  valor: React.ReactNode;
  sub?: React.ReactNode;
  icon?: React.ReactNode;
  tone?: Tone;
  delta?: { valor: string; positivo: boolean };
  className?: string;
}) {
  return (
    <Card className={cn("p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[12.5px] font-medium tracking-wide text-fg-muted uppercase">{label}</p>
        {icon && (
          <span
            className={cn(
              "grid size-8 shrink-0 place-items-center rounded-lg",
              TONE_CLASSES[tone],
            )}
          >
            {icon}
          </span>
        )}
      </div>
      <p className="tnum font-display mt-3 text-[26px] leading-none font-semibold text-fg">
        {valor}
      </p>
      <div className="mt-2 flex items-center gap-2">
        {delta && (
          <span
            className={cn(
              "tnum text-[12px] font-semibold",
              delta.positivo ? "text-ok" : "text-danger",
            )}
          >
            {delta.positivo ? "▲" : "▼"} {delta.valor}
          </span>
        )}
        {sub && <span className="text-[12.5px] text-fg-muted">{sub}</span>}
      </div>
    </Card>
  );
}

/* ----------------------------- Segmented tabs ---------------------------- */

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
  size = "md",
}: {
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: React.ReactNode; count?: number }>;
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-lg border border-line bg-surface-2 p-1",
        className,
      )}
      role="tablist"
    >
      {options.map((opt) => {
        const ativo = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={ativo}
            onClick={() => onChange(opt.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md font-medium transition-colors",
              size === "sm" ? "h-7 px-2.5 text-[12.5px]" : "h-8 px-3 text-[13px]",
              ativo
                ? "bg-surface text-fg shadow-[var(--shadow-card)]"
                : "text-fg-muted hover:text-fg",
            )}
          >
            {opt.label}
            {opt.count !== undefined && (
              <span
                className={cn(
                  "tnum rounded px-1 text-[11px]",
                  ativo ? "bg-accent-soft text-accent" : "bg-surface-3 text-fg-subtle",
                )}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* -------------------------------- Divider -------------------------------- */

export function Divider({ className, label }: { className?: string; label?: string }) {
  if (label) {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <span className="h-px flex-1 bg-line" />
        <span className="text-[11.5px] font-medium tracking-wider text-fg-subtle uppercase">
          {label}
        </span>
        <span className="h-px flex-1 bg-line" />
      </div>
    );
  }
  return <div className={cn("h-px w-full bg-line", className)} />;
}

/* ------------------------------ Page header ------------------------------ */

export function PageHeader({
  titulo,
  descricao,
  acoes,
  breadcrumb,
}: {
  titulo: string;
  descricao?: string;
  acoes?: React.ReactNode;
  breadcrumb?: string;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {breadcrumb && (
          <p className="mb-1.5 text-[11.5px] font-semibold tracking-wider text-accent uppercase">
            {breadcrumb}
          </p>
        )}
        <h1 className="font-display text-[26px] leading-tight font-semibold text-fg">{titulo}</h1>
        {descricao && (
          <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-fg-muted">
            {descricao}
          </p>
        )}
      </div>
      {acoes && <div className="flex flex-wrap items-center gap-2">{acoes}</div>}
    </header>
  );
}
