"use client";

import { Badge } from "./primitives";
import type { StatusMeta } from "@/lib/status";

/** Exibe um status de domínio com o tom e a dica definidos em lib/status. */
export function StatusPill({
  meta,
  dot = true,
  className,
}: {
  meta: StatusMeta;
  dot?: boolean;
  className?: string;
}) {
  return (
    <Badge tone={meta.tone} dot={dot} title={meta.hint} className={className}>
      {meta.label}
    </Badge>
  );
}
