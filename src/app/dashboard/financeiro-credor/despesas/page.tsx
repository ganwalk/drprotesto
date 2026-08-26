"use client";

import { useMemo, useState } from "react";
import { Plus, Receipt, WarningCircle } from "@phosphor-icons/react";
import { Badge, Button, Card, CardHeader, KpiCard, PageHeader } from "@/components/ui/primitives";
import { StatusPill } from "@/components/ui/status-pill";
import { DataTable, type Coluna } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/overlay";
import { Field, Input, MoneyInput, SearchInput, Select } from "@/components/ui/form";
import { GraficoDistribuicao } from "@/components/ui/charts";
import { useApp } from "@/store/app-store";
import { useEmpresaAtiva, useEscopo, useIndices } from "@/store/selectors";
import { DESPESA_STATUS } from "@/lib/status";
import { date, money, num } from "@/lib/format";
import { hoje, iso, type Despesa, type DespesaStatus } from "@/lib/domain";

const CATEGORIAS = [
  "Custas processuais",
  "Emolumentos de cartório",
  "Honorários advocatícios",
  "Diligência de oficial",
  "Certidões e taxas",
  "Correios e postagem",
  "Software e integrações",
  "Consultas cadastrais",
];

const CORES_CATEGORIA = [
  "#2e6285", "#5f9cc2", "#8fbcd8", "#d7a13a",
  "#c4703a", "#b3402f", "#14724f", "#8d5fa8",
];

export default function DespesasPage() {
  const { db, salvarDespesa, notificar } = useApp();
  const despesas = useEscopo(db.despesas);
  const empresa = useEmpresaAtiva();
  const { empresaPorId } = useIndices();

  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState<DespesaStatus | "">("");
  const [categoria, setCategoria] = useState("");
  const [novaAberta, setNovaAberta] = useState(false);

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return despesas.filter((d) => {
      if (status && d.status !== status) return false;
      if (categoria && d.categoria !== categoria) return false;
      if (!termo) return true;
      return (
        d.descricao.toLowerCase().includes(termo) ||
        d.fornecedor.toLowerCase().includes(termo)
      );
    });
  }, [despesas, busca, status, categoria]);

  const total = filtradas.reduce((s, d) => s + d.valor, 0);
  const vencidas = filtradas.filter((d) => d.status === "VENCIDA");
  const pendentes = filtradas.filter((d) => d.status === "PENDENTE");

  const porCategoria = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const d of filtradas) mapa.set(d.categoria, (mapa.get(d.categoria) ?? 0) + d.valor);
    return [...mapa.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([nome, valor], i) => ({
        nome,
        valor: Math.round(valor),
        cor: CORES_CATEGORIA[i % CORES_CATEGORIA.length],
      }));
  }, [filtradas]);

  const colunas: Coluna<Despesa>[] = [
    {
      id: "descricao",
      cabecalho: "Descrição",
      largura: "300px",
      ordenavel: true,
      valor: (d) => d.descricao,
      celula: (d) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-fg">{d.descricao}</p>
          <p className="truncate text-[11.5px] text-fg-muted">{d.fornecedor}</p>
        </div>
      ),
    },
    {
      id: "categoria",
      cabecalho: "Categoria",
      ordenavel: true,
      valor: (d) => d.categoria,
      celula: (d) => <Badge tone="neutral">{d.categoria}</Badge>,
    },
    {
      id: "empresa",
      cabecalho: "Empresa",
      opcional: true,
      valor: (d) => empresaPorId.get(d.empresaId)?.nomeFantasia ?? "",
      celula: (d) => (
        <span className="text-fg-muted">{empresaPorId.get(d.empresaId)?.nomeFantasia}</span>
      ),
    },
    {
      id: "vencimento",
      cabecalho: "Vencimento",
      ordenavel: true,
      valor: (d) => new Date(d.vencimento).getTime(),
      celula: (d) => <span className="tnum text-fg-muted">{date(d.vencimento)}</span>,
    },
    {
      id: "valor",
      cabecalho: "Valor",
      alinhamento: "right",
      ordenavel: true,
      valor: (d) => d.valor,
      celula: (d) => <span className="tnum font-semibold text-fg">{money(d.valor)}</span>,
    },
    {
      id: "status",
      cabecalho: "Situação",
      ordenavel: true,
      valor: (d) => DESPESA_STATUS[d.status].label,
      celula: (d) => <StatusPill meta={DESPESA_STATUS[d.status]} />,
    },
    {
      id: "comprovante",
      cabecalho: "Comprovante",
      opcional: true,
      valor: (d) => d.comprovante ?? "",
      celula: (d) =>
        d.comprovante ? (
          <span className="text-[12px] text-accent">{d.comprovante}</span>
        ) : (
          <span className="text-fg-subtle">—</span>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        breadcrumb="Financeiro"
        titulo="Despesas"
        descricao={
          empresa
            ? `Custas, emolumentos e honorários de ${empresa.nomeFantasia}.`
            : "Custas, emolumentos e honorários consolidados de todas as empresas."
        }
        acoes={
          <Button onClick={() => setNovaAberta(true)}>
            <Plus size={15} weight="bold" /> Nova despesa
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total no filtro"
          valor={money(total)}
          sub={`${num(filtradas.length)} lançamentos`}
          icon={<Receipt size={17} weight="duotone" />}
        />
        <KpiCard
          label="A pagar"
          valor={money(pendentes.reduce((s, d) => s + d.valor, 0))}
          sub={`${num(pendentes.length)} pendentes`}
          tone="warn"
        />
        <KpiCard
          label="Vencidas"
          valor={money(vencidas.reduce((s, d) => s + d.valor, 0))}
          sub={`${num(vencidas.length)} em atraso`}
          tone="danger"
          icon={<WarningCircle size={17} weight="duotone" />}
        />
        <KpiCard
          label="Pagas"
          valor={money(
            filtradas.filter((d) => d.status === "PAGA").reduce((s, d) => s + d.valor, 0),
          )}
          tone="ok"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader title="Composição por categoria" />
          <div className="p-4">
            <GraficoDistribuicao dados={porCategoria} altura={190} />
            <div className="mt-3 space-y-1.5">
              {porCategoria.slice(0, 6).map((c) => (
                <div key={c.nome} className="flex items-center gap-2 text-[12px]">
                  <span className="size-2 shrink-0 rounded-full" style={{ background: c.cor }} />
                  <span className="min-w-0 flex-1 truncate text-fg-muted">{c.nome}</span>
                  <span className="tnum font-semibold text-fg">{money(c.valor)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <div className="lg:col-span-2">
          <div className="mb-4 flex flex-wrap gap-3">
            <SearchInput
              className="max-w-xs"
              placeholder="Descrição ou fornecedor"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
            <Select
              className="max-w-[180px]"
              value={status}
              onChange={(e) => setStatus(e.target.value as DespesaStatus)}
            >
              <option value="">Todas as situações</option>
              {(Object.keys(DESPESA_STATUS) as DespesaStatus[]).map((s) => (
                <option key={s} value={s}>
                  {DESPESA_STATUS[s].label}
                </option>
              ))}
            </Select>
            <Select
              className="max-w-[220px]"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              <option value="">Todas as categorias</option>
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>

          <DataTable
            dados={filtradas}
            colunas={colunas}
            chave={(d) => d.id}
            storageKey="despesas"
            exportarNome="despesas"
            porPagina={12}
            denso
            vazio={{ icon: <Receipt size={22} />, titulo: "Nenhuma despesa neste filtro" }}
          />
        </div>
      </div>

      <NovaDespesaModal
        aberta={novaAberta}
        onClose={() => setNovaAberta(false)}
        onSalvar={(d) => {
          salvarDespesa(d);
          notificar({ titulo: "Despesa registrada", descricao: d.descricao, tone: "ok" });
          setNovaAberta(false);
        }}
      />
    </>
  );
}

function NovaDespesaModal({
  aberta,
  onClose,
  onSalvar,
}: {
  aberta: boolean;
  onClose: () => void;
  onSalvar: (d: Partial<Despesa>) => void;
}) {
  const { db, empresaAtivaId } = useApp();
  const [empresaId, setEmpresaId] = useState(
    empresaAtivaId === "TODAS" ? db.empresas[0].id : empresaAtivaId,
  );
  const [descricao, setDescricao] = useState("");
  const [fornecedor, setFornecedor] = useState("");
  const [categoria, setCategoria] = useState(CATEGORIAS[0]);
  const [valor, setValor] = useState(0);
  const [vencimento, setVencimento] = useState(iso(hoje()).slice(0, 10));
  const [erro, setErro] = useState<string | null>(null);

  const salvar = () => {
    if (!descricao.trim()) return setErro("Informe a descrição.");
    if (valor <= 0) return setErro("Informe um valor maior que zero.");

    const venceu = new Date(vencimento) < hoje();
    onSalvar({
      empresaId,
      descricao: descricao.trim(),
      fornecedor: fornecedor.trim(),
      categoria,
      valor,
      vencimento: new Date(vencimento).toISOString(),
      status: venceu ? "VENCIDA" : "PENDENTE",
    });
    setDescricao("");
    setFornecedor("");
    setValor(0);
    setErro(null);
  };

  return (
    <Modal
      aberto={aberta}
      onClose={onClose}
      titulo="Nova despesa"
      descricao="Registre custas, emolumentos ou honorários vinculados a uma empresa."
      rodape={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button size="sm" onClick={salvar}>
            Registrar despesa
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Empresa" obrigatorio className="sm:col-span-2">
          <Select value={empresaId} onChange={(e) => setEmpresaId(e.target.value)}>
            {db.empresas.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nomeFantasia}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Descrição" obrigatorio className="sm:col-span-2">
          <Input value={descricao} onChange={(e) => setDescricao(e.target.value)} />
        </Field>
        <Field label="Fornecedor">
          <Input value={fornecedor} onChange={(e) => setFornecedor(e.target.value)} />
        </Field>
        <Field label="Categoria">
          <Select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Valor" obrigatorio>
          <MoneyInput value={valor} onChange={setValor} />
        </Field>
        <Field label="Vencimento" obrigatorio>
          <Input type="date" value={vencimento} onChange={(e) => setVencimento(e.target.value)} />
        </Field>
      </div>

      {erro && (
        <p className="mt-4 rounded-lg bg-danger-soft px-3 py-2.5 text-[13px] text-danger">{erro}</p>
      )}
    </Modal>
  );
}
