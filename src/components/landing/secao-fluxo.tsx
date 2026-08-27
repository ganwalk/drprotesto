"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Bank,
  Envelope,
  FileText,
  Gavel,
  Handshake,
  Stamp,
  WarningCircle,
} from "@phosphor-icons/react";
import { Secao, TituloSecao } from "./secao";
import { cn } from "@/lib/cn";

const ETAPAS = [
  {
    id: "emissao",
    numero: "01",
    icon: FileText,
    titulo: "Título na carteira",
    resumo: "Lançamento manual, importação em massa ou integração com o ERP.",
    detalhe:
      "O título entra com espécie (DMI, DSI, NP, CT), emissão, vencimento, valor e devedor vinculado à empresa credora. A partir daí, a régua daquele CNPJ assume o acompanhamento.",
    pontos: [
      "Importação por Excel/CSV com 23 colunas e template padrão",
      "Número CNJ na planilha cria e vincula o processo automaticamente",
      "Histórico de importações com desfazer em um clique",
    ],
  },
  {
    id: "aviso",
    numero: "02",
    icon: Envelope,
    titulo: "Régua de cobrança",
    resumo: "Avisos por e-mail e WhatsApp em cada fase, dentro da janela permitida.",
    detalhe:
      "Sete fases configuráveis, da emissão ao jurídico, cada uma com seu template e canal. Disparos respeitam dias da semana, janela de horário e bloqueio automático em domingos e feriados.",
    pontos: [
      "Variáveis como {{nome}}, {{valor_cobranca}} e {{link_pagamento}}",
      "Relatório de entregas com motivo de falha por destinatário",
      "Link PIX embutido na mensagem, com baixa conciliada",
    ],
  },
  {
    id: "preprotesto",
    numero: "03",
    icon: WarningCircle,
    titulo: "Pré-protesto",
    resumo: "Aviso formal antes da remessa, com prazo e valor atualizado.",
    detalhe:
      "Última janela amigável. O devedor recebe o comunicado de encaminhamento a cartório com o valor já corrigido pelo índice da empresa, multa e juros — e um caminho de pagamento imediato.",
    pontos: [
      "Correção por IGP-M, IPCA, INPC ou INCC-DI",
      "Multa e juros parametrizados por empresa",
      "Bloqueio individual de devedor para suspender a régua",
    ],
  },
  {
    id: "cenprot",
    numero: "04",
    icon: Stamp,
    titulo: "Remessa ao CENPROT",
    resumo: "Envio eletrônico ao tabelionato competente, com protocolo.",
    detalhe:
      "Os títulos elegíveis entram na fila de remessa e são transmitidos à rede CENPROT. O ambiente é alternável entre homologação e produção, com trava de segurança para o envio definitivo.",
    pontos: [
      "Acompanhamento por protocolo, cartório e UF",
      "Status de aguardando remessa, em cartório, devolvido e protestado",
      "Motivo de devolução registrado título a título",
    ],
  },
  {
    id: "acordo",
    numero: "05",
    icon: Handshake,
    titulo: "Acordo e assinatura",
    resumo: "Negociação com desconto, parcelamento e assinatura eletrônica.",
    detalhe:
      "Do funil de negociação à baixa do protesto. O PDF do acordo vai ao assinador externo e retorna assinado por webhook, disparando a mensagem de confirmação ao devedor.",
    pontos: [
      "Funil com nove estágios, incluindo os desvios",
      "Parcelas com baixa individual e reclassificação automática",
      "Descumprimento encaminha o caso ao jurídico",
    ],
  },
  {
    id: "juridico",
    numero: "06",
    icon: Gavel,
    titulo: "Cobrança judicial",
    resumo: "Processo com número CNJ, custas, movimentações e anexos.",
    detalhe:
      "Quando a via extrajudicial se esgota, o caso vira processo: comarca, vara, advogado responsável, prioridade e valor da causa, com linha do tempo de movimentações e peças anexadas.",
    pontos: [
      "Sete fases, de novo no jurídico a arquivado",
      "Cálculo oficial de correção pela API do TJDFT",
      "Cadastro de advogados (OAB) e testemunhas para os PDFs",
    ],
  },
  {
    id: "liquidacao",
    numero: "07",
    icon: Bank,
    titulo: "Liquidação e baixa",
    resumo: "Recebimento por PIX, conciliação no extrato e baixa do protesto.",
    detalhe:
      "O pagamento cai como crédito no extrato, liquida o título e habilita a solicitação de baixa do protesto — fechando o ciclo no mesmo lugar onde ele começou.",
    pontos: [
      "Cobrança por QR Code ou copia-e-cola, com validade",
      "Extrato exportável em PDF e Excel",
      "Controle de despesas de custas e emolumentos por empresa",
    ],
  },
];

export function SecaoFluxo() {
  const [ativa, setAtiva] = useState(0);
  const cardsRef = useRef<Array<HTMLDivElement | null>>([]);

  // Observa qual etapa está no centro da viewport durante o scroll natural
  // da página — a seção "acende" sozinha, sem depender de clique.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visiveis = entries.filter((e) => e.isIntersecting);
        if (visiveis.length === 0) return;
        // Em scrolls rápidos mais de um cartão pode cruzar a faixa central
        // no mesmo frame; fica o mais alto na tela (o próximo a ser lido).
        const topo = visiveis.reduce((a, b) =>
          a.boundingClientRect.top < b.boundingClientRect.top ? a : b,
        );
        const idx = Number(topo.target.getAttribute("data-idx"));
        if (!Number.isNaN(idx)) setAtiva(idx);
      },
      // Desconta a altura da nav fixa (64px) do topo e inclina a faixa de
      // gatilho para a região onde os olhos naturalmente pousam ao rolar.
      { rootMargin: "-140px 0px -55% 0px", threshold: 0 },
    );
    cardsRef.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const irPara = (i: number) => {
    setAtiva(i);
    const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    cardsRef.current[i]?.scrollIntoView({
      behavior: reduzido ? "auto" : "smooth",
      block: "center",
    });
  };

  return (
    <Secao id="fluxo" fundo="surface">
      <TituloSecao
        eyebrow="Como funciona"
        titulo="Sete etapas, um só registro do começo ao fim."
        descricao="O mesmo título carrega todo o seu histórico — cada aviso enviado, cada mudança de status, cada assinatura. Nada se perde entre planilhas e sistemas. Role para acompanhar."
      />

      <div className="mt-12 grid gap-6 lg:grid-cols-12 lg:items-start lg:gap-10">
        {/* Trilho de progresso — fixo, acompanha o scroll da lista ao lado */}
        <div className="hidden lg:sticky lg:top-24 lg:col-span-3 lg:block">
          <ol className="relative space-y-1 border-l border-line pl-6">
            {ETAPAS.map((e, i) => {
              const ativo = i === ativa;
              return (
                <li key={e.id}>
                  <button
                    onClick={() => irPara(i)}
                    aria-current={ativo}
                    className="group relative block w-full py-3 text-left"
                  >
                    <span
                      className={cn(
                        "absolute top-1/2 -left-[27px] size-2.5 -translate-y-1/2 rounded-full border-2 transition-colors",
                        ativo
                          ? "border-accent bg-accent"
                          : "border-line-strong bg-surface group-hover:border-fg-subtle",
                      )}
                    />
                    <span
                      className={cn(
                        "font-mono text-[11px] tracking-widest transition-colors",
                        ativo ? "text-accent" : "text-fg-subtle",
                      )}
                    >
                      {e.numero}
                    </span>
                    <span
                      className={cn(
                        "block text-[13.5px] font-medium transition-colors",
                        ativo ? "text-fg" : "text-fg-subtle group-hover:text-fg-muted",
                      )}
                    >
                      {e.titulo}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Lista vertical de etapas — cada bloco "acende" ao cruzar o centro da tela */}
        <div className="space-y-4 lg:col-span-9">
          {ETAPAS.map((e, i) => {
            const Icone = e.icon;
            const ativo = i === ativa;
            return (
              <div
                key={e.id}
                ref={(el) => {
                  cardsRef.current[i] = el;
                }}
                data-idx={i}
                onClick={() => setAtiva(i)}
                className={cn(
                  "min-h-[280px] cursor-pointer rounded-2xl border p-7 transition-all duration-300 sm:p-9",
                  ativo
                    ? "border-accent/40 bg-navy-900 shadow-[var(--shadow-pop)]"
                    : "border-line bg-bg opacity-70 hover:opacity-95",
                )}
              >
                <div className="flex items-start gap-4">
                  <span
                    className={cn(
                      "grid size-11 shrink-0 place-items-center rounded-xl transition-colors",
                      ativo ? "bg-white/10 text-white" : "bg-surface-2 text-fg-muted",
                    )}
                  >
                    <Icone size={21} weight={ativo ? "duotone" : "regular"} />
                  </span>
                  <div className="min-w-0">
                    <span
                      className={cn(
                        "font-mono text-[11.5px] tracking-widest",
                        ativo ? "text-steel-300" : "text-fg-subtle",
                      )}
                    >
                      ETAPA {e.numero}
                    </span>
                    <h3
                      className={cn(
                        "font-display mt-1 text-[20px] leading-tight font-semibold",
                        ativo ? "text-white" : "text-fg",
                      )}
                    >
                      {e.titulo}
                    </h3>
                    <p
                      className={cn(
                        "mt-1.5 text-[13.5px] leading-relaxed",
                        ativo ? "text-white/60" : "text-fg-muted",
                      )}
                    >
                      {e.resumo}
                    </p>
                  </div>
                </div>

                <div
                  className={cn(
                    "grid transition-[grid-template-rows] duration-300 ease-out",
                    ativo ? "mt-6 grid-rows-[1fr]" : "grid-rows-[0fr]",
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="border-t border-white/10 pt-6">
                      <p className="text-[14.5px] leading-relaxed text-white/80">{e.detalhe}</p>
                      <ul className="mt-5 space-y-3">
                        {e.pontos.map((p) => (
                          <li
                            key={p}
                            className="flex gap-3 text-[13px] leading-relaxed text-white/60"
                          >
                            <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-steel-300" />
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <button
            onClick={() => irPara(Math.min(ativa + 1, ETAPAS.length - 1))}
            disabled={ativa === ETAPAS.length - 1}
            className="hidden items-center gap-2 text-[13px] font-medium text-accent transition-opacity hover:underline disabled:hidden lg:inline-flex"
          >
            Próxima etapa
            <ArrowRight size={13} weight="bold" />
          </button>
        </div>
      </div>
    </Secao>
  );
}
