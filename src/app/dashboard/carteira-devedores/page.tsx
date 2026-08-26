"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Buildings, Prohibit, WarningCircle } from "@phosphor-icons/react";
import { PageHeader, Badge, Avatar, KpiCard } from "@/components/ui/primitives";
import { StatusPill } from "@/components/ui/status-pill";
import { DataTable, type Coluna } from "@/components/ui/data-table";
import { Segmented } from "@/components/ui/primitives";
import { Input, SearchInput, Select, Checkbox } from "@/components/ui/form";
import { BarraFiltros, CampoFiltro } from "@/components/dashboard/filtros";
import { DevedorDrawer } from "@/components/dashboard/devedor-drawer";
import { Carregando } from "@/components/ui/loading";
import { useApp } from "@/store/app-store";
import { useCarteira, type LinhaCarteira } from "@/store/selectors";
import { TITULO_STATUS } from "@/lib/status";
import { maskDoc, money, num } from "@/lib/format";
import type { Devedor, TituloStatus } from "@/lib/domain";

type Fase = "TODAS" | "AMIGAVEL" | "CARTORIO" | "JURIDICO" | "RESOLVIDO";

const FASES: Record<Fase, TituloStatus[]> = {
  TODAS: [],
  AMIGAVEL: ["NO_PRAZO", "PRE_PROTESTO"],
  CARTORIO: ["AGUARDANDO_REMESSA", "EM_CARTORIO", "PROTESTADO", "DEVOLVIDO"],
  JURIDICO: ["JURIDICO"],
  RESOLVIDO: ["LIQUIDADO"],
};

function Conteudo() {
  const params = useSearchParams();
  const { db } = useApp();
  const carteira = useCarteira();

  const [fase, setFase] = useState<Fase>("TODAS");
  const [busca, setBusca] = useState("");
  const [semContato, setSemContato] = useState(false);
  const [bloqueados, setBloqueados] = useState(false);
  const [comAcordo, setComAcordo] = useState(false);
  const [valorMin, setValorMin] = useState("");
  const [atrasoMin, setAtrasoMin] = useState("");
  const [tipo, setTipo] = useState<"" | "PF" | "PJ">("");

  const [selecionado, setSelecionado] = useState<Devedor | null>(() => {
    const id = params.get("devedor");
    return id ? (db.devedores.find((d) => d.id === id) ?? null) : null;
  });

  const filtrada = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const digitos = termo.replace(/\D/g, "");
    const min = Number(valorMin) || 0;
    const atraso = Number(atrasoMin) || 0;
    const statusDaFase = FASES[fase];

    return carteira.filter((l) => {
      if (termo) {
        const bateNome = l.devedor.nome.toLowerCase().includes(termo);
        const bateDoc = digitos.length > 2 && l.devedor.documento.includes(digitos);
        if (!bateNome && !bateDoc) return false;
      }
      if (tipo && l.devedor.tipo !== tipo) return false;
      if (semContato && l.temContato) return false;
      if (bloqueados && !l.devedor.bloqueado) return false;
      if (comAcordo && !l.acordo) return false;
      if (min && l.valorAberto < min) return false;
      if (atraso && l.maiorAtraso < atraso) return false;
      if (statusDaFase.length && !l.titulos.some((t) => statusDaFase.includes(t.status)))
        return false;
      return true;
    });
  }, [carteira, busca, tipo, semContato, bloqueados, comAcordo, valorMin, atrasoMin, fase]);

  const ativos =
    (busca ? 1 : 0) +
    (tipo ? 1 : 0) +
    (semContato ? 1 : 0) +
    (bloqueados ? 1 : 0) +
    (comAcordo ? 1 : 0) +
    (valorMin ? 1 : 0) +
    (atrasoMin ? 1 : 0);

  const limpar = () => {
    setBusca("");
    setTipo("");
    setSemContato(false);
    setBloqueados(false);
    setComAcordo(false);
    setValorMin("");
    setAtrasoMin("");
  };

  const contarFase = (f: Fase) => {
    const statusDaFase = FASES[f];
    if (!statusDaFase.length) return carteira.length;
    return carteira.filter((l) => l.titulos.some((t) => statusDaFase.includes(t.status))).length;
  };

  const totalAberto = filtrada.reduce((s, l) => s + l.valorAberto, 0);
  const semContatoQtd = carteira.filter((l) => !l.temContato).length;
  const bloqueadosQtd = carteira.filter((l) => l.devedor.bloqueado).length;

  const colunas: Coluna<LinhaCarteira>[] = [
    {
      id: "devedor",
      cabecalho: "Devedor",
      largura: "320px",
      ordenavel: true,
      valor: (l) => l.devedor.nome,
      celula: (l) => (
        <div className="flex items-center gap-2.5">
          <Avatar nome={l.devedor.nome} size={30} />
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 truncate font-medium text-fg">
              {l.devedor.nome}
              {l.devedor.bloqueado && <Prohibit size={12} weight="bold" className="text-danger" />}
            </p>
            <p className="tnum text-[11.5px] text-fg-muted">
              {maskDoc(l.devedor.documento)} · {l.devedor.cidade}/{l.devedor.uf}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "empresa",
      cabecalho: "Empresa credora",
      opcional: true,
      valor: (l) => l.empresa.nomeFantasia,
      celula: (l) => <span className="text-fg-muted">{l.empresa.nomeFantasia}</span>,
    },
    {
      id: "tipo",
      cabecalho: "Tipo",
      opcional: true,
      valor: (l) => l.devedor.tipo,
      celula: (l) => (
        <Badge tone="neutral">{l.devedor.tipo === "PJ" ? "Jurídica" : "Física"}</Badge>
      ),
    },
    {
      id: "titulos",
      cabecalho: "Títulos",
      alinhamento: "right",
      ordenavel: true,
      valor: (l) => l.qtdTitulos,
      celula: (l) => <span className="tnum">{l.qtdTitulos}</span>,
    },
    {
      id: "valor",
      cabecalho: "Em aberto",
      alinhamento: "right",
      ordenavel: true,
      valor: (l) => l.valorAberto,
      celula: (l) => (
        <span className="tnum font-semibold text-fg">{money(l.valorAberto)}</span>
      ),
    },
    {
      id: "atraso",
      cabecalho: "Maior atraso",
      alinhamento: "right",
      ordenavel: true,
      valor: (l) => l.maiorAtraso,
      celula: (l) => (
        <span
          className={`tnum ${l.maiorAtraso > 90 ? "font-semibold text-danger" : "text-fg-muted"}`}
        >
          {l.maiorAtraso > 0 ? `${l.maiorAtraso} d` : "—"}
        </span>
      ),
    },
    {
      id: "status",
      cabecalho: "Situação",
      valor: (l) => TITULO_STATUS[l.statusPrincipal].label,
      celula: (l) => <StatusPill meta={TITULO_STATUS[l.statusPrincipal]} />,
    },
    {
      id: "contato",
      cabecalho: "Contato",
      celula: (l) =>
        l.temContato ? (
          <span className="text-[12px] text-fg-muted">
            {l.devedor.whatsapp ? "WhatsApp" : ""}
            {l.devedor.whatsapp && l.devedor.email ? " · " : ""}
            {l.devedor.email ? "E-mail" : ""}
          </span>
        ) : (
          <Badge tone="danger" dot>
            Sem contato
          </Badge>
        ),
      valor: (l) => (l.temContato ? "sim" : "não"),
    },
    {
      id: "acordo",
      cabecalho: "Acordo",
      opcional: true,
      valor: (l) => l.acordo?.codigo ?? "",
      celula: (l) =>
        l.acordo ? (
          <span className="tnum text-[12px] text-accent">{l.acordo.codigo}</span>
        ) : (
          <span className="text-fg-subtle">—</span>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        breadcrumb="Credor · Acompanhamento"
        titulo="Carteira de devedores"
        descricao="Visão consolidada por devedor, com a situação de cada um junto ao cartório e o total em aberto."
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Devedores na visão"
          valor={num(filtrada.length)}
          sub={`de ${num(carteira.length)} na carteira`}
          icon={<Buildings size={17} weight="duotone" />}
        />
        <KpiCard label="Valor em aberto" valor={money(totalAberto)} tone="warn" />
        <KpiCard
          label="Sem contato"
          valor={num(semContatoQtd)}
          sub="sem e-mail nem WhatsApp"
          tone="danger"
          icon={<WarningCircle size={17} weight="duotone" />}
        />
        <KpiCard
          label="Bloqueados na régua"
          valor={num(bloqueadosQtd)}
          sub="não recebem avisos"
          tone="neutral"
          icon={<Prohibit size={17} weight="duotone" />}
        />
      </div>

      <div className="mb-4">
        <Segmented
          value={fase}
          onChange={setFase}
          options={[
            { value: "TODAS", label: "Todas", count: contarFase("TODAS") },
            { value: "AMIGAVEL", label: "Cobrança amigável", count: contarFase("AMIGAVEL") },
            { value: "CARTORIO", label: "Cartório", count: contarFase("CARTORIO") },
            { value: "JURIDICO", label: "Jurídico", count: contarFase("JURIDICO") },
            { value: "RESOLVIDO", label: "Liquidados", count: contarFase("RESOLVIDO") },
          ]}
        />
      </div>

      <BarraFiltros ativos={ativos} aoLimpar={limpar}>
        <CampoFiltro label="Nome ou documento" className="lg:col-span-2">
          <SearchInput
            placeholder="Buscar devedor…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </CampoFiltro>
        <CampoFiltro label="Tipo de pessoa">
          <Select value={tipo} onChange={(e) => setTipo(e.target.value as "" | "PF" | "PJ")}>
            <option value="">Todos</option>
            <option value="PF">Pessoa física</option>
            <option value="PJ">Pessoa jurídica</option>
          </Select>
        </CampoFiltro>
        <CampoFiltro label="Valor mínimo em aberto">
          <Input
            type="number"
            inputMode="numeric"
            placeholder="0"
            className="tnum"
            value={valorMin}
            onChange={(e) => setValorMin(e.target.value)}
          />
        </CampoFiltro>
        <CampoFiltro label="Dias em débito (mínimo)">
          <Input
            type="number"
            inputMode="numeric"
            placeholder="0"
            className="tnum"
            value={atrasoMin}
            onChange={(e) => setAtrasoMin(e.target.value)}
          />
        </CampoFiltro>
        <div className="flex flex-wrap items-end gap-4 sm:col-span-2 lg:col-span-4 xl:col-span-5">
          <Checkbox checked={semContato} onChange={setSemContato} label="Somente sem contato" />
          <Checkbox checked={bloqueados} onChange={setBloqueados} label="Somente bloqueados" />
          <Checkbox checked={comAcordo} onChange={setComAcordo} label="Com acordo ativo" />
        </div>
      </BarraFiltros>

      <DataTable
        dados={filtrada}
        colunas={colunas}
        chave={(l) => l.devedor.id}
        storageKey="carteira-devedores"
        aoClicarLinha={(l) => setSelecionado(l.devedor)}
        exportarNome="carteira-devedores"
        porPagina={20}
        vazio={{
          icon: <Buildings size={22} />,
          titulo: "Nenhum devedor nesta visão",
          descricao: "Ajuste os filtros ou troque a fase selecionada.",
        }}
      />

      <DevedorDrawer devedor={selecionado} onClose={() => setSelecionado(null)} />
    </>
  );
}

export default function CarteiraDevedoresPage() {
  return (
    <Suspense fallback={<Carregando />}>
      <Conteudo />
    </Suspense>
  );
}
