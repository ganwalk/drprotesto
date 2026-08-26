"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, Copy, Plus, Receipt, XCircle } from "@phosphor-icons/react";
import { Button, KpiCard, PageHeader, Segmented } from "@/components/ui/primitives";
import { StatusPill } from "@/components/ui/status-pill";
import { DataTable, type Coluna } from "@/components/ui/data-table";
import { Drawer } from "@/components/ui/overlay";
import { SearchInput } from "@/components/ui/form";
import { QrCodePix, useCopiar } from "@/components/dashboard/qrcode-pix";
import { useApp } from "@/store/app-store";
import { useEscopo, useIndices } from "@/store/selectors";
import { COBRANCA_STATUS } from "@/lib/status";
import { date, money, num } from "@/lib/format";
import type { CobrancaPix, CobrancaStatus } from "@/lib/domain";

export default function LinksCobrancaPage() {
  const { db, atualizarCobranca, mudarStatusTitulo, notificar } = useApp();
  const cobrancas = useEscopo(db.cobrancas);
  const { devedorPorId } = useIndices();
  const { copiado, copiar } = useCopiar();

  const [status, setStatus] = useState<CobrancaStatus | "TODAS">("TODAS");
  const [busca, setBusca] = useState("");
  const [detalhe, setDetalhe] = useState<CobrancaPix | null>(null);

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return cobrancas.filter((c) => {
      if (status !== "TODAS" && c.status !== status) return false;
      if (!termo) return true;
      const devedor = c.devedorId ? devedorPorId.get(c.devedorId) : null;
      return (
        c.codigo.toLowerCase().includes(termo) ||
        c.descricao.toLowerCase().includes(termo) ||
        (devedor?.nome.toLowerCase().includes(termo) ?? false)
      );
    });
  }, [cobrancas, status, busca, devedorPorId]);

  const contar = (s: CobrancaStatus | "TODAS") =>
    s === "TODAS" ? cobrancas.length : cobrancas.filter((c) => c.status === s).length;

  const pagas = cobrancas.filter((c) => c.status === "PAGO");
  const pendentes = cobrancas.filter((c) => c.status === "PENDENTE");

  const marcarPaga = (c: CobrancaPix) => {
    atualizarCobranca(c.id, { status: "PAGO", pagoEm: new Date().toISOString() });
    if (c.tituloId) {
      mudarStatusTitulo([c.tituloId], "LIQUIDADO", "Pagamento PIX conciliado automaticamente.");
    }
    notificar({
      titulo: "Pagamento confirmado",
      descricao: c.tituloId
        ? `${c.codigo} · título liquidado e baixado na carteira.`
        : `${c.codigo} · crédito lançado no extrato.`,
      tone: "ok",
    });
    setDetalhe(null);
  };

  const colunas: Coluna<CobrancaPix>[] = [
    {
      id: "codigo",
      cabecalho: "Código",
      ordenavel: true,
      valor: (c) => c.codigo,
      celula: (c) => <span className="tnum font-medium text-fg">{c.codigo}</span>,
    },
    {
      id: "descricao",
      cabecalho: "Descrição",
      largura: "300px",
      valor: (c) => c.descricao,
      celula: (c) => <span className="truncate text-fg">{c.descricao}</span>,
    },
    {
      id: "devedor",
      cabecalho: "Devedor",
      valor: (c) => (c.devedorId ? (devedorPorId.get(c.devedorId)?.nome ?? "") : "Avulsa"),
      celula: (c) => (
        <span className="truncate text-fg-muted">
          {c.devedorId ? (devedorPorId.get(c.devedorId)?.nome ?? "—") : "Cobrança avulsa"}
        </span>
      ),
    },
    {
      id: "valor",
      cabecalho: "Valor",
      alinhamento: "right",
      ordenavel: true,
      valor: (c) => c.valor,
      celula: (c) => <span className="tnum font-semibold text-fg">{money(c.valor)}</span>,
    },
    {
      id: "criada",
      cabecalho: "Criada em",
      ordenavel: true,
      valor: (c) => new Date(c.criadaEm).getTime(),
      celula: (c) => <span className="tnum text-fg-muted">{date(c.criadaEm)}</span>,
    },
    {
      id: "expira",
      cabecalho: "Expira em",
      opcional: true,
      ordenavel: true,
      valor: (c) => new Date(c.expiraEm).getTime(),
      celula: (c) => <span className="tnum text-fg-muted">{date(c.expiraEm)}</span>,
    },
    {
      id: "pago",
      cabecalho: "Pago em",
      opcional: true,
      valor: (c) => (c.pagoEm ? new Date(c.pagoEm).getTime() : 0),
      celula: (c) =>
        c.pagoEm ? (
          <span className="tnum text-ok">{date(c.pagoEm)}</span>
        ) : (
          <span className="text-fg-subtle">—</span>
        ),
    },
    {
      id: "status",
      cabecalho: "Status",
      ordenavel: true,
      valor: (c) => COBRANCA_STATUS[c.status].label,
      celula: (c) => <StatusPill meta={COBRANCA_STATUS[c.status]} />,
    },
  ];

  return (
    <>
      <PageHeader
        breadcrumb="Financeiro · PIX"
        titulo="Meus links de cobrança"
        descricao="Todas as cobranças geradas, com o estado de cada uma e a conciliação com a carteira."
        acoes={
          <Link href="/dashboard/pix/configurar-link">
            <Button>
              <Plus size={15} weight="bold" /> Nova cobrança
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Links gerados" valor={num(cobrancas.length)} />
        <KpiCard
          label="Pagos"
          valor={money(pagas.reduce((s, c) => s + c.valor, 0))}
          sub={`${num(pagas.length)} cobranças`}
          tone="ok"
        />
        <KpiCard
          label="Pendentes"
          valor={money(pendentes.reduce((s, c) => s + c.valor, 0))}
          sub={`${num(pendentes.length)} aguardando`}
          tone="warn"
        />
        <KpiCard
          label="Conversão"
          valor={
            cobrancas.length ? `${((pagas.length / cobrancas.length) * 100).toFixed(1)}%` : "—"
          }
          tone="accent"
        />
      </div>

      <div className="mt-4 mb-4 flex flex-wrap items-center gap-3">
        <Segmented
          value={status}
          onChange={setStatus}
          options={[
            { value: "TODAS" as const, label: "Todas", count: contar("TODAS") },
            { value: "PENDENTE" as const, label: "Pendentes", count: contar("PENDENTE") },
            { value: "PAGO" as const, label: "Pagos", count: contar("PAGO") },
            { value: "EXPIRADO" as const, label: "Expirados", count: contar("EXPIRADO") },
            { value: "CANCELADO" as const, label: "Cancelados", count: contar("CANCELADO") },
          ]}
        />
        <SearchInput
          className="max-w-xs"
          placeholder="Código, descrição ou devedor"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <DataTable
        dados={filtradas}
        colunas={colunas}
        chave={(c) => c.id}
        storageKey="links-cobranca"
        aoClicarLinha={setDetalhe}
        exportarNome="links-cobranca"
        porPagina={20}
        vazio={{ icon: <Receipt size={22} />, titulo: "Nenhuma cobrança neste filtro" }}
      />

      {detalhe && (
        <Drawer
          aberto
          onClose={() => setDetalhe(null)}
          titulo={detalhe.codigo}
          subtitulo={<StatusPill meta={COBRANCA_STATUS[detalhe.status]} />}
          largura={520}
          rodape={
            detalhe.status === "PENDENTE" ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    atualizarCobranca(detalhe.id, { status: "CANCELADO" });
                    notificar({ titulo: "Cobrança cancelada", descricao: detalhe.codigo, tone: "warn" });
                    setDetalhe(null);
                  }}
                >
                  <XCircle size={14} /> Cancelar
                </Button>
                <Button size="sm" onClick={() => marcarPaga(detalhe)}>
                  <Check size={14} weight="bold" /> Confirmar pagamento
                </Button>
              </>
            ) : undefined
          }
        >
          <div className="flex flex-col items-center">
            <QrCodePix payload={detalhe.copiaECola} tamanho={192} />
            <p className="tnum font-display mt-4 text-[22px] font-semibold text-fg">
              {money(detalhe.valor)}
            </p>
            <p className="mt-1 text-center text-[13px] text-fg-muted">{detalhe.descricao}</p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3.5">
            <Campo rotulo="Criada em" valor={date(detalhe.criadaEm, "datetime")} />
            <Campo rotulo="Expira em" valor={date(detalhe.expiraEm, "datetime")} />
            <Campo
              rotulo="Pago em"
              valor={detalhe.pagoEm ? date(detalhe.pagoEm, "datetime") : "—"}
            />
            <Campo
              rotulo="Devedor"
              valor={
                detalhe.devedorId
                  ? (devedorPorId.get(detalhe.devedorId)?.nome ?? "—")
                  : "Cobrança avulsa"
              }
            />
          </div>

          <div className="mt-5 rounded-lg border border-line bg-surface-2/60 p-3">
            <div className="mb-1.5 flex items-center justify-between">
              <p className="text-[11px] font-semibold tracking-wide text-fg-subtle uppercase">
                Copia e cola
              </p>
              <button
                onClick={() => void copiar(detalhe.copiaECola)}
                className="inline-flex items-center gap-1.5 text-[12px] font-medium text-accent hover:underline"
              >
                {copiado ? <Check size={12} weight="bold" /> : <Copy size={12} />}
                {copiado ? "Copiado" : "Copiar"}
              </button>
            </div>
            <p className="max-h-20 overflow-y-auto font-mono text-[10.5px] leading-relaxed break-all text-fg-muted">
              {detalhe.copiaECola}
            </p>
          </div>
        </Drawer>
      )}
    </>
  );
}

function Campo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium tracking-wide text-fg-subtle uppercase">{rotulo}</p>
      <p className="tnum mt-0.5 truncate text-[13px] text-fg">{valor}</p>
    </div>
  );
}
