/* ------------------------------------------------------------------
   DR PROTESTO — modelo de domínio
   Reflete as entidades e fluxos de status descritos no mapeamento do
   sistema (títulos → protesto via CENPROT → acordo → jurídico).
------------------------------------------------------------------- */

/**
 * Data de referência do conjunto de dados de demonstração.
 *
 * O export é estático: o HTML é pré-renderizado no build e hidratado no
 * navegador. Ancorar "hoje" numa constante mantém o seed determinístico —
 * sem divergência entre build e visita, e sem números que mudam sozinhos.
 * Ao plugar o backend real esta constante deixa de ser usada.
 */
export const ANCHOR_DATE = new Date("2026-08-26T12:00:00-03:00");

export const hoje = () => new Date(ANCHOR_DATE);

export const addDays = (base: Date, days: number) =>
  new Date(base.getTime() + days * 86_400_000);

export const iso = (d: Date) => d.toISOString();

/* --------------------------------- Contas -------------------------------- */

export type Perfil = "MASTER" | "SUPERVISOR" | "OPERADOR" | "LEITURA";

export interface Conta {
  id: string;
  nome: string;
  documento: string;
  tipo: "MATRIZ" | "SUPERVISORA";
  matrizId?: string;
  plano: string;
  criadaEm: string;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  perfil: Perfil;
  contaId: string;
  empresasIds: string[];
  ultimoAcesso: string;
  ativo: boolean;
  permissoes: PermissoesCredor;
}

export interface PermissoesCredor {
  reguasProprias: boolean;
  inserirTitulo: boolean;
  gestaoEmpresas: boolean;
  consultas: boolean;
  financeiro: boolean;
  juridico: boolean;
  enviarProtesto: boolean;
  exportarDados: boolean;
}

export const PERMISSOES_LABELS: Record<keyof PermissoesCredor, string> = {
  reguasProprias: "Réguas próprias",
  inserirTitulo: "Inserir título",
  gestaoEmpresas: "Gestão de empresas",
  consultas: "Consultas",
  financeiro: "Financeiro / PIX",
  juridico: "Jurídico",
  enviarProtesto: "Enviar a protesto",
  exportarDados: "Exportar dados",
};

/* -------------------------------- Empresas ------------------------------- */

export interface Empresa {
  id: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  segmento: string;
  cidade: string;
  uf: string;
  email: string;
  telefone: string;
  ativa: boolean;
  criadaEm: string;
  /** Índice financeiro padrão usado na atualização monetária dos títulos. */
  indiceFinanceiro: IndiceFinanceiro;
  multaPercentual: number;
  jurosMensalPercentual: number;
  protestoAutomatico: boolean;
  diasParaProtesto: number;
}

export type IndiceFinanceiro = "IGPM" | "IPCA" | "INPC" | "INCC_DI" | "SELIC" | "NENHUM";

export const INDICES: Record<IndiceFinanceiro, { label: string; fonte: string }> = {
  IGPM: { label: "IGP-M", fonte: "FGV" },
  IPCA: { label: "IPCA", fonte: "IBGE" },
  INPC: { label: "INPC", fonte: "IBGE" },
  INCC_DI: { label: "INCC-DI", fonte: "FGV" },
  SELIC: { label: "SELIC", fonte: "BACEN" },
  NENHUM: { label: "Sem indexação", fonte: "—" },
};

/* -------------------------------- Devedores ------------------------------ */

export interface Devedor {
  id: string;
  nome: string;
  documento: string;
  tipo: "PF" | "PJ";
  email: string | null;
  telefone: string | null;
  whatsapp: string | null;
  cidade: string;
  uf: string;
  empresaId: string;
  bloqueado: boolean;
  observacao?: string;
  criadoEm: string;
}

/* --------------------------------- Títulos ------------------------------- */

export type TituloStatus =
  | "NO_PRAZO"
  | "PRE_PROTESTO"
  | "AGUARDANDO_REMESSA"
  | "EM_CARTORIO"
  | "DEVOLVIDO"
  | "PROTESTADO"
  | "JURIDICO"
  | "LIQUIDADO";

export const TITULO_FLOW: TituloStatus[] = [
  "NO_PRAZO",
  "PRE_PROTESTO",
  "AGUARDANDO_REMESSA",
  "EM_CARTORIO",
  "PROTESTADO",
  "JURIDICO",
];

/** Espécies aceitas pelo CENPROT para remessa de protesto. */
export type EspecieTitulo = "DMI" | "DSI" | "CBI" | "LCH" | "NP" | "CT" | "CH";

export const ESPECIES: Record<EspecieTitulo, string> = {
  DMI: "Duplicata Mercantil por Indicação",
  DSI: "Duplicata de Serviço por Indicação",
  CBI: "Cédula de Crédito Bancário",
  LCH: "Letra de Câmbio",
  NP: "Nota Promissória",
  CT: "Contrato",
  CH: "Cheque",
};

export interface Titulo {
  id: string;
  numero: string;
  empresaId: string;
  devedorId: string;
  especie: EspecieTitulo;
  valorOriginal: number;
  valorAtualizado: number;
  emissao: string;
  vencimento: string;
  status: TituloStatus;
  /** Preenchidos a partir da fase de remessa ao CENPROT. */
  protocoloCartorio: string | null;
  cartorio: string | null;
  ufCartorio: string | null;
  dataRemessa: string | null;
  dataProtesto: string | null;
  motivoDevolucao: string | null;
  acordoId: string | null;
  processoId: string | null;
  historico: EventoTitulo[];
}

export interface EventoTitulo {
  id: string;
  data: string;
  tipo: string;
  descricao: string;
  autor: string;
}

/* ---------------------------- Régua de cobrança -------------------------- */

export type FaseRegua =
  | "EMISSAO"
  | "ANTES_VENCIMENTO"
  | "DIA_VENCIMENTO"
  | "DEPOIS_VENCIMENTO"
  | "PRE_PROTESTO"
  | "PROTESTADO"
  | "JURIDICO";

export const FASES_REGUA: FaseRegua[] = [
  "EMISSAO",
  "ANTES_VENCIMENTO",
  "DIA_VENCIMENTO",
  "DEPOIS_VENCIMENTO",
  "PRE_PROTESTO",
  "PROTESTADO",
  "JURIDICO",
];

export const FASE_LABELS: Record<FaseRegua, string> = {
  EMISSAO: "Emissão",
  ANTES_VENCIMENTO: "Antes do vencimento",
  DIA_VENCIMENTO: "No dia do vencimento",
  DEPOIS_VENCIMENTO: "Depois do vencimento",
  PRE_PROTESTO: "Pré-protesto",
  PROTESTADO: "Protestado",
  JURIDICO: "Jurídico",
};

export type Canal = "EMAIL" | "WHATSAPP" | "SMS";

export interface PassoRegua {
  id: string;
  fase: FaseRegua;
  /** Deslocamento em dias relativo ao vencimento (negativo = antes). */
  offsetDias: number;
  canais: Canal[];
  templateEmailId: string | null;
  templateWhatsappId: string | null;
  ativo: boolean;
}

export interface Regua {
  id: string;
  nome: string;
  empresaId: string;
  ativa: boolean;
  passos: PassoRegua[];
  diasSemana: number[];
  horaInicio: string;
  horaFim: string;
  bloquearDomingos: boolean;
  bloquearFeriados: boolean;
  atualizadaEm: string;
}

export interface Template {
  id: string;
  nome: string;
  canal: Canal;
  assunto: string | null;
  corpo: string;
  fase: FaseRegua;
}

/** Variáveis interpoladas nos templates da régua. */
export const VARIAVEIS_TEMPLATE = [
  { chave: "{{nome}}", descricao: "Nome do devedor" },
  { chave: "{{primeiro_nome}}", descricao: "Primeiro nome do devedor" },
  { chave: "{{documento}}", descricao: "CPF/CNPJ do devedor" },
  { chave: "{{numero_titulo}}", descricao: "Número do título" },
  { chave: "{{valor_cobranca}}", descricao: "Valor atualizado da cobrança" },
  { chave: "{{vencimento}}", descricao: "Data de vencimento" },
  { chave: "{{dias_atraso}}", descricao: "Dias em atraso" },
  { chave: "{{fase}}", descricao: "Fase atual da régua" },
  { chave: "{{empresa}}", descricao: "Nome fantasia do credor" },
  { chave: "{{link_pagamento}}", descricao: "Link PIX de pagamento" },
] as const;

/* ---------------------------------- Avisos ------------------------------- */

export type AvisoStatus = "ENVIADO" | "ENTREGUE" | "LIDO" | "FALHA" | "AGENDADO";

export interface Aviso {
  id: string;
  tituloId: string;
  devedorId: string;
  empresaId: string;
  canal: Canal;
  fase: FaseRegua;
  status: AvisoStatus;
  destino: string;
  enviadoEm: string;
  erro: string | null;
  origem: "REGUA" | "MANUAL";
}

/* --------------------------------- Acordos ------------------------------- */

export type AcordoStatus =
  | "NEGOCIACAO"
  | "AGUARDANDO_ASSINATURA"
  | "FIRMADO"
  | "EM_CUMPRIMENTO"
  | "ATRASADO"
  | "CONCLUIDO"
  | "PROTESTO_BAIXADO"
  | "FIRMADO_EM_JUIZO"
  | "DESCUMPRIDO";

export const ACORDO_FUNIL: AcordoStatus[] = [
  "NEGOCIACAO",
  "AGUARDANDO_ASSINATURA",
  "FIRMADO",
  "EM_CUMPRIMENTO",
  "ATRASADO",
  "CONCLUIDO",
];

export const ACORDO_DESVIOS: AcordoStatus[] = [
  "PROTESTO_BAIXADO",
  "FIRMADO_EM_JUIZO",
  "DESCUMPRIDO",
];

export interface ParcelaAcordo {
  id: string;
  numero: number;
  vencimento: string;
  valor: number;
  pago: boolean;
  pagoEm: string | null;
}

export interface Acordo {
  id: string;
  codigo: string;
  empresaId: string;
  devedorId: string;
  titulosIds: string[];
  valorDivida: number;
  valorAcordo: number;
  descontoPercentual: number;
  entrada: number;
  parcelas: ParcelaAcordo[];
  status: AcordoStatus;
  criadoEm: string;
  assinadoEm: string | null;
  assinadorExterno: string | null;
  responsavel: string;
  observacao?: string;
}

/* ------------------------------- Jurídico -------------------------------- */

export type ProcessoStatus =
  | "NOVO"
  | "AGUARDANDO_CUSTAS"
  | "AGUARDANDO_PROTOCOLO"
  | "PROTOCOLADO"
  | "EM_DILIGENCIA"
  | "ACORDO_FIRMADO"
  | "ARQUIVADO";

export const PROCESSO_FLOW: ProcessoStatus[] = [
  "NOVO",
  "AGUARDANDO_CUSTAS",
  "AGUARDANDO_PROTOCOLO",
  "PROTOCOLADO",
  "EM_DILIGENCIA",
  "ACORDO_FIRMADO",
  "ARQUIVADO",
];

export type Prioridade = "BAIXA" | "MEDIA" | "ALTA" | "URGENTE";

export interface Movimentacao {
  id: string;
  data: string;
  titulo: string;
  descricao: string;
}

export interface Processo {
  id: string;
  numeroCNJ: string;
  empresaId: string;
  devedorId: string;
  titulosIds: string[];
  comarca: string;
  vara: string;
  advogadoId: string;
  prioridade: Prioridade;
  status: ProcessoStatus;
  valorCausa: number;
  custas: number;
  distribuidoEm: string | null;
  criadoEm: string;
  movimentacoes: Movimentacao[];
  anexos: { id: string; nome: string; tamanhoKb: number; enviadoEm: string }[];
}

export interface Advogado {
  id: string;
  nome: string;
  oab: string;
  ufOab: string;
  email: string;
  telefone: string;
  ativo: boolean;
}

export interface Testemunha {
  id: string;
  nome: string;
  documento: string;
  email: string | null;
  telefone: string | null;
}

/* ------------------------------- Financeiro ------------------------------ */

export type CobrancaStatus = "PENDENTE" | "PAGO" | "EXPIRADO" | "CANCELADO";

export interface CobrancaPix {
  id: string;
  codigo: string;
  empresaId: string;
  devedorId: string | null;
  tituloId: string | null;
  descricao: string;
  valor: number;
  status: CobrancaStatus;
  chave: string;
  criadaEm: string;
  expiraEm: string;
  pagoEm: string | null;
  copiaECola: string;
}

export interface ChavePix {
  id: string;
  tipo: "CNPJ" | "CPF" | "EMAIL" | "TELEFONE" | "ALEATORIA";
  valor: string;
  empresaId: string;
  principal: boolean;
}

export interface Favorito {
  id: string;
  nome: string;
  chave: string;
  banco: string;
  documento: string;
}

export type LancamentoTipo = "CREDITO" | "DEBITO";

export interface Lancamento {
  id: string;
  data: string;
  tipo: LancamentoTipo;
  categoria: string;
  descricao: string;
  contraparte: string;
  valor: number;
  saldo: number;
  empresaId: string;
}

export type DespesaStatus = "PAGA" | "PENDENTE" | "VENCIDA";

export interface Despesa {
  id: string;
  empresaId: string;
  categoria: string;
  descricao: string;
  fornecedor: string;
  valor: number;
  vencimento: string;
  status: DespesaStatus;
  comprovante: string | null;
}

/* -------------------------------- WhatsApp ------------------------------- */

export type TriagemStatus = "DEVEDOR" | "HUMANO" | "ENGAJOU" | "SEM_RESPOSTA";

export interface Mensagem {
  id: string;
  autor: "DEVEDOR" | "SISTEMA" | "OPERADOR";
  texto: string;
  enviadaEm: string;
  lida: boolean;
}

export interface Conversa {
  id: string;
  devedorId: string;
  empresaId: string;
  triagem: TriagemStatus;
  naoLidas: number;
  atualizadaEm: string;
  mensagens: Mensagem[];
}

/* ------------------------------- Importações ----------------------------- */

export interface Importacao {
  id: string;
  arquivo: string;
  linhas: number;
  sucesso: number;
  erros: number;
  importadoEm: string;
  autor: string;
  desfeita: boolean;
  empresaId: string;
}

/* ------------------------------- Integrações ----------------------------- */

export interface ConfigIntegracoes {
  cenprot: {
    ambiente: "HOMOLOGACAO" | "PRODUCAO";
    permitirProducao: boolean;
    cnpjApresentante: string;
    ultimaRemessa: string | null;
  };
  assinatura: {
    provedor: string;
    urlEnvio: string;
    webhookEntrada: string;
    secret: string;
    ativa: boolean;
    dispararWhatsappPosAssinatura: boolean;
  };
  whatsapp: {
    conectado: boolean;
    numero: string | null;
    pareadoEm: string | null;
  };
  tjdft: {
    ativa: boolean;
    motor: string;
  };
}

export interface ConfigMensagens {
  canais: Canal[];
  diasSemana: number[];
  horaInicio: string;
  horaFim: string;
  alertaNovosDevedores: boolean;
  protestoAutomatico: boolean;
}

/* ---------------------------- Consulta cadastral ------------------------- */

export interface ConsultaCadastral {
  documento: string;
  tipo: "PF" | "PJ";
  nome: string;
  situacao: string;
  dataAbertura?: string;
  nascimento?: string;
  naturezaJuridica?: string;
  cnaePrincipal?: string;
  capitalSocial?: number;
  endereco: string;
  cidade: string;
  uf: string;
  telefone: string | null;
  email: string | null;
  socios?: { nome: string; qualificacao: string }[];
  protestos: {
    cartorio: string;
    uf: string;
    quantidade: number;
    valorTotal: number;
    dataMaisAntiga: string;
  }[];
}
