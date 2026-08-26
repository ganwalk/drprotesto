"use client";

import * as React from "react";
import { CaretDown, MagnifyingGlass } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";

const FIELD_BASE =
  "w-full rounded-lg border border-line bg-surface text-fg placeholder:text-fg-subtle " +
  "transition-colors focus:border-accent focus:outline-none disabled:cursor-not-allowed disabled:opacity-55";

export function Field({
  label,
  hint,
  erro,
  children,
  className,
  obrigatorio,
}: {
  label?: string;
  hint?: string;
  erro?: string;
  children: React.ReactNode;
  className?: string;
  obrigatorio?: boolean;
}) {
  return (
    <label className={cn("block", className)}>
      {label && (
        <span className="mb-1.5 block text-[12.5px] font-medium text-fg">
          {label}
          {obrigatorio && <span className="ml-0.5 text-danger">*</span>}
        </span>
      )}
      {children}
      {erro ? (
        <span className="mt-1 block text-[12px] text-danger">{erro}</span>
      ) : hint ? (
        <span className="mt-1 block text-[12px] text-fg-muted">{hint}</span>
      ) : null}
    </label>
  );
}

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { prefixo?: React.ReactNode }
>(function Input({ className, prefixo, ...props }, ref) {
  if (prefixo) {
    return (
      <span className="relative block">
        <span className="pointer-events-none absolute inset-y-0 left-3 grid place-items-center text-fg-subtle">
          {prefixo}
        </span>
        <input ref={ref} className={cn(FIELD_BASE, "h-10 pr-3 pl-9 text-sm", className)} {...props} />
      </span>
    );
  }
  return <input ref={ref} className={cn(FIELD_BASE, "h-10 px-3 text-sm", className)} {...props} />;
});

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(FIELD_BASE, "min-h-24 resize-y px-3 py-2.5 text-sm leading-relaxed", className)}
      {...props}
    />
  );
});

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className, children, ...props }, ref) {
  return (
    <span className="relative block">
      <select
        ref={ref}
        className={cn(FIELD_BASE, "h-10 appearance-none pr-9 pl-3 text-sm", className)}
        {...props}
      >
        {children}
      </select>
      <CaretDown
        size={14}
        weight="bold"
        className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-fg-subtle"
      />
    </span>
  );
});

export function SearchInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <Input prefixo={<MagnifyingGlass size={15} />} className={className} {...props} />;
}

export function Switch({
  checked,
  onChange,
  label,
  descricao,
  disabled,
  className,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: React.ReactNode;
  descricao?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors disabled:opacity-50",
          checked ? "bg-accent" : "bg-line-strong",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition-[left] duration-200",
            checked ? "left-[18px]" : "left-0.5",
          )}
        />
      </button>
      {(label || descricao) && (
        <div className="min-w-0">
          {label && <p className="text-[13px] font-medium text-fg">{label}</p>}
          {descricao && <p className="mt-0.5 text-[12px] leading-relaxed text-fg-muted">{descricao}</p>}
        </div>
      )}
    </div>
  );
}

export function Checkbox({
  checked,
  indeterminate,
  onChange,
  label,
  className,
  disabled,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (v: boolean) => void;
  label?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  const ref = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (ref.current) ref.current.indeterminate = Boolean(indeterminate) && !checked;
  }, [indeterminate, checked]);

  return (
    <label className={cn("inline-flex cursor-pointer items-center gap-2", className)}>
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 shrink-0 cursor-pointer rounded border-line-strong accent-[var(--accent)]"
      />
      {label && <span className="text-[13px] text-fg select-none">{label}</span>}
    </label>
  );
}

/** Grupo de "pílulas" selecionáveis, como nos formulários dos anexos. */
export function ChipGroup<T extends string>({
  value,
  onChange,
  options,
  multiple,
  className,
}: {
  value: T[];
  onChange: (v: T[]) => void;
  options: Array<{ value: T; label: string }>;
  multiple?: boolean;
  className?: string;
}) {
  const toggle = (v: T) => {
    if (!multiple) return onChange([v]);
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  };

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((o) => {
        const ativo = value.includes(o.value);
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => toggle(o.value)}
            className={cn(
              "h-9 rounded-full px-4 text-[13px] font-medium transition-colors",
              ativo
                ? "bg-navy-900 text-white dark:bg-ice-100 dark:text-navy-900"
                : "bg-accent-soft text-accent hover:bg-ice-200 dark:hover:bg-surface-3",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Campo monetário em centavos, com máscara pt-BR. */
export function MoneyInput({
  value,
  onChange,
  className,
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> & {
  value: number;
  onChange: (v: number) => void;
}) {
  const [texto, setTexto] = React.useState(() =>
    value.toLocaleString("pt-BR", { minimumFractionDigits: 2 }),
  );

  React.useEffect(() => {
    const atual = Number(texto.replace(/\./g, "").replace(",", ".")) || 0;
    if (Math.abs(atual - value) > 0.005) {
      setTexto(value.toLocaleString("pt-BR", { minimumFractionDigits: 2 }));
    }
    // Sincroniza só quando o valor externo diverge do texto digitado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <Input
      prefixo={<span className="text-[12px] font-medium">R$</span>}
      inputMode="decimal"
      className={cn("tnum", className)}
      value={texto}
      onChange={(e) => {
        const digits = e.target.value.replace(/\D/g, "");
        const numero = Number(digits) / 100;
        setTexto(numero.toLocaleString("pt-BR", { minimumFractionDigits: 2 }));
        onChange(numero);
      }}
      {...props}
    />
  );
}
