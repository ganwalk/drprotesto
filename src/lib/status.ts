import type {
  AcordoStatus,
  AvisoStatus,
  CobrancaStatus,
  DespesaStatus,
  Prioridade,
  ProcessoStatus,
  TituloStatus,
  TriagemStatus,
} from "./domain";

export type Tone = "neutral" | "info" | "ok" | "warn" | "danger" | "accent";

export interface StatusMeta {
  label: string;
  tone: Tone;
  /** Descrição curta usada em tooltips e legendas de funil. */
  hint?: string;
}

export const TITULO_STATUS: Record<TituloStatus, StatusMeta> = {
  NO_PRAZO: { label: "No prazo", tone: "neutral", hint: "Título ainda não vencido" },
  PRE_PROTESTO: {
    label: "Pré-protesto",
    tone: "warn",
    hint: "Vencido, em régua de cobrança antes da remessa",
  },
  AGUARDANDO_REMESSA: {
    label: "Aguardando remessa",
    tone: "info",
    hint: "Na fila de envio ao CENPROT",
  },
  EM_CARTORIO: {
    label: "Em cartório",
    tone: "accent",
    hint: "Em andamento no tabelionato de protesto",
  },
  DEVOLVIDO: { label: "Devolvido", tone: "danger", hint: "Recusado pelo cartório" },
  PROTESTADO: { label: "Protestado", tone: "danger", hint: "Protesto lavrado" },
  JURIDICO: { label: "Jurídico", tone: "warn", hint: "Encaminhado para cobrança judicial" },
  LIQUIDADO: { label: "Liquidado", tone: "ok", hint: "Dívida quitada" },
};

export const ACORDO_STATUS: Record<AcordoStatus, StatusMeta> = {
  NEGOCIACAO: { label: "Negociação", tone: "neutral", hint: "Proposta em construção" },
  AGUARDANDO_ASSINATURA: {
    label: "Aguardando assinatura",
    tone: "info",
    hint: "Documento enviado ao assinador digital",
  },
  FIRMADO: { label: "Firmado", tone: "accent", hint: "Assinado por todas as partes" },
  EM_CUMPRIMENTO: { label: "Em cumprimento", tone: "ok", hint: "Parcelas em dia" },
  ATRASADO: { label: "Atrasado", tone: "warn", hint: "Parcela vencida e não paga" },
  CONCLUIDO: { label: "Concluído", tone: "ok", hint: "Acordo integralmente cumprido" },
  PROTESTO_BAIXADO: { label: "Protesto baixado", tone: "ok", hint: "Baixa averbada em cartório" },
  FIRMADO_EM_JUIZO: { label: "Firmado em juízo", tone: "accent", hint: "Homologado judicialmente" },
  DESCUMPRIDO: { label: "Descumprido", tone: "danger", hint: "Encaminhado ao jurídico" },
};

export const PROCESSO_STATUS: Record<ProcessoStatus, StatusMeta> = {
  NOVO: { label: "Novo no jurídico", tone: "neutral" },
  AGUARDANDO_CUSTAS: { label: "Aguardando custas", tone: "warn" },
  AGUARDANDO_PROTOCOLO: { label: "Aguardando protocolo", tone: "info" },
  PROTOCOLADO: { label: "Protocolado", tone: "accent" },
  EM_DILIGENCIA: { label: "Em diligência", tone: "info" },
  ACORDO_FIRMADO: { label: "Acordo firmado", tone: "ok" },
  ARQUIVADO: { label: "Arquivado", tone: "neutral" },
};

export const AVISO_STATUS: Record<AvisoStatus, StatusMeta> = {
  ENVIADO: { label: "Enviado", tone: "info" },
  ENTREGUE: { label: "Entregue", tone: "ok" },
  LIDO: { label: "Lido", tone: "ok" },
  FALHA: { label: "Falha", tone: "danger" },
  AGENDADO: { label: "Agendado", tone: "neutral" },
};

export const COBRANCA_STATUS: Record<CobrancaStatus, StatusMeta> = {
  PENDENTE: { label: "Pendente", tone: "warn" },
  PAGO: { label: "Pago", tone: "ok" },
  EXPIRADO: { label: "Expirado", tone: "neutral" },
  CANCELADO: { label: "Cancelado", tone: "danger" },
};

export const DESPESA_STATUS: Record<DespesaStatus, StatusMeta> = {
  PAGA: { label: "Paga", tone: "ok" },
  PENDENTE: { label: "Pendente", tone: "warn" },
  VENCIDA: { label: "Vencida", tone: "danger" },
};

export const PRIORIDADE_STATUS: Record<Prioridade, StatusMeta> = {
  BAIXA: { label: "Baixa", tone: "neutral" },
  MEDIA: { label: "Média", tone: "info" },
  ALTA: { label: "Alta", tone: "warn" },
  URGENTE: { label: "Urgente", tone: "danger" },
};

export const TRIAGEM_STATUS: Record<TriagemStatus, StatusMeta> = {
  DEVEDOR: { label: "Devedores", tone: "neutral" },
  HUMANO: { label: "Humano", tone: "warn" },
  ENGAJOU: { label: "Engajou", tone: "ok" },
  SEM_RESPOSTA: { label: "Sem resposta", tone: "neutral" },
};

export const CANAL_LABELS: Record<string, string> = {
  EMAIL: "E-mail",
  WHATSAPP: "WhatsApp",
  SMS: "SMS",
};

export const DIAS_SEMANA = [
  { valor: 0, curto: "D", label: "Domingo" },
  { valor: 1, curto: "S", label: "Segunda" },
  { valor: 2, curto: "T", label: "Terça" },
  { valor: 3, curto: "Q", label: "Quarta" },
  { valor: 4, curto: "Q", label: "Quinta" },
  { valor: 5, curto: "S", label: "Sexta" },
  { valor: 6, curto: "S", label: "Sábado" },
];

/** Cor CSS correspondente a cada tom — usada nos gráficos. */
export const TONE_CSS: Record<Tone, string> = {
  neutral: "var(--fg-subtle)",
  info: "var(--info)",
  ok: "var(--ok)",
  warn: "var(--warn)",
  danger: "var(--danger)",
  accent: "var(--accent)",
};

/**
 * Paleta de gráfico por status de título.
 *
 * Os tons semânticos das pílulas repetem cores de propósito (dois vermelhos
 * para devolvido e protestado, por exemplo). Num donut isso confunde, então
 * o gráfico usa uma escala própria em que cada fatia é distinguível.
 */
export const TITULO_COR: Record<TituloStatus, string> = {
  NO_PRAZO: "#8a8580",
  PRE_PROTESTO: "#d7a13a",
  AGUARDANDO_REMESSA: "#8fa39c",
  EM_CARTORIO: "#6b3540",
  DEVOLVIDO: "#8d5fa8",
  PROTESTADO: "#b3402f",
  JURIDICO: "#c4703a",
  LIQUIDADO: "#14724f",
};
