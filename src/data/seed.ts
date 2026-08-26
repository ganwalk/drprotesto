import {
  ACORDO_DESVIOS,
  ACORDO_FUNIL,
  ANCHOR_DATE,
  addDays,
  ESPECIES,
  FASE_LABELS,
  FASES_REGUA,
  iso,
  PROCESSO_FLOW,
  type Acordo,
  type AcordoStatus,
  type Advogado,
  type Aviso,
  type AvisoStatus,
  type Canal,
  type ChavePix,
  type CobrancaPix,
  type CobrancaStatus,
  type ConfigIntegracoes,
  type ConfigMensagens,
  type Conta,
  type Conversa,
  type Despesa,
  type Devedor,
  type Empresa,
  type EspecieTitulo,
  type Favorito,
  type FaseRegua,
  type Importacao,
  type Lancamento,
  type ParcelaAcordo,
  type Prioridade,
  type Processo,
  type ProcessoStatus,
  type Regua,
  type Template,
  type Testemunha,
  type Titulo,
  type TituloStatus,
  type TriagemStatus,
  type Usuario,
} from "@/lib/domain";
import {
  BANCOS,
  CARGOS,
  CARTORIOS,
  CATEGORIAS_DESPESA,
  CIDADES,
  COMARCAS,
  ERROS_AVISO,
  FORNECEDORES,
  MOTIVOS_DEVOLUCAO,
  MOVIMENTACOES,
  MSG_DEVEDOR,
  MSG_OPERADOR,
  MSG_SISTEMA,
  NOMES_PF,
  NOMES_PJ,
  SUFIXOS_PJ,
  VARAS,
} from "./pools";
import {
  createRng,
  gerarCNJ,
  gerarCNPJ,
  gerarCopiaECola,
  gerarCPF,
  gerarTelefone,
  slugEmail,
  type Rng,
} from "./rng";

export interface Database {
  contaMatriz: Conta;
  contaSupervisora: Conta;
  usuarioAtual: Usuario;
  usuarios: Usuario[];
  empresas: Empresa[];
  devedores: Devedor[];
  titulos: Titulo[];
  avisos: Aviso[];
  reguas: Regua[];
  templates: Template[];
  acordos: Acordo[];
  processos: Processo[];
  advogados: Advogado[];
  testemunhas: Testemunha[];
  cobrancas: CobrancaPix[];
  chavesPix: ChavePix[];
  favoritos: Favorito[];
  lancamentos: Lancamento[];
  despesas: Despesa[];
  conversas: Conversa[];
  importacoes: Importacao[];
  integracoes: ConfigIntegracoes;
  configMensagens: ConfigMensagens;
}

const HOJE = ANCHOR_DATE;

const EMPRESAS_BASE = [
  {
    razaoSocial: "Colchões Aurora Indústria e Comércio",
    nomeFantasia: "Aurora Colchões",
    segmento: "Indústria de colchões",
    cidade: "São Bernardo do Campo",
    uf: "SP",
  },
  {
    razaoSocial: "Espumas Meridiano Indústria",
    nomeFantasia: "Meridiano Espumas",
    segmento: "Indústria de espumas técnicas",
    cidade: "Contagem",
    uf: "MG",
  },
  {
    razaoSocial: "Sonno Vitta Manufatura de Colchões",
    nomeFantasia: "Sonno Vitta",
    segmento: "Indústria de colchões",
    cidade: "Joinville",
    uf: "SC",
  },
  {
    razaoSocial: "Poliuretanos Cordilheira Indústria",
    nomeFantasia: "Cordilheira Poliuretanos",
    segmento: "Transformação de poliuretano",
    cidade: "Caxias do Sul",
    uf: "RS",
  },
];

function buildEmpresas(rng: Rng): Empresa[] {
  return EMPRESAS_BASE.map((base, i) => ({
    id: `emp_${i + 1}`,
    ...base,
    cnpj: gerarCNPJ(rng),
    email: `financeiro@${base.nomeFantasia.toLowerCase().replace(/\s+/g, "")}.com.br`,
    telefone: gerarTelefone(rng),
    ativa: true,
    criadaEm: iso(addDays(HOJE, -rng.int(400, 1600))),
    indiceFinanceiro: rng.pick(["IGPM", "IPCA", "INPC"] as const),
    multaPercentual: rng.pick([2, 2, 10]),
    jurosMensalPercentual: rng.pick([1, 1, 1.5]),
    protestoAutomatico: i !== 3,
    diasParaProtesto: rng.pick([15, 20, 30, 30]),
  }));
}

function buildContas(rng: Rng): { matriz: Conta; supervisora: Conta } {
  const matriz: Conta = {
    id: "conta_matriz",
    nome: "Grupo Aurora Participações",
    documento: gerarCNPJ(rng),
    tipo: "MATRIZ",
    plano: "Enterprise",
    criadaEm: iso(addDays(HOJE, -1580)),
  };
  const supervisora: Conta = {
    id: "conta_sup_1",
    nome: "Recuperação de Crédito — Corporativo",
    documento: gerarCNPJ(rng),
    tipo: "SUPERVISORA",
    matrizId: matriz.id,
    plano: "Master",
    criadaEm: iso(addDays(HOJE, -940)),
  };
  return { matriz, supervisora };
}

const PERM_TOTAL = {
  reguasProprias: true,
  inserirTitulo: true,
  gestaoEmpresas: true,
  consultas: true,
  financeiro: true,
  juridico: true,
  enviarProtesto: true,
  exportarDados: true,
};

function buildUsuarios(rng: Rng, empresas: Empresa[], contaId: string): Usuario[] {
  const supervisor: Usuario = {
    id: "usr_1",
    nome: "Helena Portugal Drummond",
    email: "helena.drummond@grupoaurora.com.br",
    cargo: "Supervisora de recuperação de crédito",
    perfil: "MASTER",
    contaId,
    empresasIds: empresas.map((e) => e.id),
    ultimoAcesso: iso(addDays(HOJE, 0)),
    ativo: true,
    permissoes: { ...PERM_TOTAL },
  };

  const outros: Usuario[] = NOMES_PF.slice(0, 9).map((nome, i) => {
    const empresasDoUsuario = rng.bool(0.3)
      ? empresas.map((e) => e.id)
      : rng.picks(empresas.map((e) => e.id), rng.int(1, 2));
    const perfil = rng.weighted<Usuario["perfil"]>([
      ["OPERADOR", 6],
      ["SUPERVISOR", 2],
      ["LEITURA", 1],
    ]);
    return {
      id: `usr_${i + 2}`,
      nome,
      email: slugEmail(nome, "grupoaurora.com.br"),
      cargo: rng.pick(CARGOS),
      perfil,
      contaId,
      empresasIds: empresasDoUsuario,
      ultimoAcesso: iso(addDays(HOJE, -rng.int(0, 26))),
      ativo: rng.bool(0.88),
      permissoes: {
        reguasProprias: perfil !== "LEITURA" && rng.bool(0.6),
        inserirTitulo: perfil !== "LEITURA",
        gestaoEmpresas: perfil === "SUPERVISOR",
        consultas: rng.bool(0.8),
        financeiro: perfil === "SUPERVISOR" || rng.bool(0.3),
        juridico: rng.bool(0.45),
        enviarProtesto: perfil === "SUPERVISOR" || rng.bool(0.35),
        exportarDados: rng.bool(0.7),
      },
    };
  });

  return [supervisor, ...outros];
}

function buildDevedores(rng: Rng, empresas: Empresa[]): Devedor[] {
  const devedores: Devedor[] = [];
  const total = 148;
  for (let i = 0; i < total; i++) {
    const tipo: Devedor["tipo"] = rng.bool(0.45) ? "PJ" : "PF";
    const nome =
      tipo === "PJ"
        ? `${NOMES_PJ[i % NOMES_PJ.length]} ${rng.pick(SUFIXOS_PJ)}`
        : NOMES_PF[i % NOMES_PF.length];
    const [cidade, uf] = rng.pick(CIDADES);
    const semEmail = rng.bool(0.09);
    const semTelefone = rng.bool(0.07);
    const telefone = semTelefone ? null : gerarTelefone(rng);
    devedores.push({
      id: `dev_${i + 1}`,
      nome,
      documento: tipo === "PJ" ? gerarCNPJ(rng) : gerarCPF(rng),
      tipo,
      email: semEmail
        ? null
        : slugEmail(nome, tipo === "PJ" ? "corp.com.br" : "email.com.br"),
      telefone,
      whatsapp: telefone && rng.bool(0.85) ? telefone : null,
      cidade,
      uf,
      empresaId: rng.pick(empresas).id,
      bloqueado: rng.bool(0.05),
      criadoEm: iso(addDays(HOJE, -rng.int(30, 900))),
    });
  }
  return devedores;
}

const STATUS_PESOS: Array<[TituloStatus, number]> = [
  ["NO_PRAZO", 22],
  ["PRE_PROTESTO", 16],
  ["AGUARDANDO_REMESSA", 9],
  ["EM_CARTORIO", 12],
  ["PROTESTADO", 14],
  ["DEVOLVIDO", 5],
  ["JURIDICO", 8],
  ["LIQUIDADO", 14],
];

/** Dias de atraso plausíveis para cada estágio do fluxo de protesto. */
const ATRASO_POR_STATUS: Record<TituloStatus, [number, number]> = {
  NO_PRAZO: [-75, -1],
  PRE_PROTESTO: [1, 29],
  AGUARDANDO_REMESSA: [25, 55],
  EM_CARTORIO: [35, 150],
  DEVOLVIDO: [45, 330],
  PROTESTADO: [60, 640],
  JURIDICO: [120, 700],
  LIQUIDADO: [10, 660],
};

function buildTitulos(rng: Rng, empresas: Empresa[], devedores: Devedor[]): Titulo[] {
  const titulos: Titulo[] = [];
  const especies = Object.keys(ESPECIES) as EspecieTitulo[];
  let contador = 24801;

  for (const devedor of devedores) {
    const empresa = empresas.find((e) => e.id === devedor.empresaId)!;
    const qtd = rng.weighted<number>([[1, 5], [2, 4], [3, 3], [4, 2], [5, 1], [7, 1]]);

    for (let k = 0; k < qtd; k++) {
      const status = rng.weighted(STATUS_PESOS);
      const [minAtraso, maxAtraso] = ATRASO_POR_STATUS[status];
      const atraso = rng.int(minAtraso, maxAtraso);
      const vencimento = addDays(HOJE, -atraso);
      const emissao = addDays(vencimento, -rng.int(20, 75));
      const valorOriginal = rng.float(
        devedor.tipo === "PJ" ? 1800 : 320,
        devedor.tipo === "PJ" ? 78000 : 9500,
      );

      const diasAtraso = Math.max(0, atraso);
      const encargos =
        diasAtraso > 0
          ? valorOriginal *
            (empresa.multaPercentual / 100 +
              (empresa.jurosMensalPercentual / 100) * (diasAtraso / 30))
          : 0;
      const valorAtualizado = Number((valorOriginal + encargos).toFixed(2));

      const emCartorio = ["EM_CARTORIO", "PROTESTADO", "DEVOLVIDO"].includes(status);
      const [, ufCartorio] = [devedor.cidade, devedor.uf];

      const id = `tit_${titulos.length + 1}`;
      const historico = buildHistorico(rng, id, status, emissao, vencimento);

      titulos.push({
        id,
        numero: `${contador++}/${String(rng.int(1, 9)).padStart(2, "0")}`,
        empresaId: empresa.id,
        devedorId: devedor.id,
        especie: rng.weighted<EspecieTitulo>([
          ["DMI", 10],
          ["DSI", 5],
          ["NP", 2],
          ["CT", 2],
          ...especies.slice(4).map((e) => [e, 1] as [EspecieTitulo, number]),
        ]),
        valorOriginal,
        valorAtualizado,
        emissao: iso(emissao),
        vencimento: iso(vencimento),
        status,
        protocoloCartorio: emCartorio
          ? `${rng.int(100000, 999999)}-${rng.int(10, 99)}`
          : null,
        cartorio: emCartorio ? rng.pick(CARTORIOS) : null,
        ufCartorio: emCartorio ? ufCartorio : null,
        dataRemessa:
          emCartorio || status === "AGUARDANDO_REMESSA"
            ? iso(addDays(vencimento, rng.int(25, 40)))
            : null,
        dataProtesto:
          status === "PROTESTADO" ? iso(addDays(vencimento, rng.int(45, 70))) : null,
        motivoDevolucao: status === "DEVOLVIDO" ? rng.pick(MOTIVOS_DEVOLUCAO) : null,
        acordoId: null,
        processoId: null,
        historico,
      });
    }
  }
  return titulos;
}

function buildHistorico(
  rng: Rng,
  tituloId: string,
  status: TituloStatus,
  emissao: Date,
  vencimento: Date,
) {
  const autores = ["Régua automática", "Helena P. Drummond", "Integração CENPROT", "Sistema"];
  const eventos = [
    { data: emissao, tipo: "Emissão", descricao: "Título registrado na carteira.", autor: "Sistema" },
  ];
  if (status !== "NO_PRAZO") {
    eventos.push({
      data: vencimento,
      tipo: "Vencimento",
      descricao: "Título venceu sem baixa de pagamento.",
      autor: "Sistema",
    });
    eventos.push({
      data: addDays(vencimento, 3),
      tipo: "Aviso enviado",
      descricao: "Disparo automático da régua (WhatsApp + e-mail).",
      autor: "Régua automática",
    });
  }
  if (["AGUARDANDO_REMESSA", "EM_CARTORIO", "PROTESTADO", "DEVOLVIDO"].includes(status)) {
    eventos.push({
      data: addDays(vencimento, 30),
      tipo: "Remessa CENPROT",
      descricao: "Título incluído no arquivo de remessa para o tabelionato.",
      autor: "Integração CENPROT",
    });
  }
  if (status === "PROTESTADO") {
    eventos.push({
      data: addDays(vencimento, 55),
      tipo: "Protesto lavrado",
      descricao: "Cartório confirmou a lavratura do protesto.",
      autor: "Integração CENPROT",
    });
  }
  if (status === "DEVOLVIDO") {
    eventos.push({
      data: addDays(vencimento, 50),
      tipo: "Devolução",
      descricao: "Título devolvido pelo cartório sem lavratura.",
      autor: "Integração CENPROT",
    });
  }
  if (status === "JURIDICO") {
    eventos.push({
      data: addDays(vencimento, 95),
      tipo: "Encaminhado ao jurídico",
      descricao: "Título transferido para cobrança judicial.",
      autor: rng.pick(autores),
    });
  }
  if (status === "LIQUIDADO") {
    eventos.push({
      data: addDays(vencimento, rng.int(5, 90)),
      tipo: "Liquidação",
      descricao: "Pagamento identificado e baixa registrada.",
      autor: "Conciliação PIX",
    });
  }
  return eventos.map((e, i) => ({
    id: `${tituloId}_ev${i}`,
    data: iso(e.data),
    tipo: e.tipo,
    descricao: e.descricao,
    autor: e.autor,
  }));
}

const TEMPLATES_BASE: Array<{ fase: FaseRegua; assunto: string; email: string; whats: string }> = [
  {
    fase: "EMISSAO",
    assunto: "Confirmação de emissão do título {{numero_titulo}}",
    email:
      "Olá, {{primeiro_nome}}.\n\nRegistramos a emissão do título {{numero_titulo}}, no valor de {{valor_cobranca}}, com vencimento em {{vencimento}}.\n\nGuarde este e-mail para consulta. Em caso de dúvida, responda esta mensagem.\n\n{{empresa}}",
    whats:
      "Olá, {{primeiro_nome}}! Aqui é da {{empresa}}. Seu título {{numero_titulo}} foi emitido no valor de {{valor_cobranca}}, vencendo em {{vencimento}}.",
  },
  {
    fase: "ANTES_VENCIMENTO",
    assunto: "Seu título vence em breve",
    email:
      "Olá, {{primeiro_nome}}.\n\nO título {{numero_titulo}} vence em {{vencimento}}, no valor de {{valor_cobranca}}.\n\nPague com PIX pelo link: {{link_pagamento}}\n\n{{empresa}}",
    whats:
      "{{primeiro_nome}}, seu título {{numero_titulo}} vence em {{vencimento}}. Valor: {{valor_cobranca}}. PIX: {{link_pagamento}}",
  },
  {
    fase: "DIA_VENCIMENTO",
    assunto: "Vencimento hoje — título {{numero_titulo}}",
    email:
      "Olá, {{primeiro_nome}}.\n\nO título {{numero_titulo}} vence hoje. Valor: {{valor_cobranca}}.\n\nEvite encargos pagando ainda hoje: {{link_pagamento}}\n\n{{empresa}}",
    whats:
      "{{primeiro_nome}}, o título {{numero_titulo}} vence hoje ({{valor_cobranca}}). Pague pelo PIX e evite encargos: {{link_pagamento}}",
  },
  {
    fase: "DEPOIS_VENCIMENTO",
    assunto: "Título {{numero_titulo}} em atraso",
    email:
      "Olá, {{primeiro_nome}}.\n\nConsta em aberto o título {{numero_titulo}}, vencido em {{vencimento}}, com {{dias_atraso}} dias de atraso. Valor atualizado: {{valor_cobranca}}.\n\nRegularize por aqui: {{link_pagamento}}\n\n{{empresa}}",
    whats:
      "{{primeiro_nome}}, o título {{numero_titulo}} está com {{dias_atraso}} dias de atraso. Valor atualizado: {{valor_cobranca}}. Regularize: {{link_pagamento}}",
  },
  {
    fase: "PRE_PROTESTO",
    assunto: "Aviso de encaminhamento a protesto — {{numero_titulo}}",
    email:
      "Prezado(a) {{nome}},\n\nO título {{numero_titulo}}, vencido em {{vencimento}}, permanece em aberto no valor de {{valor_cobranca}}.\n\nNão havendo quitação, o título será encaminhado ao Tabelionato de Protesto competente, nos termos da Lei 9.492/97.\n\nPara evitar o apontamento, quite pelo link: {{link_pagamento}}\n\n{{empresa}}",
    whats:
      "{{primeiro_nome}}, aviso importante: o título {{numero_titulo}} ({{valor_cobranca}}) será encaminhado a protesto se não for quitado. Link: {{link_pagamento}}",
  },
  {
    fase: "PROTESTADO",
    assunto: "Título protestado — condições para baixa",
    email:
      "Prezado(a) {{nome}},\n\nO título {{numero_titulo}} foi protestado. Para a baixa do protesto é necessária a quitação do valor de {{valor_cobranca}} acrescido dos emolumentos cartorários.\n\nFale conosco para negociar: {{link_pagamento}}\n\n{{empresa}}",
    whats:
      "{{primeiro_nome}}, o título {{numero_titulo}} está protestado. Podemos negociar a quitação e providenciar a baixa. Valor: {{valor_cobranca}}.",
  },
  {
    fase: "JURIDICO",
    assunto: "Última oportunidade antes da ação judicial",
    email:
      "Prezado(a) {{nome}},\n\nO débito referente ao título {{numero_titulo}} está em fase de preparação para cobrança judicial.\n\nAinda é possível compor acordo administrativo. Responda a este e-mail em até 5 dias úteis.\n\n{{empresa}}",
    whats:
      "{{primeiro_nome}}, o título {{numero_titulo}} está indo para cobrança judicial. Ainda dá para fazer acordo — responda esta mensagem.",
  },
];

function buildTemplates(): Template[] {
  const out: Template[] = [];
  TEMPLATES_BASE.forEach((t, i) => {
    out.push({
      id: `tpl_email_${i + 1}`,
      nome: `E-mail — ${FASE_LABELS[t.fase]}`,
      canal: "EMAIL",
      assunto: t.assunto,
      corpo: t.email,
      fase: t.fase,
    });
    out.push({
      id: `tpl_whats_${i + 1}`,
      nome: `WhatsApp — ${FASE_LABELS[t.fase]}`,
      canal: "WHATSAPP",
      assunto: null,
      corpo: t.whats,
      fase: t.fase,
    });
  });
  return out;
}

const OFFSETS: Record<FaseRegua, number> = {
  EMISSAO: -30,
  ANTES_VENCIMENTO: -3,
  DIA_VENCIMENTO: 0,
  DEPOIS_VENCIMENTO: 5,
  PRE_PROTESTO: 20,
  PROTESTADO: 60,
  JURIDICO: 100,
};

function buildReguas(rng: Rng, empresas: Empresa[], templates: Template[]): Regua[] {
  return empresas.map((empresa, i) => ({
    id: `reg_${i + 1}`,
    nome: `Régua padrão — ${empresa.nomeFantasia}`,
    empresaId: empresa.id,
    ativa: i !== 3,
    diasSemana: [1, 2, 3, 4, 5],
    horaInicio: "08:00",
    horaFim: "18:00",
    bloquearDomingos: true,
    bloquearFeriados: true,
    atualizadaEm: iso(addDays(HOJE, -rng.int(2, 60))),
    passos: FASES_REGUA.map((fase, k) => {
      const canais: Canal[] =
        fase === "EMISSAO" ? ["EMAIL"] : rng.bool(0.75) ? ["EMAIL", "WHATSAPP"] : ["WHATSAPP"];
      return {
        id: `reg_${i + 1}_p${k + 1}`,
        fase,
        offsetDias: OFFSETS[fase],
        canais,
        templateEmailId: canais.includes("EMAIL")
          ? templates.find((t) => t.canal === "EMAIL" && t.fase === fase)!.id
          : null,
        templateWhatsappId: canais.includes("WHATSAPP")
          ? templates.find((t) => t.canal === "WHATSAPP" && t.fase === fase)!.id
          : null,
        ativo: !(fase === "JURIDICO" && i === 2),
      };
    }),
  }));
}

const FASE_POR_STATUS: Record<TituloStatus, FaseRegua> = {
  NO_PRAZO: "ANTES_VENCIMENTO",
  PRE_PROTESTO: "PRE_PROTESTO",
  AGUARDANDO_REMESSA: "PRE_PROTESTO",
  EM_CARTORIO: "PROTESTADO",
  DEVOLVIDO: "DEPOIS_VENCIMENTO",
  PROTESTADO: "PROTESTADO",
  JURIDICO: "JURIDICO",
  LIQUIDADO: "DEPOIS_VENCIMENTO",
};

function buildAvisos(rng: Rng, titulos: Titulo[], devedores: Devedor[]): Aviso[] {
  const avisos: Aviso[] = [];
  const porId = new Map(devedores.map((d) => [d.id, d]));

  for (const titulo of titulos) {
    const devedor = porId.get(titulo.devedorId)!;
    const qtd = titulo.status === "NO_PRAZO" ? rng.int(0, 2) : rng.int(2, 7);
    for (let k = 0; k < qtd; k++) {
      const canal: Canal = rng.bool(0.55) ? "WHATSAPP" : "EMAIL";
      const destino =
        canal === "EMAIL" ? devedor.email : devedor.whatsapp ?? devedor.telefone;
      const semDestino = !destino;
      const status: AvisoStatus = semDestino
        ? "FALHA"
        : rng.weighted<AvisoStatus>([
            ["ENTREGUE", 46],
            ["LIDO", 26],
            ["ENVIADO", 10],
            ["FALHA", 12],
            ["AGENDADO", 6],
          ]);
      avisos.push({
        id: `avs_${avisos.length + 1}`,
        tituloId: titulo.id,
        devedorId: devedor.id,
        empresaId: titulo.empresaId,
        canal,
        fase: FASE_POR_STATUS[titulo.status],
        status,
        destino: destino ?? "—",
        enviadoEm: iso(addDays(HOJE, -rng.int(0, 120))),
        erro:
          status === "FALHA"
            ? semDestino
              ? canal === "EMAIL"
                ? "Devedor sem e-mail cadastrado"
                : "Devedor sem WhatsApp cadastrado"
              : rng.pick(ERROS_AVISO)
            : null,
        origem: rng.bool(0.86) ? "REGUA" : "MANUAL",
      });
    }
  }
  return avisos;
}

function buildAcordos(rng: Rng, titulos: Titulo[], devedores: Devedor[], usuarios: Usuario[]): Acordo[] {
  const acordos: Acordo[] = [];
  const candidatos = titulos.filter((t) =>
    ["PRE_PROTESTO", "EM_CARTORIO", "PROTESTADO", "JURIDICO", "DEVOLVIDO"].includes(t.status),
  );
  const porDevedor = new Map<string, Titulo[]>();
  for (const t of candidatos) {
    porDevedor.set(t.devedorId, [...(porDevedor.get(t.devedorId) ?? []), t]);
  }

  const entradas = [...porDevedor.entries()].slice(0, 58);
  entradas.forEach(([devedorId, ts], i) => {
    if (!rng.bool(0.82)) return;
    const devedor = devedores.find((d) => d.id === devedorId)!;
    const selecionados = ts.slice(0, rng.int(1, Math.min(3, ts.length)));
    const valorDivida = Number(
      selecionados.reduce((s, t) => s + t.valorAtualizado, 0).toFixed(2),
    );
    const desconto = rng.pick([0, 5, 10, 12, 15, 20, 25, 30]);
    const valorAcordo = Number((valorDivida * (1 - desconto / 100)).toFixed(2));

    const status: AcordoStatus = rng.weighted<AcordoStatus>([
      ["NEGOCIACAO", 16],
      ["AGUARDANDO_ASSINATURA", 12],
      ["FIRMADO", 10],
      ["EM_CUMPRIMENTO", 20],
      ["ATRASADO", 10],
      ["CONCLUIDO", 14],
      ["PROTESTO_BAIXADO", 7],
      ["FIRMADO_EM_JUIZO", 4],
      ["DESCUMPRIDO", 7],
    ]);

    const nParcelas = rng.pick([1, 2, 3, 4, 6, 6, 8, 10, 12]);
    const entrada = rng.bool(0.6) ? Number((valorAcordo * rng.pick([0.1, 0.2, 0.3])).toFixed(2)) : 0;
    const restante = valorAcordo - entrada;
    const criadoEm = addDays(HOJE, -rng.int(5, 240));
    const assinado = !["NEGOCIACAO", "AGUARDANDO_ASSINATURA"].includes(status);

    const parcelas: ParcelaAcordo[] = Array.from({ length: nParcelas }, (_, k) => {
      const vencimento = addDays(criadoEm, 30 * (k + 1));
      const venceu = vencimento.getTime() < HOJE.getTime();
      let pago = false;
      if (status === "CONCLUIDO" || status === "PROTESTO_BAIXADO") pago = true;
      else if (status === "EM_CUMPRIMENTO") pago = venceu;
      else if (status === "ATRASADO") pago = venceu && k < nParcelas - 1 && rng.bool(0.7);
      else if (status === "DESCUMPRIDO") pago = k === 0 && rng.bool(0.5);
      return {
        id: `acr_${i + 1}_p${k + 1}`,
        numero: k + 1,
        vencimento: iso(vencimento),
        valor: Number((restante / nParcelas).toFixed(2)),
        pago,
        pagoEm: pago ? iso(addDays(vencimento, -rng.int(0, 4))) : null,
      };
    });

    acordos.push({
      id: `acr_${i + 1}`,
      codigo: `ACD-${String(2400 + i).padStart(5, "0")}`,
      empresaId: selecionados[0].empresaId,
      devedorId,
      titulosIds: selecionados.map((t) => t.id),
      valorDivida,
      valorAcordo,
      descontoPercentual: desconto,
      entrada,
      parcelas,
      status,
      criadoEm: iso(criadoEm),
      assinadoEm: assinado ? iso(addDays(criadoEm, rng.int(1, 12))) : null,
      assinadorExterno: assinado ? rng.pick(["UltraSign", "GenInfra Sign"]) : null,
      responsavel: rng.pick(usuarios).nome,
      observacao:
        status === "DESCUMPRIDO"
          ? "Parcelas em aberto há mais de 30 dias — enviado ao jurídico."
          : status === "PROTESTO_BAIXADO"
            ? `Carta de anuência emitida para ${devedor.nome}.`
            : undefined,
    });
  });

  return acordos;
}

function buildAdvogados(rng: Rng): Advogado[] {
  return NOMES_PF.slice(30, 38).map((nome, i) => ({
    id: `adv_${i + 1}`,
    nome,
    oab: String(rng.int(100000, 499999)),
    ufOab: rng.pick(["SP", "MG", "RJ", "RS", "SC", "DF"]),
    email: slugEmail(nome, "bastosfalcao.adv.br"),
    telefone: gerarTelefone(rng),
    ativo: rng.bool(0.9),
  }));
}

function buildTestemunhas(rng: Rng): Testemunha[] {
  return NOMES_PF.slice(44, 50).map((nome, i) => ({
    id: `tst_${i + 1}`,
    nome,
    documento: gerarCPF(rng),
    email: rng.bool(0.7) ? slugEmail(nome, "grupoaurora.com.br") : null,
    telefone: rng.bool(0.8) ? gerarTelefone(rng) : null,
  }));
}

function buildProcessos(
  rng: Rng,
  titulos: Titulo[],
  advogados: Advogado[],
): Processo[] {
  const juridicos = titulos.filter((t) => t.status === "JURIDICO");
  const porDevedor = new Map<string, Titulo[]>();
  for (const t of juridicos) {
    porDevedor.set(t.devedorId, [...(porDevedor.get(t.devedorId) ?? []), t]);
  }

  return [...porDevedor.entries()].slice(0, 34).map(([devedorId, ts], i) => {
    const status = rng.weighted<ProcessoStatus>([
      ["NOVO", 14],
      ["AGUARDANDO_CUSTAS", 12],
      ["AGUARDANDO_PROTOCOLO", 10],
      ["PROTOCOLADO", 22],
      ["EM_DILIGENCIA", 20],
      ["ACORDO_FIRMADO", 12],
      ["ARQUIVADO", 10],
    ]);
    const criadoEm = addDays(HOJE, -rng.int(20, 520));
    const distribuido = PROCESSO_FLOW.indexOf(status) >= 3;
    const valorCausa = Number(ts.reduce((s, t) => s + t.valorAtualizado, 0).toFixed(2));
    const nMov = Math.min(MOVIMENTACOES.length, PROCESSO_FLOW.indexOf(status) + rng.int(1, 4));

    return {
      id: `prc_${i + 1}`,
      numeroCNJ: gerarCNJ(rng, criadoEm.getFullYear(), rng.pick(["826", "819", "813", "816", "821"]), rng.pick(["0100", "0053", "0001", "0224"])),
      empresaId: ts[0].empresaId,
      devedorId,
      titulosIds: ts.map((t) => t.id),
      comarca: rng.pick(COMARCAS),
      vara: rng.pick(VARAS),
      advogadoId: rng.pick(advogados).id,
      prioridade: rng.weighted<Prioridade>([
        ["BAIXA", 3],
        ["MEDIA", 8],
        ["ALTA", 6],
        ["URGENTE", 2],
      ]),
      status,
      valorCausa,
      custas: Number((valorCausa * 0.01 + rng.float(180, 900)).toFixed(2)),
      distribuidoEm: distribuido ? iso(addDays(criadoEm, rng.int(10, 60))) : null,
      criadoEm: iso(criadoEm),
      movimentacoes: MOVIMENTACOES.slice(0, nMov).map(([titulo, descricao], k) => ({
        id: `prc_${i + 1}_mov${k}`,
        data: iso(addDays(criadoEm, k * rng.int(8, 30))),
        titulo,
        descricao,
      })),
      anexos: Array.from({ length: rng.int(1, 5) }, (_, k) => ({
        id: `prc_${i + 1}_anx${k}`,
        nome: rng.pick([
          "peticao-inicial.pdf",
          "contrato-social.pdf",
          "duplicatas-anexo-I.pdf",
          "instrumento-de-protesto.pdf",
          "guia-custas-recolhida.pdf",
          "procuracao-ad-judicia.pdf",
        ]),
        tamanhoKb: rng.int(120, 5400),
        enviadoEm: iso(addDays(criadoEm, rng.int(1, 90))),
      })),
    };
  });
}

function buildChavesPix(rng: Rng, empresas: Empresa[]): ChavePix[] {
  return empresas.flatMap((e, i) => [
    {
      id: `pix_${i}_1`,
      tipo: "CNPJ" as const,
      valor: e.cnpj,
      empresaId: e.id,
      principal: true,
    },
    {
      id: `pix_${i}_2`,
      tipo: "EMAIL" as const,
      valor: e.email,
      empresaId: e.id,
      principal: false,
    },
    {
      id: `pix_${i}_3`,
      tipo: "ALEATORIA" as const,
      valor: `${rng.int(10000000, 99999999)}-${rng.int(1000, 9999)}-4${rng.int(100, 999)}-a${rng.int(100, 999)}-${rng.int(100000000000, 999999999999)}`,
      empresaId: e.id,
      principal: false,
    },
  ]);
}

function buildCobrancas(
  rng: Rng,
  titulos: Titulo[],
  devedores: Devedor[],
  chaves: ChavePix[],
  empresas: Empresa[],
): CobrancaPix[] {
  const alvo = titulos.filter((t) => t.status !== "NO_PRAZO").slice(0, 90);
  return alvo.map((titulo, i) => {
    const devedor = devedores.find((d) => d.id === titulo.devedorId)!;
    const empresa = empresas.find((e) => e.id === titulo.empresaId)!;
    const chave = chaves.find((c) => c.empresaId === titulo.empresaId && c.principal)!;
    const criadaEm = addDays(HOJE, -rng.int(0, 90));
    const status = rng.weighted<CobrancaStatus>([
      ["PENDENTE", 32],
      ["PAGO", 42],
      ["EXPIRADO", 18],
      ["CANCELADO", 8],
    ]);
    return {
      id: `cob_${i + 1}`,
      codigo: `PIX-${String(9100 + i)}`,
      empresaId: titulo.empresaId,
      devedorId: devedor.id,
      tituloId: titulo.id,
      descricao: `Título ${titulo.numero} — ${empresa.nomeFantasia}`,
      valor: titulo.valorAtualizado,
      status,
      chave: chave.valor,
      criadaEm: iso(criadaEm),
      expiraEm: iso(addDays(criadaEm, 3)),
      pagoEm: status === "PAGO" ? iso(addDays(criadaEm, rng.int(0, 3))) : null,
      copiaECola: gerarCopiaECola(rng, chave.valor, titulo.valorAtualizado, empresa.nomeFantasia),
    };
  });
}

function buildLancamentos(rng: Rng, cobrancas: CobrancaPix[], empresas: Empresa[]): Lancamento[] {
  const eventos: Array<Omit<Lancamento, "id" | "saldo">> = [];

  for (const c of cobrancas.filter((c) => c.status === "PAGO")) {
    eventos.push({
      data: c.pagoEm!,
      tipo: "CREDITO",
      categoria: "Recebimento PIX",
      descricao: c.descricao,
      contraparte: c.codigo,
      valor: c.valor,
      empresaId: c.empresaId,
    });
  }

  for (let i = 0; i < 70; i++) {
    const empresa = rng.pick(empresas);
    const debito = rng.bool(0.62);
    eventos.push({
      data: iso(addDays(HOJE, -rng.int(0, 120))),
      tipo: debito ? "DEBITO" : "CREDITO",
      categoria: debito ? rng.pick(CATEGORIAS_DESPESA) : rng.pick(["Recebimento PIX", "Transferência recebida", "Estorno"]),
      descricao: debito
        ? `Pagamento ${rng.pick(FORNECEDORES)}`
        : `Crédito ${rng.pick(["boleto liquidado", "PIX avulso", "acordo — parcela"])}`,
      contraparte: debito ? rng.pick(FORNECEDORES) : rng.pick(BANCOS),
      valor: rng.float(120, 18000),
      empresaId: empresa.id,
    });
  }

  eventos.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

  let saldo = 184_200;
  return eventos.map((e, i) => {
    saldo += e.tipo === "CREDITO" ? e.valor : -e.valor;
    return { ...e, id: `lan_${i + 1}`, saldo: Number(saldo.toFixed(2)) };
  });
}

function buildDespesas(rng: Rng, empresas: Empresa[]): Despesa[] {
  return Array.from({ length: 46 }, (_, i) => {
    const vencimento = addDays(HOJE, rng.int(-90, 45));
    const venceu = vencimento.getTime() < HOJE.getTime();
    const status = venceu
      ? rng.weighted<Despesa["status"]>([["PAGA", 7], ["VENCIDA", 3]])
      : "PENDENTE";
    return {
      id: `dsp_${i + 1}`,
      empresaId: rng.pick(empresas).id,
      categoria: rng.pick(CATEGORIAS_DESPESA),
      descricao: rng.pick([
        "Custas iniciais de execução",
        "Emolumentos de protesto — lote mensal",
        "Honorários contratuais 10%",
        "Diligência de oficial de justiça",
        "Certidão de distribuição cível",
        "Postagem de notificações extrajudiciais",
        "Mensalidade do assinador digital",
        "Consultas cadastrais em lote",
      ]),
      fornecedor: rng.pick(FORNECEDORES),
      valor: rng.float(90, 7400),
      vencimento: iso(vencimento),
      status,
      comprovante: status === "PAGA" ? `comprovante-${1000 + i}.pdf` : null,
    };
  });
}

/** Interpola as variáveis do template com os dados reais do caso. */
function renderizarTemplate(
  texto: string,
  devedor: Devedor,
  titulo: Titulo | undefined,
  empresa: Empresa | undefined,
) {
  const brl = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const diasAtraso = titulo
    ? Math.max(
        0,
        Math.floor((HOJE.getTime() - new Date(titulo.vencimento).getTime()) / 86_400_000),
      )
    : 0;

  const valores: Record<string, string> = {
    "{{nome}}": devedor.nome,
    "{{primeiro_nome}}": devedor.nome.split(" ")[0],
    "{{documento}}": devedor.documento,
    "{{numero_titulo}}": titulo?.numero ?? "—",
    "{{valor_cobranca}}": titulo ? brl(titulo.valorAtualizado) : "—",
    "{{vencimento}}": titulo
      ? new Date(titulo.vencimento).toLocaleDateString("pt-BR")
      : "—",
    "{{dias_atraso}}": String(diasAtraso),
    "{{fase}}": "Cobrança",
    "{{empresa}}": empresa?.nomeFantasia ?? "",
    "{{link_pagamento}}": `https://drprotesto.com.br/p/${devedor.id.slice(-6)}`,
  };

  return Object.entries(valores).reduce(
    (acc, [chave, valor]) => acc.split(chave).join(valor),
    texto,
  );
}

function buildConversas(
  rng: Rng,
  devedores: Devedor[],
  titulos: Titulo[],
  empresas: Empresa[],
): Conversa[] {
  const comWhats = devedores.filter((d) => d.whatsapp).slice(0, 28);
  return comWhats.map((devedor, i) => {
    const titulo = titulos.find(
      (t) => t.devedorId === devedor.id && t.status !== "LIQUIDADO",
    );
    const empresa = empresas.find((e) => e.id === devedor.empresaId);
    const nMsg = rng.int(3, 9);
    const inicio = addDays(HOJE, -rng.int(0, 20));

    // Offset cumulativo: as mensagens ficam em ordem cronológica real.
    let instante = inicio.getTime();
    const mensagens = Array.from({ length: nMsg }, (_, k) => {
      if (k > 0) instante += rng.int(400_000, 5_400_000);
      const autor =
        k === 0 ? "SISTEMA" : rng.weighted<"DEVEDOR" | "OPERADOR" | "SISTEMA">([
          ["DEVEDOR", 5],
          ["OPERADOR", 4],
          ["SISTEMA", 1],
        ]);
      const bruto =
        autor === "SISTEMA"
          ? rng.pick(MSG_SISTEMA)
          : autor === "DEVEDOR"
            ? rng.pick(MSG_DEVEDOR)
            : rng.pick(MSG_OPERADOR);
      return {
        id: `cnv_${i + 1}_m${k}`,
        autor,
        texto: renderizarTemplate(bruto, devedor, titulo, empresa),
        enviadaEm: iso(new Date(instante)),
        lida: k < nMsg - 1 || rng.bool(0.5),
      };
    });
    const respondeu = mensagens.some((m) => m.autor === "DEVEDOR");
    const triagem: TriagemStatus = !respondeu
      ? "SEM_RESPOSTA"
      : rng.weighted<TriagemStatus>([
          ["ENGAJOU", 5],
          ["HUMANO", 3],
          ["DEVEDOR", 4],
        ]);
    return {
      id: `cnv_${i + 1}`,
      devedorId: devedor.id,
      empresaId: devedor.empresaId,
      triagem,
      naoLidas: mensagens.filter((m) => !m.lida && m.autor === "DEVEDOR").length,
      atualizadaEm: mensagens[mensagens.length - 1].enviadaEm,
      mensagens,
    };
  });
}

function buildImportacoes(rng: Rng, empresas: Empresa[], usuarios: Usuario[]): Importacao[] {
  return Array.from({ length: 9 }, (_, i) => {
    const linhas = rng.int(40, 1200);
    const erros = rng.bool(0.55) ? rng.int(1, Math.max(2, Math.floor(linhas * 0.06))) : 0;
    return {
      id: `imp_${i + 1}`,
      arquivo: rng.pick([
        "carteira-agosto.xlsx",
        "devedores-juridico-lote3.csv",
        "importacao-inadimplentes.xlsx",
        "base-migracao-erp.csv",
        "titulos-vencidos-q2.xlsx",
      ]),
      linhas,
      sucesso: linhas - erros,
      erros,
      importadoEm: iso(addDays(HOJE, -rng.int(1, 180))),
      autor: rng.pick(usuarios).nome,
      desfeita: rng.bool(0.12),
      empresaId: rng.pick(empresas).id,
    };
  }).sort((a, b) => new Date(b.importadoEm).getTime() - new Date(a.importadoEm).getTime());
}

/** Vincula acordos e processos aos títulos correspondentes. */
function crossLink(titulos: Titulo[], acordos: Acordo[], processos: Processo[]) {
  const porId = new Map(titulos.map((t) => [t.id, t]));
  for (const a of acordos) {
    for (const id of a.titulosIds) {
      const t = porId.get(id);
      if (t) t.acordoId = a.id;
    }
  }
  for (const p of processos) {
    for (const id of p.titulosIds) {
      const t = porId.get(id);
      if (t) t.processoId = p.id;
    }
  }
}

export function buildDatabase(seed = 20260826): Database {
  const rng = createRng(seed);

  const { matriz, supervisora } = buildContas(rng);
  const empresas = buildEmpresas(rng);
  const usuarios = buildUsuarios(rng, empresas, supervisora.id);
  const devedores = buildDevedores(rng, empresas);
  const titulos = buildTitulos(rng, empresas, devedores);
  const templates = buildTemplates();
  const reguas = buildReguas(rng, empresas, templates);
  const avisos = buildAvisos(rng, titulos, devedores);
  const acordos = buildAcordos(rng, titulos, devedores, usuarios);
  const advogados = buildAdvogados(rng);
  const testemunhas = buildTestemunhas(rng);
  const processos = buildProcessos(rng, titulos, advogados);
  const chavesPix = buildChavesPix(rng, empresas);
  const cobrancas = buildCobrancas(rng, titulos, devedores, chavesPix, empresas);
  const lancamentos = buildLancamentos(rng, cobrancas, empresas);
  const despesas = buildDespesas(rng, empresas);
  const conversas = buildConversas(rng, devedores, titulos, empresas);
  const importacoes = buildImportacoes(rng, empresas, usuarios);

  crossLink(titulos, acordos, processos);

  const favoritos: Favorito[] = Array.from({ length: 7 }, (_, i) => {
    const nome = NOMES_PF[50 + i];
    return {
      id: `fav_${i + 1}`,
      nome,
      chave: rng.bool(0.5) ? gerarCPF(rng) : slugEmail(nome),
      banco: rng.pick(BANCOS),
      documento: gerarCPF(rng),
    };
  });

  const integracoes: ConfigIntegracoes = {
    cenprot: {
      ambiente: "HOMOLOGACAO",
      permitirProducao: true,
      cnpjApresentante: empresas[0].cnpj,
      ultimaRemessa: iso(addDays(HOJE, -1)),
    },
    assinatura: {
      provedor: "UltraSign",
      urlEnvio: "https://api.ultrasign.com.br/v2/documentos",
      webhookEntrada: "https://api.drprotesto.com.br/integracoes/assinatura/webhook",
      secret: "whsec_" + Array.from({ length: 32 }, () => "abcdef0123456789"[rng.int(0, 15)]).join(""),
      ativa: true,
      dispararWhatsappPosAssinatura: true,
    },
    whatsapp: {
      conectado: true,
      numero: gerarTelefone(rng),
      pareadoEm: iso(addDays(HOJE, -12)),
    },
    tjdft: { ativa: true, motor: "JurisCalc" },
  };

  const configMensagens: ConfigMensagens = {
    canais: ["EMAIL", "WHATSAPP"],
    diasSemana: [1, 2, 3, 4, 5],
    horaInicio: "08:00",
    horaFim: "18:00",
    alertaNovosDevedores: true,
    protestoAutomatico: true,
  };

  return {
    contaMatriz: matriz,
    contaSupervisora: supervisora,
    usuarioAtual: usuarios[0],
    usuarios,
    empresas,
    devedores,
    titulos,
    avisos,
    reguas,
    templates,
    acordos,
    processos,
    advogados,
    testemunhas,
    cobrancas,
    chavesPix,
    favoritos,
    lancamentos,
    despesas,
    conversas,
    importacoes,
    integracoes,
    configMensagens,
  };
}

export const ACORDO_ETAPAS = [...ACORDO_FUNIL, ...ACORDO_DESVIOS];
