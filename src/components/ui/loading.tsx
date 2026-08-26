export function Carregando({ texto = "Carregando…" }: { texto?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-24">
      <span className="size-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      <p className="text-[13px] text-fg-muted">{texto}</p>
    </div>
  );
}
