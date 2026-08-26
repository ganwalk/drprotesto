"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CaretDoubleLeft, Question, SignOut } from "@phosphor-icons/react";
import { Logo, LogoMark } from "@/components/brand/logo";
import { NAV } from "./nav-config";
import { useApp } from "@/store/app-store";
import { useEscopo } from "@/store/selectors";
import { cn } from "@/lib/cn";
import { Tooltip } from "@/components/ui/overlay";

export function Sidebar({ onNavegar }: { onNavegar?: () => void }) {
  const pathname = usePathname();
  const { db, sidebarRecolhida, alternarSidebar, sair } = useApp();
  const titulos = useEscopo(db.titulos);
  const conversas = useEscopo(db.conversas);
  const acordos = useEscopo(db.acordos);

  const contadores = {
    titulosProtesto: titulos.filter((t) => t.status === "AGUARDANDO_REMESSA").length,
    conversasNaoLidas: conversas.reduce((s, c) => s + c.naoLidas, 0),
    acordosAssinatura: acordos.filter((a) => a.status === "AGUARDANDO_ASSINATURA").length,
  };

  // Só o item de rota mais específica fica marcado: "/dashboard/pix" não
  // acende junto com "/dashboard/pix/configurar-link".
  const rotaAtual = pathname.replace(/\/$/, "") || "/dashboard";
  const melhorMatch = NAV.flatMap((g) => g.itens)
    .map((i) => i.href)
    .filter((href) => rotaAtual === href || rotaAtual.startsWith(`${href}/`))
    .sort((a, b) => b.length - a.length)[0];
  const ativo = (href: string) => href === melhorMatch;

  const recolhida = sidebarRecolhida;

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-line bg-surface transition-[width] duration-200",
        recolhida ? "w-[68px]" : "w-[248px]",
      )}
    >
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-line",
          recolhida ? "justify-center px-2" : "justify-between px-4",
        )}
      >
        <Link href="/" aria-label="DR PROTESTO — início">
          {recolhida ? <LogoMark size={30} /> : <Logo size={30} subtitulo={false} />}
        </Link>
        {!recolhida && (
          <button
            onClick={alternarSidebar}
            aria-label="Recolher menu"
            className="hidden size-7 place-items-center rounded-md text-fg-subtle transition-colors hover:bg-surface-2 hover:text-fg lg:grid"
          >
            <CaretDoubleLeft size={14} weight="bold" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-2.5 py-4">
        {NAV.map((grupo) => (
          <div key={grupo.titulo} className="mb-5 last:mb-0">
            {!recolhida && (
              <p className="mb-1.5 px-2.5 text-[10.5px] font-semibold tracking-[0.12em] text-fg-subtle uppercase">
                {grupo.titulo}
              </p>
            )}
            {recolhida && <div className="mx-2 mb-2 h-px bg-line" />}
            <ul className="space-y-0.5">
              {grupo.itens.map((item) => {
                const Icone = item.icon;
                const estaAtivo = ativo(item.href);
                const contador = item.badge ? contadores[item.badge] : 0;

                const conteudo = (
                  <Link
                    href={item.href}
                    onClick={onNavegar}
                    className={cn(
                      "group relative flex items-center gap-2.5 rounded-lg text-[13px] font-medium transition-colors",
                      recolhida ? "justify-center px-2 py-2.5" : "px-2.5 py-2",
                      estaAtivo
                        ? "bg-accent-soft text-accent"
                        : "text-fg-muted hover:bg-surface-2 hover:text-fg",
                    )}
                  >
                    {estaAtivo && (
                      <span className="absolute top-1/2 -left-2.5 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-accent" />
                    )}
                    <Icone
                      size={17}
                      weight={estaAtivo ? "fill" : "regular"}
                      className="shrink-0"
                    />
                    {!recolhida && <span className="min-w-0 flex-1 truncate">{item.label}</span>}
                    {contador > 0 &&
                      (recolhida ? (
                        <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-accent" />
                      ) : (
                        <span className="tnum shrink-0 rounded bg-accent px-1.5 py-0.5 text-[10.5px] font-semibold text-accent-fg">
                          {contador}
                        </span>
                      ))}
                  </Link>
                );

                return (
                  <li key={item.href}>
                    {recolhida ? (
                      <Tooltip conteudo={item.label} lado="bottom">
                        {conteudo}
                      </Tooltip>
                    ) : (
                      conteudo
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-line p-2.5">
        {recolhida ? (
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={alternarSidebar}
              aria-label="Expandir menu"
              className="grid size-9 place-items-center rounded-lg text-fg-subtle hover:bg-surface-2 hover:text-fg"
            >
              <CaretDoubleLeft size={14} weight="bold" className="rotate-180" />
            </button>
          </div>
        ) : (
          <div className="space-y-0.5">
            <Link
              href="/dashboard/ajuda"
              onClick={onNavegar}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
            >
              <Question size={17} />
              Ajuda e manuais
            </Link>
            <button
              onClick={sair}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-fg-muted transition-colors hover:bg-danger-soft hover:text-danger"
            >
              <SignOut size={17} />
              Sair da conta
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
