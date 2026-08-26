"use client";

import { useMemo, useState } from "react";
import { ChatCircleDots, Envelope, WarningCircle, CheckCircle } from "@phosphor-icons/react";
import { Badge, Card, CardHeader, KpiCard, PageHeader, Progress } from "@/components/ui/primitives";
import { DataTable, type Coluna } from "@/components/ui/data-table";
import { Input, SearchInput, Select } from "@/components/ui/form";
import { BarraFiltros, CampoFiltro } from "@/components/dashboard/filtros";
import { GraficoBarrasSimples } from "@/components/ui/charts";
import { useApp } from "@/store/app-store";
import { useAvisosResumo, useEscopo, useIndices } from "@/store/selectors";
import { AVISO_STATUS, CANAL_LABELS } from "@/lib/status";
import { date, num, pct } from "@/lib/format";
import { FASE_LABELS, FASES_REGUA, type Aviso, type AvisoStatus, type Canal, type FaseRegua } from "@/lib/domain";

export default function RelatorioAvisosPage() {
  const { db } = useApp();
  const avisos = useEscopo(db.avisos);
  const resumo = useAvisosResumo();
  const { devedorPorId, tituloPorId } = useIndices();

  const [busca, setBusca] = useState("");
  const [canal, setCanal] = useState<Canal | "">("");
  const [status, setStatus] = useState<AvisoStatus | "">("");
  const [fase, setFase] = useState<FaseRegua | "">("");
  const [de, setDe] = useState("");

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const dDe = de ? new Date(de).getTime() : null;
    return avisos.filter((a) => {
      if (canal && a.canal !== canal) return false;
      if (status && a.status !== status) return false;
      if (fase && a.fase !== fase) return false;
      if (dDe && new Date(a.enviadoEm).getTime() < dDe) return false;
      if (termo) {
        const devedor = devedorPorId.get(a.devedorId);
        const bate =
          devedor?.nome.toLowerCase().includes(termo) ||
          a.destino.toLowerCase().includes(termo) ||
          (a.erro ?? "").toLowerCase().includes(termo);
        if (!bate) return false;
      }
      return true;
    });
  }, [avisos, busca, canal, status, fase, de, devedorPorId]);

  const porFase = useMemo(
    () =>
      FASES_REGUA.map((f) => ({
        rotulo: FASE_LABELS[f].split(" ")[0],
        enviados: avisos.filter((a) => a.fase === f).length,
      })),
    [avisos],
  );

  const errosFrequentes = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const a of avisos) {
      if (a.status === "FALHA" && a.erro) {
        mapa.set(a.erro, (mapa.get(a.erro) ?? 0) + 1);
      }
    }
    return [...mapa.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [avisos]);

  const ativos =
    (busca ? 1 : 0) + (canal ? 1 : 0) + (status ? 1 : 0) + (fase ? 1 : 0) + (de ? 1 : 0);

  const colunas: Coluna<Aviso>[] = [
    {
      id: "data",
      cabecalho: "Enviado em",
      ordenavel: true,
      valor: (a) => new Date(a.enviadoEm).getTime(),
      celula: (a) => <span className="tnum text-fg-muted">{date(a.enviadoEm, "datetime")}</span>,
    },
    {
      id: "devedor",
      cabecalho: "Devedor",
      largura: "240px",
      valor: (a) => devedorPorId.get(a.devedorId)?.nome ?? "",
      celula: (a) => (
        <span className="truncate font-medium text-fg">
          {devedorPorId.get(a.devedorId)?.nome ?? "—"}
        </span>
      ),
    },
    {
      id: "titulo",
      cabecalho: "Título",
      opcional: true,
      valor: (a) => tituloPorId.get(a.tituloId)?.numero ?? "",
      celula: (a) => (
        <span className="tnum text-fg-muted">{tituloPorId.get(a.tituloId)?.numero ?? "—"}</span>
      ),
    },
    {
      id: "canal",
      cabecalho: "Canal",
      ordenavel: true,
      valor: (a) => a.canal,
      celula: (a) => (
        <span className="flex items-center gap-1.5 text-fg-muted">
          {a.canal === "EMAIL" ? <Envelope size={14} /> : <ChatCircleDots size={14} />}
          {CANAL_LABELS[a.canal]}
        </span>
      ),
    },
    {
      id: "destino",
      cabecalho: "Destino",
      valor: (a) => a.destino,
      celula: (a) => <span className="tnum truncate text-fg-muted">{a.destino}</span>,
    },
    {
      id: "fase",
      cabecalho: "Fase",
      valor: (a) => FASE_LABELS[a.fase],
      celula: (a) => <Badge tone="neutral">{FASE_LABELS[a.fase]}</Badge>,
    },
    {
      id: "origem",
      cabecalho: "Origem",
      opcional: true,
      valor: (a) => a.origem,
      celula: (a) => (
        <span className="text-fg-muted">{a.origem === "REGUA" ? "Régua" : "Manual"}</span>
      ),
    },
    {
      id: "status",
      cabecalho: "Status",
      ordenavel: true,
      valor: (a) => a.status,
      celula: (a) => (
        <Badge tone={AVISO_STATUS[a.status].tone} dot>
          {AVISO_STATUS[a.status].label}
        </Badge>
      ),
    },
    {
      id: "erro",
      cabecalho: "Motivo da falha",
      largura: "260px",
      valor: (a) => a.erro ?? "",
      celula: (a) =>
        a.erro ? (
          <span className="text-[12.5px] text-danger">{a.erro}</span>
        ) : (
          <span className="text-fg-subtle">—</span>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        breadcrumb="Credor · Relatórios"
        titulo="Relatório de avisos"
        descricao="Desempenho dos disparos automáticos e manuais por e-mail e WhatsApp, com o motivo de cada falha."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Disparos no período"
          valor={num(resumo.total)}
          sub={`${num(resumo.porCanal.EMAIL)} e-mails · ${num(resumo.porCanal.WHATSAPP)} WhatsApp`}
        />
        <KpiCard
          label="Taxa de entrega"
          valor={pct(resumo.taxaSucesso)}
          sub={`${num(resumo.entregues)} entregues`}
          tone="ok"
          icon={<CheckCircle size={17} weight="duotone" />}
        />
        <KpiCard
          label="Taxa de leitura"
          valor={pct(resumo.taxaLeitura)}
          sub={`${num(resumo.lidos)} lidos`}
          tone="accent"
        />
        <KpiCard
          label="Falhas"
          valor={num(resumo.falhas)}
          sub="verifique os contatos"
          tone="danger"
          icon={<WarningCircle size={17} weight="duotone" />}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader title="Disparos por fase da régua" />
          <div className="p-4">
            <GraficoBarrasSimples dados={porFase} chave="enviados" nome="Disparos" altura={240} />
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            title="Principais causas de falha"
            description="Ordenadas por frequência no período."
          />
          <div className="space-y-3 p-5">
            {errosFrequentes.map(([erro, qtd]) => (
              <div key={erro}>
                <div className="mb-1.5 flex items-start justify-between gap-3">
                  <span className="text-[12.5px] leading-snug text-fg">{erro}</span>
                  <span className="tnum shrink-0 text-[12.5px] font-semibold text-fg">{qtd}</span>
                </div>
                <Progress
                  value={qtd / Math.max(1, errosFrequentes[0][1])}
                  tone="danger"
                  height={4}
                />
              </div>
            ))}
            {errosFrequentes.length === 0 && (
              <p className="py-6 text-center text-[13px] text-fg-muted">
                Nenhuma falha registrada no período.
              </p>
            )}
          </div>
        </Card>
      </div>

      <div className="mt-4">
        <BarraFiltros
          ativos={ativos}
          aoLimpar={() => {
            setBusca("");
            setCanal("");
            setStatus("");
            setFase("");
            setDe("");
          }}
        >
          <CampoFiltro label="Devedor, destino ou erro" className="lg:col-span-2">
            <SearchInput
              placeholder="Buscar…"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </CampoFiltro>
          <CampoFiltro label="Canal">
            <Select value={canal} onChange={(e) => setCanal(e.target.value as Canal)}>
              <option value="">Todos</option>
              <option value="EMAIL">E-mail</option>
              <option value="WHATSAPP">WhatsApp</option>
            </Select>
          </CampoFiltro>
          <CampoFiltro label="Status">
            <Select value={status} onChange={(e) => setStatus(e.target.value as AvisoStatus)}>
              <option value="">Todos</option>
              {(Object.keys(AVISO_STATUS) as AvisoStatus[]).map((s) => (
                <option key={s} value={s}>
                  {AVISO_STATUS[s].label}
                </option>
              ))}
            </Select>
          </CampoFiltro>
          <CampoFiltro label="Fase">
            <Select value={fase} onChange={(e) => setFase(e.target.value as FaseRegua)}>
              <option value="">Todas</option>
              {FASES_REGUA.map((f) => (
                <option key={f} value={f}>
                  {FASE_LABELS[f]}
                </option>
              ))}
            </Select>
          </CampoFiltro>
          <CampoFiltro label="Enviado a partir de">
            <Input type="date" value={de} onChange={(e) => setDe(e.target.value)} />
          </CampoFiltro>
        </BarraFiltros>

        <DataTable
          dados={filtrados}
          colunas={colunas}
          chave={(a) => a.id}
          storageKey="relatorio-avisos"
          exportarNome="relatorio-avisos"
          porPagina={25}
          denso
          vazio={{ icon: <Envelope size={22} />, titulo: "Nenhum aviso no filtro atual" }}
        />
      </div>
    </>
  );
}
