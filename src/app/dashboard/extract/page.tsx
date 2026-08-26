"use client";

import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Printer,
  Receipt,
  TrendUp,
} from "@phosphor-icons/react";
import { Badge, Button, Card, CardHeader, KpiCard, PageHeader } from "@/components/ui/primitives";
import { DataTable, type Coluna } from "@/components/ui/data-table";
import { Input, SearchInput, Select } from "@/components/ui/form";
import { BarraFiltros, CampoFiltro } from "@/components/dashboard/filtros";
import { GraficoBarrasSimples } from "@/components/ui/charts";
import { useApp } from "@/store/app-store";
import { useEscopo, useIndices } from "@/store/selectors";
import { date, money, moneyCompact, num } from "@/lib/format";
import { addDays, hoje, type Lancamento, type LancamentoTipo } from "@/lib/domain";
import { cn } from "@/lib/cn";

export default function ExtratoPage() {
  const { db } = useApp();
  const lancamentos = useEscopo(db.lancamentos);
  const { empresaPorId } = useIndices();

  const [tipo, setTipo] = useState<LancamentoTipo | "">("");
  const [busca, setBusca] = useState("");
  const [de, setDe] = useState(() => addDays(hoje(), -90).toISOString().slice(0, 10));
  const [ate, setAte] = useState(() => hoje().toISOString().slice(0, 10));

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const dDe = de ? new Date(de).getTime() : null;
    const dAte = ate ? new Date(ate).getTime() + 86_400_000 : null;

    return [...lancamentos]
      .filter((l) => {
        if (tipo && l.tipo !== tipo) return false;
        const t = new Date(l.data).getTime();
        if (dDe && t < dDe) return false;
        if (dAte && t > dAte) return false;
        if (!termo) return true;
        return (
          l.descricao.toLowerCase().includes(termo) ||
          l.contraparte.toLowerCase().includes(termo) ||
          l.categoria.toLowerCase().includes(termo)
        );
      })
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }, [lancamentos, tipo, busca, de, ate]);

  const creditos = filtrados.filter((l) => l.tipo === "CREDITO");
  const debitos = filtrados.filter((l) => l.tipo === "DEBITO");
  const totalCredito = creditos.reduce((s, l) => s + l.valor, 0);
  const totalDebito = debitos.reduce((s, l) => s + l.valor, 0);
  const saldoFinal = lancamentos.length ? lancamentos[lancamentos.length - 1].saldo : 0;

  // Movimento por mês dentro do período filtrado
  const porMes = useMemo(() => {
    const mapa = new Map<string, { rotulo: string; entradas: number; ordem: number }>();
    for (const l of filtrados) {
      const d = new Date(l.data);
      const chave = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
      const atual = mapa.get(chave) ?? {
        rotulo: d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
        entradas: 0,
        ordem: d.getTime(),
      };
      atual.entradas += l.tipo === "CREDITO" ? l.valor : -l.valor;
      mapa.set(chave, atual);
    }
    return [...mapa.values()]
      .sort((a, b) => a.ordem - b.ordem)
      .map((m) => ({ rotulo: m.rotulo, entradas: Math.round(m.entradas) }));
  }, [filtrados]);

  const colunas: Coluna<Lancamento>[] = [
    {
      id: "data",
      cabecalho: "Data",
      ordenavel: true,
      valor: (l) => new Date(l.data).getTime(),
      celula: (l) => <span className="tnum text-fg-muted">{date(l.data)}</span>,
    },
    {
      id: "descricao",
      cabecalho: "Descrição",
      largura: "300px",
      valor: (l) => l.descricao,
      celula: (l) => (
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              "grid size-7 shrink-0 place-items-center rounded-lg",
              l.tipo === "CREDITO" ? "bg-ok-soft text-ok" : "bg-danger-soft text-danger",
            )}
          >
            {l.tipo === "CREDITO" ? <ArrowDown size={13} weight="bold" /> : <ArrowUp size={13} weight="bold" />}
          </span>
          <span className="truncate font-medium text-fg">{l.descricao}</span>
        </div>
      ),
    },
    {
      id: "categoria",
      cabecalho: "Categoria",
      valor: (l) => l.categoria,
      celula: (l) => <Badge tone="neutral">{l.categoria}</Badge>,
    },
    {
      id: "contraparte",
      cabecalho: "Contraparte",
      opcional: true,
      valor: (l) => l.contraparte,
      celula: (l) => <span className="truncate text-fg-muted">{l.contraparte}</span>,
    },
    {
      id: "empresa",
      cabecalho: "Empresa",
      opcional: true,
      valor: (l) => empresaPorId.get(l.empresaId)?.nomeFantasia ?? "",
      celula: (l) => (
        <span className="text-fg-muted">{empresaPorId.get(l.empresaId)?.nomeFantasia}</span>
      ),
    },
    {
      id: "valor",
      cabecalho: "Valor",
      alinhamento: "right",
      ordenavel: true,
      valor: (l) => (l.tipo === "CREDITO" ? l.valor : -l.valor),
      celula: (l) => (
        <span
          className={cn("tnum font-semibold", l.tipo === "CREDITO" ? "text-ok" : "text-danger")}
        >
          {l.tipo === "CREDITO" ? "+" : "−"} {money(l.valor)}
        </span>
      ),
    },
    {
      id: "saldo",
      cabecalho: "Saldo",
      alinhamento: "right",
      opcional: true,
      valor: (l) => l.saldo,
      celula: (l) => <span className="tnum text-fg-muted">{money(l.saldo)}</span>,
    },
  ];

  return (
    <>
      <PageHeader
        breadcrumb="Financeiro"
        titulo="Extrato bancário"
        descricao="Lançamentos da conta de recebimento, com créditos de PIX conciliados aos títulos."
        acoes={
          <Button variant="outline" onClick={() => window.print()}>
            <Printer size={15} /> Imprimir / PDF
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Saldo atual"
          valor={money(saldoFinal)}
          icon={<Receipt size={17} weight="duotone" />}
          tone="accent"
        />
        <KpiCard
          label="Entradas no período"
          valor={money(totalCredito)}
          sub={`${num(creditos.length)} lançamentos`}
          tone="ok"
          icon={<ArrowDown size={17} weight="bold" />}
        />
        <KpiCard
          label="Saídas no período"
          valor={money(totalDebito)}
          sub={`${num(debitos.length)} lançamentos`}
          tone="danger"
          icon={<ArrowUp size={17} weight="bold" />}
        />
        <KpiCard
          label="Resultado"
          valor={money(totalCredito - totalDebito)}
          sub="entradas menos saídas"
          tone={totalCredito - totalDebito >= 0 ? "ok" : "danger"}
          icon={<TrendUp size={17} weight="duotone" />}
        />
      </div>

      <Card className="mt-4">
        <CardHeader
          title="Resultado líquido por mês"
          description="Entradas menos saídas dentro do período filtrado."
        />
        <div className="p-4">
          <GraficoBarrasSimples
            dados={porMes}
            chave="entradas"
            nome="Resultado"
            altura={200}
            formatador={moneyCompact}
          />
        </div>
      </Card>

      <div className="mt-4">
        <BarraFiltros
          ativos={(tipo ? 1 : 0) + (busca ? 1 : 0)}
          aoLimpar={() => {
            setTipo("");
            setBusca("");
          }}
        >
          <CampoFiltro label="Descrição, categoria ou contraparte" className="lg:col-span-2">
            <SearchInput
              placeholder="Buscar…"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </CampoFiltro>
          <CampoFiltro label="Tipo">
            <Select value={tipo} onChange={(e) => setTipo(e.target.value as LancamentoTipo)}>
              <option value="">Todos</option>
              <option value="CREDITO">Entradas</option>
              <option value="DEBITO">Saídas</option>
            </Select>
          </CampoFiltro>
          <CampoFiltro label="De">
            <Input type="date" value={de} onChange={(e) => setDe(e.target.value)} />
          </CampoFiltro>
          <CampoFiltro label="Até">
            <Input type="date" value={ate} onChange={(e) => setAte(e.target.value)} />
          </CampoFiltro>
        </BarraFiltros>

        <DataTable
          dados={filtrados}
          colunas={colunas}
          chave={(l) => l.id}
          storageKey="extrato"
          exportarNome="extrato"
          porPagina={25}
          denso
          vazio={{ icon: <Receipt size={22} />, titulo: "Nenhum lançamento no período" }}
        />
      </div>
    </>
  );
}
