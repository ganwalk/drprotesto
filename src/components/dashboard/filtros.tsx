"use client";

import { FunnelSimple, X } from "@phosphor-icons/react";
import { Card, Button } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";

/** Barra de filtros padrão das telas de listagem. */
export function BarraFiltros({
  children,
  ativos = 0,
  aoLimpar,
  className,
}: {
  children: React.ReactNode;
  ativos?: number;
  aoLimpar?: () => void;
  className?: string;
}) {
  return (
    <Card className={cn("mb-4 p-4", className)}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-[12px] font-semibold tracking-wider text-fg-muted uppercase">
          <FunnelSimple size={14} weight="bold" />
          Filtros
          {ativos > 0 && (
            <span className="tnum rounded bg-accent px-1.5 py-0.5 text-[10.5px] text-accent-fg">
              {ativos}
            </span>
          )}
        </p>
        {ativos > 0 && aoLimpar && (
          <Button variant="ghost" size="sm" onClick={aoLimpar}>
            <X size={13} weight="bold" /> Limpar
          </Button>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">{children}</div>
    </Card>
  );
}

/** Rótulo curto acima de cada controle de filtro. */
export function CampoFiltro({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-[11.5px] font-medium text-fg-muted">{label}</span>
      {children}
    </label>
  );
}
