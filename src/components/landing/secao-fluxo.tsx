"use client";

import { useState } from "react";
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
  const etapa = ETAPAS[ativa];
  const Icone = etapa.icon;

  return (
    <Secao id="fluxo" fundo="surface">
      <TituloSecao
        eyebrow="Como funciona"
        titulo="Sete etapas, um só registro do começo ao fim."
        descricao="O mesmo título carrega todo o seu histórico — cada aviso enviado, cada mudança de status, cada assinatura. Nada se perde entre planilhas e sistemas."
      />

      {/* Trilho de etapas */}
      <div className="mt-12 overflow-x-auto pb-2">
        <div className="flex min-w-max items-center gap-2">
          {ETAPAS.map((e, i) => {
            const EtapaIcone = e.icon;
            const ativo = i === ativa;
            return (
              <div key={e.id} className="flex items-center gap-2">
                <button
                  onClick={() => setAtiva(i)}
                  aria-pressed={ativo}
                  className={cn(
                    "group flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 transition-all duration-200",
                    ativo
                      ? "border-accent bg-accent text-accent-fg shadow-[var(--shadow-card)]"
                      : "border-line bg-bg text-fg-muted hover:border-line-strong hover:text-fg",
                  )}
                >
                  <EtapaIcone size={17} weight={ativo ? "fill" : "duotone"} />
                  <span className="text-[13px] font-medium whitespace-nowrap">{e.titulo}</span>
                </button>
                {i < ETAPAS.length - 1 && (
                  <ArrowRight
                    size={13}
                    weight="bold"
                    className={cn(
                      "shrink-0 transition-colors",
                      i < ativa ? "text-accent" : "text-line-strong",
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detalhe da etapa */}
      <div className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-line bg-line lg:grid-cols-12">
        <div className="bg-navy-900 p-8 lg:col-span-5 lg:p-10">
          <span className="font-mono text-[12px] tracking-widest text-steel-300">
            ETAPA {etapa.numero}
          </span>
          <span className="mt-6 grid size-12 place-items-center rounded-xl bg-white/10 text-white">
            <Icone size={24} weight="duotone" />
          </span>
          <h3 className="font-display mt-5 text-[22px] leading-tight font-semibold text-white">
            {etapa.titulo}
          </h3>
          <p className="mt-3 text-[14px] leading-relaxed text-white/60">{etapa.resumo}</p>
        </div>

        <div className="bg-surface p-8 lg:col-span-7 lg:p-10">
          <p className="text-[15px] leading-relaxed text-fg">{etapa.detalhe}</p>
          <ul className="mt-7 space-y-3.5">
            {etapa.pontos.map((p) => (
              <li key={p} className="flex gap-3 text-[13.5px] leading-relaxed text-fg-muted">
                <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-accent" />
                {p}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex items-center gap-3 border-t border-line pt-6">
            <button
              onClick={() => setAtiva((a) => Math.max(0, a - 1))}
              disabled={ativa === 0}
              className="rounded-lg border border-line px-3.5 py-2 text-[13px] font-medium text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              onClick={() => setAtiva((a) => Math.min(ETAPAS.length - 1, a + 1))}
              disabled={ativa === ETAPAS.length - 1}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-3.5 py-2 text-[13px] font-medium text-accent-fg transition-colors hover:bg-accent-hover disabled:opacity-40"
            >
              Próxima etapa
              <ArrowRight size={13} weight="bold" />
            </button>
            <span className="tnum ml-auto text-[12.5px] text-fg-subtle">
              {ativa + 1} / {ETAPAS.length}
            </span>
          </div>
        </div>
      </div>
    </Secao>
  );
}
