"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Stamp } from "@phosphor-icons/react";
import { Badge, Button, PageHeader } from "@/components/ui/primitives";
import { StatusPill } from "@/components/ui/status-pill";
import { DataTable, type Coluna } from "@/components/ui/data-table";
import { Input, SearchInput, Select } from "@/components/ui/form";
import { BarraFiltros, CampoFiltro } from "@/components/dashboard/filtros";
import { TituloDrawer } from "@/components/dashboard/titulo-drawer";
import { NovoTituloModal } from "@/components/dashboard/novo-titulo-modal";
import { Carregando } from "@/components/ui/loading";
import { useApp } from "@/store/app-store";
import { useEscopo, useIndices } from "@/store/selectors";
import { TITULO_STATUS } from "@/lib/status";
import { date, daysBetween, maskDoc, money, num } from "@/lib/format";
import { ESPECIES, hoje, type EspecieTitulo, type Titulo, type TituloStatus } from "@/lib/domain";

const TODOS_STATUS = Object.keys(TITULO_STATUS) as TituloStatus[];

function Conteudo() {
  const params = useSearchParams();
  const { db, enviarParaProtesto, mudarStatusTitulo, notificar } = useApp();
  const titulos = useEscopo(db.titulos);
  const { devedorPorId, empresaPorId } = useIndices();

  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState<TituloStatus | "">(
    (params.get("status") as TituloStatus) ?? "",
  );
  const [especie, setEspecie] = useState<EspecieTitulo | "">("");
  const [de, setDe] = useState("");
  const [ate, setAte] = useState("");
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [novoAberto, setNovoAberto] = useState(params.get("novo") === "1");
  const [detalhe, setDetalhe] = useState<Titulo | null>(() => {
    const id = params.get("titulo");
    return id ? (db.titulos.find((t) => t.id === id) ?? null) : null;
  });

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const digitos = termo.replace(/\D/g, "");
    const dDe = de ? new Date(de).getTime() : null;
    const dAte = ate ? new Date(ate).getTime() + 86_400_000 : null;

    return titulos.filter((t) => {
      if (status && t.status !== status) return false;
      if (especie && t.especie !== especie) return false;
      if (termo) {
        const devedor = devedorPorId.get(t.devedorId);
        const bate =
          t.numero.toLowerCase().includes(termo) ||
          devedor?.nome.toLowerCase().includes(termo) ||
          (digitos.length > 2 && devedor?.documento.includes(digitos)) ||
          t.protocoloCartorio?.includes(termo);
        if (!bate) return false;
      }
      const venc = new Date(t.vencimento).getTime();
      if (dDe && venc < dDe) return false;
      if (dAte && venc > dAte) return false;
      return true;
    });
  }, [titulos, busca, status, especie, de, ate, devedorPorId]);

  const ativos =
    (busca ? 1 : 0) + (status ? 1 : 0) + (especie ? 1 : 0) + (de ? 1 : 0) + (ate ? 1 : 0);

  const limpar = () => {
    setBusca("");
    setStatus("");
    setEspecie("");
    setDe("");
    setAte("");
  };

  const elegiveisProtesto = selecionados.filter((id) => {
    const t = db.titulos.find((x) => x.id === id);
    return t && ["PRE_PROTESTO", "DEVOLVIDO"].includes(t.status);
  });

  const colunas: Coluna<Titulo>[] = [
    {
      id: "numero",
      cabecalho: "Título",
      ordenavel: true,
      valor: (t) => t.numero,
      celula: (t) => (
        <div>
          <p className="tnum font-medium text-fg">{t.numero}</p>
          <p className="text-[11.5px] text-fg-muted">{t.especie}</p>
        </div>
      ),
    },
    {
      id: "devedor",
      cabecalho: "Devedor",
      largura: "260px",
      ordenavel: true,
      valor: (t) => devedorPorId.get(t.devedorId)?.nome ?? "",
      celula: (t) => {
        const d = devedorPorId.get(t.devedorId);
        return (
          <div className="min-w-0">
            <p className="truncate font-medium text-fg">{d?.nome ?? "—"}</p>
            <p className="tnum text-[11.5px] text-fg-muted">
              {d ? maskDoc(d.documento) : "—"}
            </p>
          </div>
        );
      },
    },
    {
      id: "empresa",
      cabecalho: "Credor",
      opcional: true,
      valor: (t) => empresaPorId.get(t.empresaId)?.nomeFantasia ?? "",
      celula: (t) => (
        <span className="text-fg-muted">{empresaPorId.get(t.empresaId)?.nomeFantasia}</span>
      ),
    },
    {
      id: "emissao",
      cabecalho: "Emissão",
      opcional: true,
      ordenavel: true,
      valor: (t) => new Date(t.emissao).getTime(),
      celula: (t) => <span className="tnum text-fg-muted">{date(t.emissao)}</span>,
    },
    {
      id: "vencimento",
      cabecalho: "Vencimento",
      ordenavel: true,
      valor: (t) => new Date(t.vencimento).getTime(),
      celula: (t) => {
        const atraso = daysBetween(t.vencimento, hoje());
        return (
          <div>
            <p className="tnum text-fg">{date(t.vencimento)}</p>
            {atraso > 0 && (
              <p className={`tnum text-[11.5px] ${atraso > 90 ? "text-danger" : "text-warn"}`}>
                {atraso} dias
              </p>
            )}
          </div>
        );
      },
    },
    {
      id: "valorOriginal",
      cabecalho: "Original",
      alinhamento: "right",
      opcional: true,
      ordenavel: true,
      valor: (t) => t.valorOriginal,
      celula: (t) => <span className="tnum text-fg-muted">{money(t.valorOriginal)}</span>,
    },
    {
      id: "valor",
      cabecalho: "Atualizado",
      alinhamento: "right",
      ordenavel: true,
      valor: (t) => t.valorAtualizado,
      celula: (t) => (
        <span className="tnum font-semibold text-fg">{money(t.valorAtualizado)}</span>
      ),
    },
    {
      id: "status",
      cabecalho: "Status",
      ordenavel: true,
      valor: (t) => TITULO_STATUS[t.status].label,
      celula: (t) => <StatusPill meta={TITULO_STATUS[t.status]} />,
    },
    {
      id: "protocolo",
      cabecalho: "Protocolo",
      opcional: true,
      valor: (t) => t.protocoloCartorio ?? "",
      celula: (t) =>
        t.protocoloCartorio ? (
          <span className="tnum text-[12px] text-fg-muted">{t.protocoloCartorio}</span>
        ) : (
          <span className="text-fg-subtle">—</span>
        ),
    },
    {
      id: "vinculos",
      cabecalho: "Vínculos",
      opcional: true,
      celula: (t) => (
        <div className="flex gap-1">
          {t.acordoId && <Badge tone="accent">Acordo</Badge>}
          {t.processoId && <Badge tone="warn">Processo</Badge>}
          {!t.acordoId && !t.processoId && <span className="text-fg-subtle">—</span>}
        </div>
      ),
      valor: (t) => `${t.acordoId ? "acordo " : ""}${t.processoId ? "processo" : ""}`,
    },
  ];

  const totalFiltrado = filtrados.reduce((s, t) => s + t.valorAtualizado, 0);

  return (
    <>
      <PageHeader
        breadcrumb="Credor · Acompanhamento"
        titulo="Controle de títulos"
        descricao={`${num(filtrados.length)} títulos na visão atual · ${money(totalFiltrado)} em valor atualizado.`}
        acoes={
          <Button onClick={() => setNovoAberto(true)}>
            <Plus size={15} weight="bold" /> Novo título
          </Button>
        }
      />

      <BarraFiltros ativos={ativos} aoLimpar={limpar}>
        <CampoFiltro label="Título, devedor ou protocolo" className="lg:col-span-2">
          <SearchInput
            placeholder="Buscar…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </CampoFiltro>
        <CampoFiltro label="Status">
          <Select value={status} onChange={(e) => setStatus(e.target.value as TituloStatus)}>
            <option value="">Todos os status</option>
            {TODOS_STATUS.map((s) => (
              <option key={s} value={s}>
                {TITULO_STATUS[s].label}
              </option>
            ))}
          </Select>
        </CampoFiltro>
        <CampoFiltro label="Espécie">
          <Select value={especie} onChange={(e) => setEspecie(e.target.value as EspecieTitulo)}>
            <option value="">Todas</option>
            {(Object.keys(ESPECIES) as EspecieTitulo[]).map((e) => (
              <option key={e} value={e}>
                {e} — {ESPECIES[e]}
              </option>
            ))}
          </Select>
        </CampoFiltro>
        <CampoFiltro label="Vencimento de">
          <Input type="date" value={de} onChange={(e) => setDe(e.target.value)} />
        </CampoFiltro>
        <CampoFiltro label="Vencimento até">
          <Input type="date" value={ate} onChange={(e) => setAte(e.target.value)} />
        </CampoFiltro>
      </BarraFiltros>

      <DataTable
        dados={filtrados}
        colunas={colunas}
        chave={(t) => t.id}
        storageKey="controle-titulo"
        aoClicarLinha={setDetalhe}
        exportarNome="titulos"
        selecao={{ selecionados, onChange: setSelecionados }}
        acoesBarra={
          selecionados.length > 0 && (
            <>
              <Button
                size="sm"
                disabled={elegiveisProtesto.length === 0}
                onClick={() => {
                  enviarParaProtesto(elegiveisProtesto);
                  setSelecionados([]);
                }}
              >
                <Stamp size={14} /> Enviar a protesto ({elegiveisProtesto.length})
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  mudarStatusTitulo(selecionados, "LIQUIDADO", "Baixa manual em lote.");
                  notificar({
                    titulo: `${selecionados.length} título(s) liquidado(s)`,
                    tone: "ok",
                  });
                  setSelecionados([]);
                }}
              >
                Dar baixa
              </Button>
            </>
          )
        }
        vazio={{
          icon: <Stamp size={22} />,
          titulo: "Nenhum título encontrado",
          descricao: "Ajuste os filtros ou cadastre um novo título.",
          acao: (
            <Button size="sm" onClick={() => setNovoAberto(true)}>
              <Plus size={14} weight="bold" /> Novo título
            </Button>
          ),
        }}
      />

      <TituloDrawer titulo={detalhe} onClose={() => setDetalhe(null)} />
      <NovoTituloModal aberto={novoAberto} onClose={() => setNovoAberto(false)} />
    </>
  );
}

export default function ControleTituloPage() {
  return (
    <Suspense fallback={<Carregando />}>
      <Conteudo />
    </Suspense>
  );
}
