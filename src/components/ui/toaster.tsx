"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { CheckCircle, Info, Warning, WarningCircle, X } from "@phosphor-icons/react";
import { useApp } from "@/store/app-store";
import { cn } from "@/lib/cn";

const ICONES = {
  ok: CheckCircle,
  danger: WarningCircle,
  warn: Warning,
  info: Info,
} as const;

const TONS = {
  ok: "text-ok",
  danger: "text-danger",
  warn: "text-warn",
  info: "text-accent",
} as const;

export function Toaster() {
  const { toasts, dispensarToast } = useApp();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div className="pointer-events-none fixed right-4 bottom-4 z-200 flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2">
      {toasts.map((t) => {
        const Icone = ICONES[t.tone];
        return (
          <div
            key={t.id}
            role="status"
            className="animate-fade-up pointer-events-auto flex items-start gap-3 rounded-xl border border-line bg-surface p-3.5 shadow-[var(--shadow-pop)]"
          >
            <Icone size={18} weight="fill" className={cn("mt-0.5 shrink-0", TONS[t.tone])} />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-fg">{t.titulo}</p>
              {t.descricao && (
                <p className="mt-0.5 text-[12.5px] leading-relaxed text-fg-muted">{t.descricao}</p>
              )}
            </div>
            <button
              onClick={() => dispensarToast(t.id)}
              aria-label="Fechar aviso"
              className="-mt-1 -mr-1 grid size-6 shrink-0 place-items-center rounded-md text-fg-subtle hover:bg-surface-2 hover:text-fg"
            >
              <X size={13} weight="bold" />
            </button>
          </div>
        );
      })}
    </div>,
    document.body,
  );
}
