/**
 * Miniatura da aplicação exibida no hero.
 *
 * É marcação real — não uma imagem — para permanecer nítida em qualquer
 * densidade de tela e acompanhar o tema. Puramente decorativa.
 */
export function PreviewApp() {
  const barras = [38, 52, 44, 67, 58, 79, 71, 88, 76, 94];
  const linhas = [
    { nome: "Comercial Vértice Distribuidora", valor: "R$ 84.320", status: "Protestado", tom: "danger" },
    { nome: "Móveis Aurora Indústria", valor: "R$ 52.180", status: "Em cartório", tom: "accent" },
    { nome: "Rede Bonaparte Varejo", valor: "R$ 37.940", status: "Pré-protesto", tom: "warn" },
    { nome: "Casa & Sono Comércio", valor: "R$ 21.605", status: "Acordo firmado", tom: "ok" },
  ] as const;

  const tons = {
    danger: "bg-danger-soft text-danger",
    accent: "bg-accent-soft text-accent",
    warn: "bg-warn-soft text-warn",
    ok: "bg-ok-soft text-ok",
  };

  return (
    <div
      aria-hidden
      className="w-full overflow-hidden rounded-2xl border border-white/12 bg-surface shadow-[0_40px_90px_-30px_rgba(4,16,26,0.75)]"
    >
      {/* Barra de janela */}
      <div className="flex items-center gap-2 border-b border-line bg-surface-2 px-4 py-2.5">
        <span className="flex gap-1.5">
          <span className="size-2 rounded-full bg-line-strong" />
          <span className="size-2 rounded-full bg-line-strong" />
          <span className="size-2 rounded-full bg-line-strong" />
        </span>
        <span className="ml-2 truncate text-[10.5px] font-medium text-fg-subtle">
          drprotesto.com.br/dashboard
        </span>
      </div>

      <div className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[9.5px] font-semibold tracking-[0.16em] text-accent uppercase">
              Credor · Acompanhamento
            </p>
            <p className="font-display mt-0.5 text-[13px] font-semibold text-fg">
              Dashboard de títulos
            </p>
          </div>
          <span className="rounded-md bg-surface-2 px-2 py-1 text-[9.5px] font-medium text-fg-muted">
            Últimos 12 meses
          </span>
        </div>

        {/* KPIs */}
        <div className="mb-3 grid grid-cols-3 gap-2">
          {[
            { l: "Em aberto", v: "R$ 4,82 M" },
            { l: "Recuperado", v: "R$ 1,37 M" },
            { l: "Protestados", v: "218" },
          ].map((k) => (
            <div key={k.l} className="rounded-lg border border-line bg-surface-2/60 p-2.5">
              <p className="text-[8.5px] font-medium tracking-wider text-fg-subtle uppercase">
                {k.l}
              </p>
              <p className="tnum font-display mt-1 text-[13px] font-semibold text-fg">{k.v}</p>
            </div>
          ))}
        </div>

        {/* Gráfico */}
        <div className="mb-3 rounded-lg border border-line bg-surface-2/40 p-3">
          <div className="flex h-20 items-end gap-1.5">
            {barras.map((h, i) => (
              <span
                key={i}
                className="flex-1 rounded-sm"
                style={{
                  height: `${h}%`,
                  background:
                    i >= barras.length - 3
                      ? "var(--accent)"
                      : "color-mix(in srgb, var(--accent) 28%, transparent)",
                }}
              />
            ))}
          </div>
        </div>

        {/* Lista */}
        <div className="space-y-1">
          {linhas.map((l) => (
            <div
              key={l.nome}
              className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 odd:bg-surface-2/50"
            >
              <span className="truncate text-[10.5px] font-medium text-fg">{l.nome}</span>
              <span className="flex shrink-0 items-center gap-2">
                <span className="tnum text-[10.5px] text-fg-muted">{l.valor}</span>
                <span className={`rounded px-1.5 py-0.5 text-[8.5px] font-semibold ${tons[l.tom]}`}>
                  {l.status}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
