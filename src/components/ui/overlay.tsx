"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";

function useMounted() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return mounted;
}

/** Fecha no Esc e trava o scroll do body enquanto a camada está aberta. */
function useDismiss(aberto: boolean, onClose: () => void) {
  React.useEffect(() => {
    if (!aberto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = anterior;
      document.removeEventListener("keydown", onKey);
    };
  }, [aberto, onClose]);
}

/* --------------------------------- Modal --------------------------------- */

export function Modal({
  aberto,
  onClose,
  titulo,
  descricao,
  children,
  rodape,
  largura = "md",
}: {
  aberto: boolean;
  onClose: () => void;
  titulo: React.ReactNode;
  descricao?: React.ReactNode;
  children: React.ReactNode;
  rodape?: React.ReactNode;
  largura?: "sm" | "md" | "lg" | "xl";
}) {
  const mounted = useMounted();
  useDismiss(aberto, onClose);
  if (!mounted || !aberto) return null;

  const larguras = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-3xl",
    xl: "max-w-5xl",
  } as const;

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-start justify-center overflow-y-auto p-4 sm:p-8">
      <div
        className="animate-fade fixed inset-0 bg-navy-950/45 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "animate-fade-up relative my-auto w-full rounded-xl border border-line bg-surface shadow-[var(--shadow-lift)]",
          larguras[largura],
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <h2 className="font-display text-base font-semibold text-fg">{titulo}</h2>
            {descricao && (
              <p className="mt-0.5 text-[13px] leading-relaxed text-fg-muted">{descricao}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="-mt-1 -mr-1 grid size-8 shrink-0 place-items-center rounded-lg text-fg-subtle transition-colors hover:bg-surface-2 hover:text-fg"
          >
            <X size={16} weight="bold" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-5">{children}</div>
        {rodape && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line bg-surface-2/60 px-5 py-3.5">
            {rodape}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

/* --------------------------------- Drawer -------------------------------- */

export function Drawer({
  aberto,
  onClose,
  titulo,
  subtitulo,
  children,
  rodape,
  largura = 560,
}: {
  aberto: boolean;
  onClose: () => void;
  titulo: React.ReactNode;
  subtitulo?: React.ReactNode;
  children: React.ReactNode;
  rodape?: React.ReactNode;
  largura?: number;
}) {
  const mounted = useMounted();
  useDismiss(aberto, onClose);
  if (!mounted || !aberto) return null;

  return createPortal(
    <div className="fixed inset-0 z-100">
      <div
        className="animate-fade absolute inset-0 bg-navy-950/45 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />
      <aside
        role="dialog"
        aria-modal="true"
        style={{ maxWidth: largura }}
        className="absolute inset-y-0 right-0 flex w-full flex-col border-l border-line bg-surface shadow-[var(--shadow-lift)] duration-300 [animation:drp-fade_.2s_ease]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <h2 className="font-display truncate text-base font-semibold text-fg">{titulo}</h2>
            {subtitulo && <div className="mt-0.5 text-[13px] text-fg-muted">{subtitulo}</div>}
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="-mt-1 -mr-1 grid size-8 shrink-0 place-items-center rounded-lg text-fg-subtle transition-colors hover:bg-surface-2 hover:text-fg"
          >
            <X size={16} weight="bold" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {rodape && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line bg-surface-2/60 px-5 py-3.5">
            {rodape}
          </div>
        )}
      </aside>
    </div>,
    document.body,
  );
}

/* ------------------------------- Dropdown -------------------------------- */

export function Dropdown({
  trigger,
  children,
  align = "right",
  largura = 220,
  className,
}: {
  trigger: (props: { aberto: boolean; toggle: () => void }) => React.ReactNode;
  children: (props: { fechar: () => void }) => React.ReactNode;
  align?: "left" | "right";
  largura?: number;
  className?: string;
}) {
  const [aberto, setAberto] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!aberto) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setAberto(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [aberto]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      {trigger({ aberto, toggle: () => setAberto((v) => !v) })}
      {aberto && (
        <div
          style={{ width: largura }}
          className={cn(
            "animate-fade-up absolute top-[calc(100%+6px)] z-50 overflow-hidden rounded-xl border border-line bg-surface p-1.5 shadow-[var(--shadow-pop)]",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          {children({ fechar: () => setAberto(false) })}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({
  children,
  onClick,
  icon,
  tone = "default",
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  icon?: React.ReactNode;
  tone?: "default" | "danger";
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors",
        tone === "danger"
          ? "text-danger hover:bg-danger-soft"
          : "text-fg hover:bg-surface-2",
        className,
      )}
    >
      {icon && <span className="shrink-0 text-fg-subtle">{icon}</span>}
      <span className="min-w-0 flex-1 truncate">{children}</span>
    </button>
  );
}

export function DropdownLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-2.5 pt-2 pb-1 text-[11px] font-semibold tracking-wider text-fg-subtle uppercase">
      {children}
    </p>
  );
}

/* -------------------------------- Tooltip -------------------------------- */

export function Tooltip({
  conteudo,
  children,
  lado = "top",
}: {
  conteudo: React.ReactNode;
  children: React.ReactNode;
  lado?: "top" | "bottom";
}) {
  return (
    <span className="group/tt relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute left-1/2 z-60 w-max max-w-56 -translate-x-1/2 rounded-lg bg-navy-900 px-2.5 py-1.5 text-[12px] leading-snug text-white opacity-0 shadow-[var(--shadow-pop)] transition-opacity duration-150 group-hover/tt:opacity-100 dark:bg-ice-100 dark:text-navy-900",
          lado === "top" ? "bottom-[calc(100%+6px)]" : "top-[calc(100%+6px)]",
        )}
      >
        {conteudo}
      </span>
    </span>
  );
}
