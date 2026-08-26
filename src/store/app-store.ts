"use client";

import { create } from "zustand";
import { getDataSource } from "@/services/datasource";
import { buildDatabase, type Database } from "@/data/seed";
import {
  addDays,
  hoje,
  iso,
  type Acordo,
  type AcordoStatus,
  type Advogado,
  type Aviso,
  type Canal,
  type CobrancaPix,
  type ConfigIntegracoes,
  type ConfigMensagens,
  type Despesa,
  type Devedor,
  type Empresa,
  type Importacao,
  type Processo,
  type ProcessoStatus,
  type Regua,
  type Template,
  type Testemunha,
  type Titulo,
  type TituloStatus,
  type Usuario,
} from "@/lib/domain";
import { gerarCopiaECola, createRng } from "@/data/rng";

export interface Toast {
  id: string;
  titulo: string;
  descricao?: string;
  tone: "ok" | "danger" | "info" | "warn";
}

interface Sessao {
  token: string;
  usuarioId: string;
}

interface AppState {
  db: Database;
  pronto: boolean;
  carregando: boolean;
  sessao: Sessao | null;
  empresaAtivaId: string | "TODAS";
  tema: "light" | "dark";
  sidebarRecolhida: boolean;
  toasts: Toast[];

  /* ciclo de vida */
  init: () => Promise<void>;
  entrar: (email: string, senha: string) => Promise<boolean>;
  sair: () => void;
  restaurarBase: () => Promise<void>;

  /* preferências */
  setEmpresaAtiva: (id: string | "TODAS") => void;
  alternarTema: () => void;
  alternarSidebar: () => void;
  notificar: (t: Omit<Toast, "id">) => void;
  dispensarToast: (id: string) => void;

  /* mutações de domínio */
  salvarTitulo: (t: Partial<Titulo> & { id?: string }) => Titulo;
  mudarStatusTitulo: (ids: string[], status: TituloStatus, nota?: string) => void;
  enviarParaProtesto: (ids: string[]) => void;
  salvarDevedor: (d: Partial<Devedor> & { id?: string }) => Devedor;
  alternarBloqueioDevedor: (id: string) => void;
  salvarEmpresa: (e: Partial<Empresa> & { id?: string }) => Empresa;
  salvarUsuario: (u: Partial<Usuario> & { id?: string }) => Usuario;
  removerUsuario: (id: string) => void;
  salvarRegua: (r: Regua) => void;
  salvarTemplate: (t: Template) => void;
  salvarAcordo: (a: Partial<Acordo> & { id?: string }) => Acordo;
  moverAcordo: (id: string, status: AcordoStatus) => void;
  registrarPagamentoParcela: (acordoId: string, parcelaId: string) => void;
  salvarProcesso: (p: Partial<Processo> & { id?: string }) => Processo;
  moverProcesso: (id: string, status: ProcessoStatus) => void;
  criarCobranca: (input: {
    empresaId: string;
    devedorId: string | null;
    tituloId: string | null;
    descricao: string;
    valor: number;
    chave: string;
    validadeDias: number;
  }) => CobrancaPix;
  atualizarCobranca: (id: string, patch: Partial<CobrancaPix>) => void;
  salvarDespesa: (d: Partial<Despesa> & { id?: string }) => Despesa;
  salvarAdvogado: (a: Partial<Advogado> & { id?: string }) => Advogado;
  salvarTestemunha: (t: Partial<Testemunha> & { id?: string }) => Testemunha;
  enviarAvisoManual: (tituloId: string, canal: Canal) => void;
  responderConversa: (conversaId: string, texto: string) => void;
  marcarConversaLida: (conversaId: string) => void;
  definirTriagem: (conversaId: string, triagem: Conversa["triagem"]) => void;
  registrarImportacao: (imp: Omit<Importacao, "id">) => void;
  desfazerImportacao: (id: string) => void;
  salvarConfigMensagens: (c: ConfigMensagens) => void;
  salvarIntegracoes: (c: ConfigIntegracoes) => void;
}

type Conversa = Database["conversas"][number];

const uid = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

/** Substitui um item por id, mantendo a ordem da coleção. */
function replace<T extends { id: string }>(list: T[], id: string, patch: Partial<T>): T[] {
  return list.map((item) => (item.id === id ? { ...item, ...patch } : item));
}

export const useApp = create<AppState>((set, get) => {
  const ds = getDataSource();

  /** Aplica uma transformação na base e agenda a persistência. */
  const commit = (fn: (db: Database) => Database) => {
    const next = fn(get().db);
    set({ db: next });
    void ds.persist(next);
    return next;
  };

  return {
    db: buildDatabase(),
    pronto: false,
    carregando: false,
    sessao: null,
    empresaAtivaId: "TODAS",
    tema: "light",
    sidebarRecolhida: false,
    toasts: [],

    async init() {
      if (get().pronto || get().carregando) return;
      set({ carregando: true });
      const db = await ds.bootstrap();

      let sessao: Sessao | null = null;
      let empresaAtivaId: string | "TODAS" = "TODAS";
      let tema: "light" | "dark" = "light";
      try {
        const rawSessao = localStorage.getItem("drp:sessao");
        if (rawSessao) sessao = JSON.parse(rawSessao);
        const emp = localStorage.getItem("drp:empresa");
        if (emp) empresaAtivaId = emp;
        const t = localStorage.getItem("drp:tema");
        if (t === "dark" || t === "light") tema = t;
      } catch {
        /* storage indisponível */
      }

      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle("dark", tema === "dark");
      }
      set({ db, sessao, empresaAtivaId, tema, pronto: true, carregando: false });
    },

    async entrar(email, senha) {
      if (!email.includes("@") || senha.length < 4) return false;
      const { token } = await ds.autenticar(email, senha);
      const db = get().db;
      const usuario =
        db.usuarios.find((u) => u.email.toLowerCase() === email.toLowerCase()) ??
        db.usuarioAtual;
      const sessao = { token, usuarioId: usuario.id };
      try {
        localStorage.setItem("drp:sessao", JSON.stringify(sessao));
        localStorage.setItem("@stricv2:token", token);
      } catch {
        /* ignore */
      }
      set({ sessao });
      return true;
    },

    sair() {
      try {
        localStorage.removeItem("drp:sessao");
        localStorage.removeItem("@stricv2:token");
      } catch {
        /* ignore */
      }
      set({ sessao: null });
    },

    async restaurarBase() {
      const db = await ds.reset();
      set({ db });
      get().notificar({ titulo: "Base restaurada", descricao: "Os dados voltaram ao estado original.", tone: "ok" });
    },

    setEmpresaAtiva(id) {
      try {
        localStorage.setItem("drp:empresa", id);
      } catch {
        /* ignore */
      }
      set({ empresaAtivaId: id });
    },

    alternarTema() {
      const tema = get().tema === "light" ? "dark" : "light";
      try {
        localStorage.setItem("drp:tema", tema);
      } catch {
        /* ignore */
      }
      document.documentElement.classList.toggle("dark", tema === "dark");
      set({ tema });
    },

    alternarSidebar() {
      set({ sidebarRecolhida: !get().sidebarRecolhida });
    },

    notificar(t) {
      const toast = { ...t, id: uid("tst") };
      set({ toasts: [...get().toasts, toast] });
      setTimeout(() => get().dispensarToast(toast.id), 4200);
    },

    dispensarToast(id) {
      set({ toasts: get().toasts.filter((t) => t.id !== id) });
    },

    /* ------------------------------ Títulos ------------------------------ */

    salvarTitulo(input) {
      const agora = hoje();
      let resultado!: Titulo;
      commit((db) => {
        if (input.id && db.titulos.some((t) => t.id === input.id)) {
          resultado = { ...db.titulos.find((t) => t.id === input.id)!, ...input } as Titulo;
          return { ...db, titulos: replace(db.titulos, input.id, input) };
        }
        const id = uid("tit");
        resultado = {
          id,
          numero: input.numero ?? String(Math.floor(Math.random() * 90000) + 10000),
          empresaId: input.empresaId!,
          devedorId: input.devedorId!,
          especie: input.especie ?? "DMI",
          valorOriginal: input.valorOriginal ?? 0,
          valorAtualizado: input.valorAtualizado ?? input.valorOriginal ?? 0,
          emissao: input.emissao ?? iso(agora),
          vencimento: input.vencimento ?? iso(addDays(agora, 30)),
          status: input.status ?? "NO_PRAZO",
          protocoloCartorio: null,
          cartorio: null,
          ufCartorio: null,
          dataRemessa: null,
          dataProtesto: null,
          motivoDevolucao: null,
          acordoId: null,
          processoId: null,
          historico: [
            {
              id: `${id}_ev0`,
              data: iso(agora),
              tipo: "Emissão",
              descricao: "Título cadastrado manualmente.",
              autor: db.usuarioAtual.nome,
            },
          ],
        };
        return { ...db, titulos: [resultado, ...db.titulos] };
      });
      return resultado;
    },

    mudarStatusTitulo(ids, status, nota) {
      const agora = iso(hoje());
      commit((db) => ({
        ...db,
        titulos: db.titulos.map((t) =>
          ids.includes(t.id)
            ? {
                ...t,
                status,
                historico: [
                  ...t.historico,
                  {
                    id: uid("ev"),
                    data: agora,
                    tipo: "Mudança de status",
                    descricao: nota ?? `Status alterado para ${status}.`,
                    autor: db.usuarioAtual.nome,
                  },
                ],
              }
            : t,
        ),
      }));
    },

    enviarParaProtesto(ids) {
      const agora = iso(hoje());
      commit((db) => ({
        ...db,
        titulos: db.titulos.map((t) =>
          ids.includes(t.id)
            ? {
                ...t,
                status: "AGUARDANDO_REMESSA" as TituloStatus,
                dataRemessa: agora,
                historico: [
                  ...t.historico,
                  {
                    id: uid("ev"),
                    data: agora,
                    tipo: "Remessa CENPROT",
                    descricao: `Incluído na fila de remessa (ambiente ${db.integracoes.cenprot.ambiente.toLowerCase()}).`,
                    autor: db.usuarioAtual.nome,
                  },
                ],
              }
            : t,
        ),
      }));
      get().notificar({
        titulo: `${ids.length} título(s) na fila de remessa`,
        descricao: "O arquivo será transmitido ao CENPROT na próxima janela.",
        tone: "ok",
      });
    },

    /* ----------------------------- Devedores ----------------------------- */

    salvarDevedor(input) {
      let resultado!: Devedor;
      commit((db) => {
        if (input.id && db.devedores.some((d) => d.id === input.id)) {
          resultado = { ...db.devedores.find((d) => d.id === input.id)!, ...input } as Devedor;
          return { ...db, devedores: replace(db.devedores, input.id, input) };
        }
        resultado = {
          id: uid("dev"),
          nome: input.nome ?? "",
          documento: input.documento ?? "",
          tipo: input.tipo ?? "PF",
          email: input.email ?? null,
          telefone: input.telefone ?? null,
          whatsapp: input.whatsapp ?? null,
          cidade: input.cidade ?? "",
          uf: input.uf ?? "",
          empresaId: input.empresaId!,
          bloqueado: false,
          criadoEm: iso(hoje()),
        };
        return { ...db, devedores: [resultado, ...db.devedores] };
      });
      return resultado;
    },

    alternarBloqueioDevedor(id) {
      commit((db) => ({
        ...db,
        devedores: db.devedores.map((d) =>
          d.id === id ? { ...d, bloqueado: !d.bloqueado } : d,
        ),
      }));
    },

    /* ------------------------------ Empresas ----------------------------- */

    salvarEmpresa(input) {
      let resultado!: Empresa;
      commit((db) => {
        if (input.id && db.empresas.some((e) => e.id === input.id)) {
          resultado = { ...db.empresas.find((e) => e.id === input.id)!, ...input } as Empresa;
          return { ...db, empresas: replace(db.empresas, input.id, input) };
        }
        resultado = {
          id: uid("emp"),
          razaoSocial: input.razaoSocial ?? "",
          nomeFantasia: input.nomeFantasia ?? "",
          cnpj: input.cnpj ?? "",
          segmento: input.segmento ?? "",
          cidade: input.cidade ?? "",
          uf: input.uf ?? "",
          email: input.email ?? "",
          telefone: input.telefone ?? "",
          ativa: true,
          criadaEm: iso(hoje()),
          indiceFinanceiro: input.indiceFinanceiro ?? "IGPM",
          multaPercentual: input.multaPercentual ?? 2,
          jurosMensalPercentual: input.jurosMensalPercentual ?? 1,
          protestoAutomatico: input.protestoAutomatico ?? false,
          diasParaProtesto: input.diasParaProtesto ?? 30,
        };
        return { ...db, empresas: [...db.empresas, resultado] };
      });
      return resultado;
    },

    /* ------------------------------ Usuários ----------------------------- */

    salvarUsuario(input) {
      let resultado!: Usuario;
      commit((db) => {
        if (input.id && db.usuarios.some((u) => u.id === input.id)) {
          resultado = { ...db.usuarios.find((u) => u.id === input.id)!, ...input } as Usuario;
          return { ...db, usuarios: replace(db.usuarios, input.id, input) };
        }
        resultado = {
          id: uid("usr"),
          nome: input.nome ?? "",
          email: input.email ?? "",
          cargo: input.cargo ?? "",
          perfil: input.perfil ?? "OPERADOR",
          contaId: db.contaSupervisora.id,
          empresasIds: input.empresasIds ?? [],
          ultimoAcesso: iso(hoje()),
          ativo: true,
          permissoes:
            input.permissoes ?? {
              reguasProprias: false,
              inserirTitulo: true,
              gestaoEmpresas: false,
              consultas: true,
              financeiro: false,
              juridico: false,
              enviarProtesto: false,
              exportarDados: false,
            },
        };
        return { ...db, usuarios: [...db.usuarios, resultado] };
      });
      return resultado;
    },

    removerUsuario(id) {
      commit((db) => ({ ...db, usuarios: db.usuarios.filter((u) => u.id !== id) }));
    },

    /* -------------------------------- Régua ------------------------------ */

    salvarRegua(regua) {
      commit((db) => ({
        ...db,
        reguas: db.reguas.some((r) => r.id === regua.id)
          ? db.reguas.map((r) => (r.id === regua.id ? { ...regua, atualizadaEm: iso(hoje()) } : r))
          : [...db.reguas, regua],
      }));
    },

    salvarTemplate(template) {
      commit((db) => ({
        ...db,
        templates: db.templates.some((t) => t.id === template.id)
          ? db.templates.map((t) => (t.id === template.id ? template : t))
          : [...db.templates, template],
      }));
    },

    /* ------------------------------- Acordos ----------------------------- */

    salvarAcordo(input) {
      let resultado!: Acordo;
      commit((db) => {
        if (input.id && db.acordos.some((a) => a.id === input.id)) {
          resultado = { ...db.acordos.find((a) => a.id === input.id)!, ...input } as Acordo;
          return { ...db, acordos: replace(db.acordos, input.id, input) };
        }
        const id = uid("acr");
        resultado = {
          id,
          codigo: `ACD-${String(db.acordos.length + 2460).padStart(5, "0")}`,
          empresaId: input.empresaId!,
          devedorId: input.devedorId!,
          titulosIds: input.titulosIds ?? [],
          valorDivida: input.valorDivida ?? 0,
          valorAcordo: input.valorAcordo ?? 0,
          descontoPercentual: input.descontoPercentual ?? 0,
          entrada: input.entrada ?? 0,
          parcelas: input.parcelas ?? [],
          status: input.status ?? "NEGOCIACAO",
          criadoEm: iso(hoje()),
          assinadoEm: null,
          assinadorExterno: null,
          responsavel: db.usuarioAtual.nome,
        };
        return {
          ...db,
          acordos: [resultado, ...db.acordos],
          titulos: db.titulos.map((t) =>
            resultado.titulosIds.includes(t.id) ? { ...t, acordoId: id } : t,
          ),
        };
      });
      return resultado;
    },

    moverAcordo(id, status) {
      commit((db) => ({
        ...db,
        acordos: db.acordos.map((a) =>
          a.id === id
            ? {
                ...a,
                status,
                assinadoEm:
                  a.assinadoEm ??
                  (["FIRMADO", "EM_CUMPRIMENTO", "CONCLUIDO"].includes(status)
                    ? iso(hoje())
                    : null),
              }
            : a,
        ),
      }));
    },

    registrarPagamentoParcela(acordoId, parcelaId) {
      commit((db) => ({
        ...db,
        acordos: db.acordos.map((a) => {
          if (a.id !== acordoId) return a;
          const parcelas = a.parcelas.map((p) =>
            p.id === parcelaId ? { ...p, pago: true, pagoEm: iso(hoje()) } : p,
          );
          const todasPagas = parcelas.every((p) => p.pago);
          return {
            ...a,
            parcelas,
            status: todasPagas ? ("CONCLUIDO" as AcordoStatus) : a.status,
          };
        }),
      }));
    },

    /* ------------------------------ Processos ---------------------------- */

    salvarProcesso(input) {
      let resultado!: Processo;
      commit((db) => {
        if (input.id && db.processos.some((p) => p.id === input.id)) {
          resultado = { ...db.processos.find((p) => p.id === input.id)!, ...input } as Processo;
          return { ...db, processos: replace(db.processos, input.id, input) };
        }
        resultado = {
          id: uid("prc"),
          numeroCNJ: input.numeroCNJ ?? "",
          empresaId: input.empresaId!,
          devedorId: input.devedorId!,
          titulosIds: input.titulosIds ?? [],
          comarca: input.comarca ?? "",
          vara: input.vara ?? "",
          advogadoId: input.advogadoId ?? db.advogados[0].id,
          prioridade: input.prioridade ?? "MEDIA",
          status: input.status ?? "NOVO",
          valorCausa: input.valorCausa ?? 0,
          custas: input.custas ?? 0,
          distribuidoEm: null,
          criadoEm: iso(hoje()),
          movimentacoes: [],
          anexos: [],
        };
        return { ...db, processos: [resultado, ...db.processos] };
      });
      return resultado;
    },

    moverProcesso(id, status) {
      commit((db) => ({
        ...db,
        processos: db.processos.map((p) =>
          p.id === id
            ? {
                ...p,
                status,
                movimentacoes: [
                  ...p.movimentacoes,
                  {
                    id: uid("mov"),
                    data: iso(hoje()),
                    titulo: "Atualização de fase",
                    descricao: `Processo movido para ${status}.`,
                  },
                ],
              }
            : p,
        ),
      }));
    },

    /* ------------------------------ Financeiro --------------------------- */

    criarCobranca(input) {
      const rng = createRng(Date.now() % 2147483647);
      const agora = hoje();
      let resultado!: CobrancaPix;
      commit((db) => {
        const empresa = db.empresas.find((e) => e.id === input.empresaId)!;
        resultado = {
          id: uid("cob"),
          codigo: `PIX-${9100 + db.cobrancas.length}`,
          empresaId: input.empresaId,
          devedorId: input.devedorId,
          tituloId: input.tituloId,
          descricao: input.descricao,
          valor: input.valor,
          status: "PENDENTE",
          chave: input.chave,
          criadaEm: iso(agora),
          expiraEm: iso(addDays(agora, input.validadeDias)),
          pagoEm: null,
          copiaECola: gerarCopiaECola(rng, input.chave, input.valor, empresa.nomeFantasia),
        };
        return { ...db, cobrancas: [resultado, ...db.cobrancas] };
      });
      return resultado;
    },

    atualizarCobranca(id, patch) {
      commit((db) => ({ ...db, cobrancas: replace(db.cobrancas, id, patch) }));
    },

    salvarDespesa(input) {
      let resultado!: Despesa;
      commit((db) => {
        if (input.id && db.despesas.some((d) => d.id === input.id)) {
          resultado = { ...db.despesas.find((d) => d.id === input.id)!, ...input } as Despesa;
          return { ...db, despesas: replace(db.despesas, input.id, input) };
        }
        resultado = {
          id: uid("dsp"),
          empresaId: input.empresaId!,
          categoria: input.categoria ?? "Outros",
          descricao: input.descricao ?? "",
          fornecedor: input.fornecedor ?? "",
          valor: input.valor ?? 0,
          vencimento: input.vencimento ?? iso(hoje()),
          status: input.status ?? "PENDENTE",
          comprovante: null,
        };
        return { ...db, despesas: [resultado, ...db.despesas] };
      });
      return resultado;
    },

    /* -------------------------- Advogados / testemunhas ------------------ */

    salvarAdvogado(input) {
      let resultado!: Advogado;
      commit((db) => {
        if (input.id && db.advogados.some((a) => a.id === input.id)) {
          resultado = { ...db.advogados.find((a) => a.id === input.id)!, ...input } as Advogado;
          return { ...db, advogados: replace(db.advogados, input.id, input) };
        }
        resultado = {
          id: uid("adv"),
          nome: input.nome ?? "",
          oab: input.oab ?? "",
          ufOab: input.ufOab ?? "SP",
          email: input.email ?? "",
          telefone: input.telefone ?? "",
          ativo: true,
        };
        return { ...db, advogados: [...db.advogados, resultado] };
      });
      return resultado;
    },

    salvarTestemunha(input) {
      let resultado!: Testemunha;
      commit((db) => {
        if (input.id && db.testemunhas.some((t) => t.id === input.id)) {
          resultado = { ...db.testemunhas.find((t) => t.id === input.id)!, ...input } as Testemunha;
          return { ...db, testemunhas: replace(db.testemunhas, input.id, input) };
        }
        resultado = {
          id: uid("tst"),
          nome: input.nome ?? "",
          documento: input.documento ?? "",
          email: input.email ?? null,
          telefone: input.telefone ?? null,
        };
        return { ...db, testemunhas: [...db.testemunhas, resultado] };
      });
      return resultado;
    },

    /* ------------------------------- Avisos ------------------------------ */

    enviarAvisoManual(tituloId, canal) {
      commit((db) => {
        const titulo = db.titulos.find((t) => t.id === tituloId)!;
        const devedor = db.devedores.find((d) => d.id === titulo.devedorId)!;
        const destino = canal === "EMAIL" ? devedor.email : devedor.whatsapp;
        const aviso: Aviso = {
          id: uid("avs"),
          tituloId,
          devedorId: devedor.id,
          empresaId: titulo.empresaId,
          canal,
          fase: "DEPOIS_VENCIMENTO",
          status: destino ? "ENVIADO" : "FALHA",
          destino: destino ?? "—",
          enviadoEm: iso(hoje()),
          erro: destino ? null : `Devedor sem ${canal === "EMAIL" ? "e-mail" : "WhatsApp"} cadastrado`,
          origem: "MANUAL",
        };
        return { ...db, avisos: [aviso, ...db.avisos] };
      });
    },

    /* ------------------------------ WhatsApp ----------------------------- */

    responderConversa(conversaId, texto) {
      commit((db) => ({
        ...db,
        conversas: db.conversas.map((c) =>
          c.id === conversaId
            ? {
                ...c,
                atualizadaEm: iso(new Date()),
                naoLidas: 0,
                mensagens: [
                  ...c.mensagens,
                  {
                    id: uid("msg"),
                    autor: "OPERADOR" as const,
                    texto,
                    enviadaEm: iso(new Date()),
                    lida: true,
                  },
                ],
              }
            : c,
        ),
      }));
    },

    marcarConversaLida(conversaId) {
      commit((db) => ({
        ...db,
        conversas: db.conversas.map((c) =>
          c.id === conversaId
            ? { ...c, naoLidas: 0, mensagens: c.mensagens.map((m) => ({ ...m, lida: true })) }
            : c,
        ),
      }));
    },

    definirTriagem(conversaId, triagem) {
      commit((db) => ({
        ...db,
        conversas: db.conversas.map((c) => (c.id === conversaId ? { ...c, triagem } : c)),
      }));
    },

    /* ----------------------------- Importações --------------------------- */

    registrarImportacao(imp) {
      commit((db) => ({
        ...db,
        importacoes: [{ ...imp, id: uid("imp") }, ...db.importacoes],
      }));
    },

    desfazerImportacao(id) {
      commit((db) => ({
        ...db,
        importacoes: db.importacoes.map((i) => (i.id === id ? { ...i, desfeita: true } : i)),
      }));
    },

    /* --------------------------- Configurações --------------------------- */

    salvarConfigMensagens(configMensagens) {
      commit((db) => ({ ...db, configMensagens }));
    },

    salvarIntegracoes(integracoes) {
      commit((db) => ({ ...db, integracoes }));
    },
  };
});
