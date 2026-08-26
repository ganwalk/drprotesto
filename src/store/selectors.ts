"use client";

import { useMemo } from "react";
import { useApp } from "./app-store";
import { daysBetween } from "@/lib/format";
import {
  hoje,
  type Acordo,
  type Devedor,
  type Empresa,
  type Titulo,
  type TituloStatus,
} from "@/lib/domain";

/** Empresa selecionada no seletor global, ou null quando o escopo é "todas". */
export function useEmpresaAtiva(): Empresa | null {
  const { db, empresaAtivaId } = useApp();
  return useMemo(
    () => (empresaAtivaId === "TODAS" ? null : db.empresas.find((e) => e.id === empresaAtivaId) ?? null),
    [db.empresas, empresaAtivaId],
  );
}

/** Aplica o escopo de empresa a qualquer coleção que tenha empresaId. */
export function useEscopo<T extends { empresaId: string }>(lista: T[]): T[] {
  const empresaAtivaId = useApp((s) => s.empresaAtivaId);
  return useMemo(
    () => (empresaAtivaId === "TODAS" ? lista : lista.filter((i) => i.empresaId === empresaAtivaId)),
    [lista, empresaAtivaId],
  );
}

export function useIndices() {
  const db = useApp((s) => s.db);
  return useMemo(
    () => ({
      devedorPorId: new Map(db.devedores.map((d) => [d.id, d])),
      empresaPorId: new Map(db.empresas.map((e) => [e.id, e])),
      tituloPorId: new Map(db.titulos.map((t) => [t.id, t])),
      advogadoPorId: new Map(db.advogados.map((a) => [a.id, a])),
      templatePorId: new Map(db.templates.map((t) => [t.id, t])),
      acordoPorId: new Map(db.acordos.map((a) => [a.id, a])),
    }),
    [db],
  );
}

export interface KpisCarteira {
  totalTitulos: number;
  valorTotal: number;
  valorVencido: number;
  valorRecuperado: number;
  devedoresAtivos: number;
  ticketMedio: number;
  taxaRecuperacao: number;
  diasMedioAtraso: number;
  porStatus: Record<TituloStatus, { qtd: number; valor: number }>;
}

const STATUS_VAZIO = (): Record<TituloStatus, { qtd: number; valor: number }> => ({
  NO_PRAZO: { qtd: 0, valor: 0 },
  PRE_PROTESTO: { qtd: 0, valor: 0 },
  AGUARDANDO_REMESSA: { qtd: 0, valor: 0 },
  EM_CARTORIO: { qtd: 0, valor: 0 },
  DEVOLVIDO: { qtd: 0, valor: 0 },
  PROTESTADO: { qtd: 0, valor: 0 },
  JURIDICO: { qtd: 0, valor: 0 },
  LIQUIDADO: { qtd: 0, valor: 0 },
});

export function calcularKpis(titulos: Titulo[]): KpisCarteira {
  const porStatus = STATUS_VAZIO();
  let valorTotal = 0;
  let valorVencido = 0;
  let valorRecuperado = 0;
  let somaAtraso = 0;
  let vencidos = 0;
  const devedores = new Set<string>();

  for (const t of titulos) {
    porStatus[t.status].qtd += 1;
    porStatus[t.status].valor += t.valorAtualizado;
    devedores.add(t.devedorId);

    if (t.status === "LIQUIDADO") {
      valorRecuperado += t.valorAtualizado;
    } else {
      valorTotal += t.valorAtualizado;
      const atraso = daysBetween(t.vencimento, hoje());
      if (atraso > 0) {
        valorVencido += t.valorAtualizado;
        somaAtraso += atraso;
        vencidos += 1;
      }
    }
  }

  const totalComRecuperado = valorTotal + valorRecuperado;
  return {
    totalTitulos: titulos.length,
    valorTotal,
    valorVencido,
    valorRecuperado,
    devedoresAtivos: devedores.size,
    ticketMedio: titulos.length ? totalComRecuperado / titulos.length : 0,
    taxaRecuperacao: totalComRecuperado ? valorRecuperado / totalComRecuperado : 0,
    diasMedioAtraso: vencidos ? Math.round(somaAtraso / vencidos) : 0,
    porStatus,
  };
}

export function useKpis(): KpisCarteira {
  const db = useApp((s) => s.db);
  const titulos = useEscopo(db.titulos);
  return useMemo(() => calcularKpis(titulos), [titulos]);
}

/** Visão consolidada por devedor usada na Carteira de Devedores. */
export interface LinhaCarteira {
  devedor: Devedor;
  empresa: Empresa;
  titulos: Titulo[];
  qtdTitulos: number;
  valorAberto: number;
  maiorAtraso: number;
  statusPrincipal: TituloStatus;
  temContato: boolean;
  acordo: Acordo | null;
}

export function useCarteira(): LinhaCarteira[] {
  const db = useApp((s) => s.db);
  const titulos = useEscopo(db.titulos);
  const { devedorPorId, empresaPorId } = useIndices();

  return useMemo(() => {
    const agrupado = new Map<string, Titulo[]>();
    for (const t of titulos) {
      agrupado.set(t.devedorId, [...(agrupado.get(t.devedorId) ?? []), t]);
    }

    const acordoPorDevedor = new Map(
      db.acordos
        .filter((a) => !["CONCLUIDO", "DESCUMPRIDO"].includes(a.status))
        .map((a) => [a.devedorId, a]),
    );

    const ordemGravidade: TituloStatus[] = [
      "JURIDICO",
      "PROTESTADO",
      "DEVOLVIDO",
      "EM_CARTORIO",
      "AGUARDANDO_REMESSA",
      "PRE_PROTESTO",
      "NO_PRAZO",
      "LIQUIDADO",
    ];

    const linhas: LinhaCarteira[] = [];
    for (const [devedorId, ts] of agrupado) {
      const devedor = devedorPorId.get(devedorId);
      const empresa = empresaPorId.get(ts[0].empresaId);
      if (!devedor || !empresa) continue;

      const abertos = ts.filter((t) => t.status !== "LIQUIDADO");
      const statusPrincipal =
        ordemGravidade.find((s) => ts.some((t) => t.status === s)) ?? "NO_PRAZO";

      linhas.push({
        devedor,
        empresa,
        titulos: ts,
        qtdTitulos: ts.length,
        valorAberto: abertos.reduce((s, t) => s + t.valorAtualizado, 0),
        maiorAtraso: Math.max(
          0,
          ...abertos.map((t) => daysBetween(t.vencimento, hoje())),
        ),
        statusPrincipal,
        temContato: Boolean(devedor.email || devedor.whatsapp || devedor.telefone),
        acordo: acordoPorDevedor.get(devedorId) ?? null,
      });
    }

    return linhas.sort((a, b) => b.valorAberto - a.valorAberto);
  }, [titulos, devedorPorId, empresaPorId, db.acordos]);
}

/**
 * Série mensal de vencimento x recuperação.
 *
 * "Vencido no mês" e "recuperado no mês" ficam na mesma ordem de grandeza,
 * então as duas áreas são comparáveis — diferente de emissão x recuperação,
 * em que a emissão de uma carteira em crescimento achata a recuperação.
 */
export function useSerieMensal(meses = 12) {
  const db = useApp((s) => s.db);
  const titulos = useEscopo(db.titulos);

  return useMemo(() => {
    const ref = hoje();
    const buckets = Array.from({ length: meses }, (_, i) => {
      const d = new Date(ref.getFullYear(), ref.getMonth() - (meses - 1 - i), 1);
      return {
        chave: `${d.getFullYear()}-${d.getMonth()}`,
        mes: d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
        ano: d.getFullYear(),
        vencido: 0,
        recuperado: 0,
        protestado: 0,
      };
    });
    const porChave = new Map(buckets.map((b) => [b.chave, b]));

    for (const t of titulos) {
      const vencimento = new Date(t.vencimento);
      const bucket = porChave.get(`${vencimento.getFullYear()}-${vencimento.getMonth()}`);
      if (bucket) bucket.vencido += t.valorAtualizado;

      if (t.status === "LIQUIDADO") {
        const evento = t.historico.find((h) => h.tipo === "Liquidação");
        if (evento) {
          const d = new Date(evento.data);
          const b = porChave.get(`${d.getFullYear()}-${d.getMonth()}`);
          if (b) b.recuperado += t.valorAtualizado;
        }
      }
      if (t.dataProtesto) {
        const d = new Date(t.dataProtesto);
        const b = porChave.get(`${d.getFullYear()}-${d.getMonth()}`);
        if (b) b.protestado += t.valorAtualizado;
      }
    }

    return buckets.map((b) => ({
      ...b,
      vencido: Math.round(b.vencido),
      recuperado: Math.round(b.recuperado),
      protestado: Math.round(b.protestado),
    }));
  }, [titulos, meses]);
}

/** Faixas de aging usadas no dashboard e na carteira. */
export function useAging() {
  const db = useApp((s) => s.db);
  const titulos = useEscopo(db.titulos);

  return useMemo(() => {
    const faixas = [
      { faixa: "A vencer", min: -9999, max: 0, valor: 0, qtd: 0 },
      { faixa: "1–30 d", min: 1, max: 30, valor: 0, qtd: 0 },
      { faixa: "31–60 d", min: 31, max: 60, valor: 0, qtd: 0 },
      { faixa: "61–90 d", min: 61, max: 90, valor: 0, qtd: 0 },
      { faixa: "91–180 d", min: 91, max: 180, valor: 0, qtd: 0 },
      { faixa: "+180 d", min: 181, max: 99999, valor: 0, qtd: 0 },
    ];
    for (const t of titulos) {
      if (t.status === "LIQUIDADO") continue;
      const atraso = daysBetween(t.vencimento, hoje());
      const faixa = faixas.find((f) => atraso >= f.min && atraso <= f.max);
      if (faixa) {
        faixa.valor += t.valorAtualizado;
        faixa.qtd += 1;
      }
    }
    return faixas.map((f) => ({ ...f, valor: Math.round(f.valor) }));
  }, [titulos]);
}

export function useAvisosResumo() {
  const db = useApp((s) => s.db);
  const avisos = useEscopo(db.avisos);

  return useMemo(() => {
    const total = avisos.length;
    const entregues = avisos.filter((a) => ["ENTREGUE", "LIDO"].includes(a.status)).length;
    const falhas = avisos.filter((a) => a.status === "FALHA").length;
    const lidos = avisos.filter((a) => a.status === "LIDO").length;
    const porCanal = {
      EMAIL: avisos.filter((a) => a.canal === "EMAIL").length,
      WHATSAPP: avisos.filter((a) => a.canal === "WHATSAPP").length,
      SMS: avisos.filter((a) => a.canal === "SMS").length,
    };
    return {
      total,
      entregues,
      falhas,
      lidos,
      porCanal,
      taxaSucesso: total ? entregues / total : 0,
      taxaLeitura: entregues ? lidos / entregues : 0,
    };
  }, [avisos]);
}
