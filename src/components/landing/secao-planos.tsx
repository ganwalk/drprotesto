import Link from "next/link";
import { Check, Minus } from "@phosphor-icons/react/dist/ssr";
import { Secao, TituloSecao } from "./secao";
import { cn } from "@/lib/cn";

const PLANOS = [
  {
    nome: "Essencial",
    preco: "R$ 890",
    periodo: "/mês por CNPJ",
    resumo: "Para quem está trocando a planilha por um processo de cobrança de verdade.",
    destaque: false,
    itens: [
      { texto: "Até 1.500 títulos ativos", incluso: true },
      { texto: "Régua de cobrança por e-mail", incluso: true },
      { texto: "Cobrança PIX com QR Code", incluso: true },
      { texto: "Relatório de avisos e exportações", incluso: true },
      { texto: "Remessa ao CENPROT", incluso: false },
      { texto: "Módulo jurídico e processos", incluso: false },
    ],
  },
  {
    nome: "Protesto",
    preco: "R$ 2.400",
    periodo: "/mês por CNPJ",
    resumo: "O fluxo completo até o cartório, com acordos assinados digitalmente.",
    destaque: true,
    itens: [
      { texto: "Títulos ativos ilimitados", incluso: true },
      { texto: "Régua com e-mail e WhatsApp", incluso: true },
      { texto: "Remessa e acompanhamento CENPROT", incluso: true },
      { texto: "Acordos com assinatura eletrônica", incluso: true },
      { texto: "Calculadora monetária TJDFT", incluso: true },
      { texto: "Módulo jurídico e processos", incluso: false },
    ],
  },
  {
    nome: "Corporativo",
    preco: "Sob consulta",
    periodo: "multiempresa",
    resumo: "Conta matriz, várias operações e o jurídico dentro do mesmo registro.",
    destaque: false,
    itens: [
      { texto: "Tudo do plano Protesto", incluso: true },
      { texto: "Contas supervisoras e permissões finas", incluso: true },
      { texto: "Módulo jurídico completo", incluso: true },
      { texto: "Importação em massa e conectores de ERP", incluso: true },
      { texto: "Ambiente de homologação dedicado", incluso: true },
      { texto: "Gerente de conta e SLA contratual", incluso: true },
    ],
  },
];

export function SecaoPlanos() {
  return (
    <Secao id="planos" fundo="surface">
      <TituloSecao
        eyebrow="Planos"
        titulo="Preço por CNPJ, sem comissão sobre o que você recupera."
        descricao="A plataforma não fica com percentual da sua carteira. O que entra de volta é seu."
        alinhamento="center"
      />

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {PLANOS.map((p) => (
          <div
            key={p.nome}
            className={cn(
              "relative flex flex-col rounded-2xl border p-7",
              p.destaque
                ? "border-navy-900 bg-navy-900 text-white shadow-[var(--shadow-lift)] dark:border-steel-500"
                : "border-line bg-bg",
            )}
          >
            {p.destaque && (
              <span className="absolute -top-3 left-7 rounded-full bg-steel-400 px-3 py-1 text-[11px] font-semibold tracking-wide text-navy-950 uppercase">
                Mais contratado
              </span>
            )}

            <p
              className={cn(
                "font-display text-[15px] font-semibold",
                p.destaque ? "text-white" : "text-fg",
              )}
            >
              {p.nome}
            </p>
            <p
              className={cn(
                "mt-1 text-[13px] leading-relaxed",
                p.destaque ? "text-white/60" : "text-fg-muted",
              )}
            >
              {p.resumo}
            </p>

            <div className="mt-6 flex items-baseline gap-1.5">
              <span
                className={cn(
                  "tnum font-display text-[30px] leading-none font-semibold",
                  p.destaque ? "text-white" : "text-fg",
                )}
              >
                {p.preco}
              </span>
              <span className={cn("text-[13px]", p.destaque ? "text-white/50" : "text-fg-subtle")}>
                {p.periodo}
              </span>
            </div>

            <ul className="mt-7 flex-1 space-y-3">
              {p.itens.map((i) => (
                <li key={i.texto} className="flex items-start gap-2.5 text-[13.5px]">
                  {i.incluso ? (
                    <Check
                      size={15}
                      weight="bold"
                      className={cn("mt-0.5 shrink-0", p.destaque ? "text-steel-300" : "text-accent")}
                    />
                  ) : (
                    <Minus
                      size={15}
                      weight="bold"
                      className={cn("mt-0.5 shrink-0", p.destaque ? "text-white/25" : "text-fg-subtle")}
                    />
                  )}
                  <span
                    className={cn(
                      "leading-snug",
                      i.incluso
                        ? p.destaque
                          ? "text-white/85"
                          : "text-fg"
                        : p.destaque
                          ? "text-white/35"
                          : "text-fg-subtle",
                    )}
                  >
                    {i.texto}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              href="/dashboard"
              className={cn(
                "mt-7 inline-flex h-11 items-center justify-center rounded-lg text-[14px] font-semibold transition-colors",
                p.destaque
                  ? "bg-white text-navy-900 hover:bg-ice-100"
                  : "bg-accent text-accent-fg hover:bg-accent-hover",
              )}
            >
              {p.preco === "Sob consulta" ? "Falar com o time" : "Começar agora"}
            </Link>
          </div>
        ))}
      </div>

      <p className="mt-8 text-center text-[12.5px] text-fg-subtle">
        Emolumentos cartorários e custas processuais são cobrados pelos respectivos órgãos e
        repassados sem acréscimo.
      </p>
    </Secao>
  );
}
