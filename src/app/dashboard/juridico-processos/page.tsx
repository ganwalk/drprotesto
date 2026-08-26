"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Gavel,
  Paperclip,
  Plus,
  Scales,
} from "@phosphor-icons/react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Divider,
  KpiCard,
  PageHeader,
  Segmented,
} from "@/components/ui/primitives";
import { StatusPill } from "@/components/ui/status-pill";
import { Drawer, Modal } from "@/components/ui/overlay";
import { DataTable, type Coluna } from "@/components/ui/data-table";
import { Field, SearchInput, Select } from "@/components/ui/form";
import { BarraFiltros, CampoFiltro } from "@/components/dashboard/filtros";
import { Carregando } from "@/components/ui/loading";
import { useApp } from "@/store/app-store";
import { useEscopo, useIndices } from "@/store/selectors";
import { PRIORIDADE_STATUS, PROCESSO_STATUS } from "@/lib/status";
import { date, maskCNJ, maskDoc, money, num } from "@/lib/format";
import {
  PROCESSO_FLOW,
  type Prioridade,
  type Processo,
  type ProcessoStatus,
} from "@/lib/domain";
import { cn } from "@/lib/cn";

function Conteudo() {
  const params = useSearchParams();
  const { db, moverProcesso, notificar } = useApp();
  const processos = useEscopo(db.processos);
  const { devedorPorId, advogadoPorId, empresaPorId } = useIndices();

  const [visao, setVisao] = useState<"lista" | "fases">("lista");
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState<ProcessoStatus | "">("");
  const [prioridade, setPrioridade] = useState<Prioridade | "">("");
  const [advogadoId, setAdvogadoId] = useState("");
  const [detalhe, setDetalhe] = useState<Processo | null>(() => {
    const id = params.get("processo");
    return id ? (db.processos.find((p) => p.id === id) ?? null) : null;
  });
  const [novoAberto, setNovoAberto] = useState(false);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const digitos = termo.replace(/\D/g, "");
    return processos.filter((p) => {
      if (status && p.status !== status) return false;
      if (prioridade && p.prioridade !== prioridade) return false;
      if (advogadoId && p.advogadoId !== advogadoId) return false;
      if (!termo) return true;
      const devedor = devedorPorId.get(p.devedorId);
      return (
        (digitos.length > 3 && p.numeroCNJ.includes(digitos)) ||
        devedor?.nome.toLowerCase().includes(termo) ||
        p.comarca.toLowerCase().includes(termo)
      );
    });
  }, [processos, busca, status, prioridade, advogadoId, devedorPorId]);

  const ativos =
    (busca ? 1 : 0) + (status ? 1 : 0) + (prioridade ? 1 : 0) + (advogadoId ? 1 : 0);

  const valorCausa = filtrados.reduce((s, p) => s + p.valorCausa, 0);
  const custas = filtrados.reduce((s, p) => s + p.custas, 0);
  const emAndamento = filtrados.filter(
    (p) => !["ARQUIVADO", "ACORDO_FIRMADO"].includes(p.status),
  );
  const urgentes = filtrados.filter((p) => p.prioridade === "URGENTE");

  const colunas: Coluna<Processo>[] = [
    {
      id: "cnj",
      cabecalho: "Processo",
      largura: "220px",
      ordenavel: true,
      valor: (p) => p.numeroCNJ,
      celula: (p) => (
        <div>
          <p className="tnum font-medium text-fg">{maskCNJ(p.numeroCNJ)}</p>
          <p className="text-[11.5px] text-fg-muted">{p.vara}</p>
        </div>
      ),
    },
    {
      id: "devedor",
      cabecalho: "Parte contrária",
      largura: "240px",
      valor: (p) => devedorPorId.get(p.devedorId)?.nome ?? "",
      celula: (p) => (
        <div className="flex items-center gap-2.5">
          <Avatar nome={devedorPorId.get(p.devedorId)?.nome ?? "?"} size={28} />
          <span className="truncate font-medium text-fg">
            {devedorPorId.get(p.devedorId)?.nome ?? "—"}
          </span>
        </div>
      ),
    },
    {
      id: "empresa",
      cabecalho: "Credor",
      opcional: true,
      valor: (p) => empresaPorId.get(p.empresaId)?.nomeFantasia ?? "",
      celula: (p) => (
        <span className="text-fg-muted">{empresaPorId.get(p.empresaId)?.nomeFantasia}</span>
      ),
    },
    {
      id: "comarca",
      cabecalho: "Comarca",
      opcional: true,
      valor: (p) => p.comarca,
      celula: (p) => <span className="truncate text-fg-muted">{p.comarca}</span>,
    },
    {
      id: "advogado",
      cabecalho: "Advogado",
      valor: (p) => advogadoPorId.get(p.advogadoId)?.nome ?? "",
      celula: (p) => {
        const adv = advogadoPorId.get(p.advogadoId);
        return (
          <div className="min-w-0">
            <p className="truncate text-fg">{adv?.nome ?? "—"}</p>
            <p className="tnum text-[11.5px] text-fg-muted">
              {adv ? `OAB ${adv.ufOab} ${adv.oab}` : "—"}
            </p>
          </div>
        );
      },
    },
    {
      id: "valor",
      cabecalho: "Valor da causa",
      alinhamento: "right",
      ordenavel: true,
      valor: (p) => p.valorCausa,
      celula: (p) => <span className="tnum font-semibold text-fg">{money(p.valorCausa)}</span>,
    },
    {
      id: "custas",
      cabecalho: "Custas",
      alinhamento: "right",
      opcional: true,
      ordenavel: true,
      valor: (p) => p.custas,
      celula: (p) => <span className="tnum text-fg-muted">{money(p.custas)}</span>,
    },
    {
      id: "prioridade",
      cabecalho: "Prioridade",
      ordenavel: true,
      valor: (p) => p.prioridade,
      celula: (p) => <StatusPill meta={PRIORIDADE_STATUS[p.prioridade]} />,
    },
    {
      id: "status",
      cabecalho: "Fase",
      ordenavel: true,
      valor: (p) => PROCESSO_STATUS[p.status].label,
      celula: (p) => <StatusPill meta={PROCESSO_STATUS[p.status]} />,
    },
    {
      id: "anexos",
      cabecalho: "Anexos",
      alinhamento: "right",
      opcional: true,
      valor: (p) => p.anexos.length,
      celula: (p) => (
        <span className="tnum inline-flex items-center gap-1 text-fg-muted">
          <Paperclip size={12} /> {p.anexos.length}
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        breadcrumb="Jurídico"
        titulo="Gestão de processos"
        descricao="Acompanhamento das ações judiciais de cobrança, da distribuição ao arquivamento."
        acoes={
          <Button onClick={() => setNovoAberto(true)}>
            <Plus size={15} weight="bold" /> Novo processo
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Processos"
          valor={num(filtrados.length)}
          sub={`${num(emAndamento.length)} em andamento`}
          icon={<Gavel size={17} weight="duotone" />}
        />
        <KpiCard label="Valor de causa" valor={money(valorCausa)} tone="accent" />
        <KpiCard
          label="Custas provisionadas"
          valor={money(custas)}
          sub="guias e emolumentos"
          tone="warn"
        />
        <KpiCard
          label="Urgentes"
          valor={num(urgentes.length)}
          sub="exigem ação imediata"
          tone="danger"
        />
      </div>

      <div className="mt-4 mb-4">
        <Segmented
          value={visao}
          onChange={setVisao}
          options={[
            { value: "lista", label: "Lista" },
            { value: "fases", label: "Por fase processual" },
          ]}
        />
      </div>

      <BarraFiltros
        ativos={ativos}
        aoLimpar={() => {
          setBusca("");
          setStatus("");
          setPrioridade("");
          setAdvogadoId("");
        }}
      >
        <CampoFiltro label="CNJ, parte ou comarca" className="lg:col-span-2">
          <SearchInput
            placeholder="Buscar…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </CampoFiltro>
        <CampoFiltro label="Fase">
          <Select value={status} onChange={(e) => setStatus(e.target.value as ProcessoStatus)}>
            <option value="">Todas</option>
            {PROCESSO_FLOW.map((s) => (
              <option key={s} value={s}>
                {PROCESSO_STATUS[s].label}
              </option>
            ))}
          </Select>
        </CampoFiltro>
        <CampoFiltro label="Prioridade">
          <Select
            value={prioridade}
            onChange={(e) => setPrioridade(e.target.value as Prioridade)}
          >
            <option value="">Todas</option>
            {(Object.keys(PRIORIDADE_STATUS) as Prioridade[]).map((p) => (
              <option key={p} value={p}>
                {PRIORIDADE_STATUS[p].label}
              </option>
            ))}
          </Select>
        </CampoFiltro>
        <CampoFiltro label="Advogado">
          <Select value={advogadoId} onChange={(e) => setAdvogadoId(e.target.value)}>
            <option value="">Todos</option>
            {db.advogados.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nome}
              </option>
            ))}
          </Select>
        </CampoFiltro>
      </BarraFiltros>

      {visao === "lista" ? (
        <DataTable
          dados={filtrados}
          colunas={colunas}
          chave={(p) => p.id}
          storageKey="processos"
          aoClicarLinha={setDetalhe}
          exportarNome="processos"
          vazio={{ icon: <Gavel size={22} />, titulo: "Nenhum processo encontrado" }}
        />
      ) : (
        <div className="overflow-x-auto pb-3">
          <div className="flex min-w-max gap-3">
            {PROCESSO_FLOW.map((fase) => {
              const itens = filtrados.filter((p) => p.status === fase);
              return (
                <div
                  key={fase}
                  className="flex w-[264px] shrink-0 flex-col rounded-xl border border-line bg-surface-2/40"
                >
                  <div className="border-b border-line px-3.5 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <StatusPill meta={PROCESSO_STATUS[fase]} />
                      <span className="tnum text-[12.5px] font-semibold text-fg">
                        {itens.length}
                      </span>
                    </div>
                    <p className="tnum mt-2 text-[12px] text-fg-muted">
                      {money(itens.reduce((s, p) => s + p.valorCausa, 0))}
                    </p>
                  </div>
                  <div className="flex-1 space-y-2 p-2.5">
                    {itens.slice(0, 10).map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setDetalhe(p)}
                        className="w-full rounded-lg border border-line bg-surface p-3 text-left transition-colors hover:border-line-strong"
                      >
                        <p className="tnum text-[11px] text-fg-subtle">{maskCNJ(p.numeroCNJ)}</p>
                        <p className="mt-1 line-clamp-2 text-[12.5px] leading-snug font-medium text-fg">
                          {devedorPorId.get(p.devedorId)?.nome ?? "—"}
                        </p>
                        <p className="tnum mt-2 text-[13px] font-semibold text-fg">
                          {money(p.valorCausa)}
                        </p>
                        <div className="mt-2">
                          <StatusPill meta={PRIORIDADE_STATUS[p.prioridade]} dot={false} />
                        </div>
                      </button>
                    ))}
                    {itens.length === 0 && (
                      <p className="py-8 text-center text-[12px] text-fg-subtle">
                        Nenhum processo
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {detalhe && (
        <ProcessoDrawer
          processo={detalhe}
          onClose={() => setDetalhe(null)}
          onAvancar={(status) => {
            moverProcesso(detalhe.id, status);
            notificar({
              titulo: "Fase atualizada",
              descricao: `${maskCNJ(detalhe.numeroCNJ)} → ${PROCESSO_STATUS[status].label}`,
              tone: "ok",
            });
            setDetalhe(null);
          }}
        />
      )}

      <NovoProcessoModal aberto={novoAberto} onClose={() => setNovoAberto(false)} />
    </>
  );
}

function ProcessoDrawer({
  processo,
  onClose,
  onAvancar,
}: {
  processo: Processo;
  onClose: () => void;
  onAvancar: (status: ProcessoStatus) => void;
}) {
  const { db } = useApp();
  const devedor = db.devedores.find((d) => d.id === processo.devedorId);
  const advogado = db.advogados.find((a) => a.id === processo.advogadoId);
  const empresa = db.empresas.find((e) => e.id === processo.empresaId);
  const titulos = db.titulos.filter((t) => processo.titulosIds.includes(t.id));
  const indiceAtual = PROCESSO_FLOW.indexOf(processo.status);
  const proxima = PROCESSO_FLOW[indiceAtual + 1];

  return (
    <Drawer
      aberto
      onClose={onClose}
      titulo={maskCNJ(processo.numeroCNJ)}
      subtitulo={
        <span className="flex flex-wrap items-center gap-2">
          <StatusPill meta={PROCESSO_STATUS[processo.status]} />
          <StatusPill meta={PRIORIDADE_STATUS[processo.prioridade]} dot={false} />
        </span>
      }
      largura={640}
      rodape={
        proxima ? (
          <Button size="sm" onClick={() => onAvancar(proxima)}>
            Avançar para {PROCESSO_STATUS[proxima].label}
            <ArrowRight size={14} weight="bold" />
          </Button>
        ) : (
          <Badge tone="neutral">Processo encerrado</Badge>
        )
      }
    >
      {/* Trilho de fases */}
      <div className="flex items-center gap-1">
        {PROCESSO_FLOW.map((fase, i) => (
          <div key={fase} className="flex flex-1 items-center gap-1">
            <span
              className={cn(
                "h-1.5 flex-1 rounded-full",
                i <= indiceAtual ? "bg-accent" : "bg-surface-3",
              )}
              title={PROCESSO_STATUS[fase].label}
            />
          </div>
        ))}
      </div>
      <p className="mt-2 text-[12px] text-fg-subtle">
        Fase {indiceAtual + 1} de {PROCESSO_FLOW.length}
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-accent bg-accent-soft p-3.5">
          <p className="text-[11px] font-medium tracking-wide text-accent uppercase">
            Valor da causa
          </p>
          <p className="tnum mt-1 text-[16px] font-semibold text-accent">
            {money(processo.valorCausa)}
          </p>
        </div>
        <div className="rounded-lg border border-line bg-surface-2/60 p-3.5">
          <p className="text-[11px] font-medium tracking-wide text-fg-subtle uppercase">
            Custas provisionadas
          </p>
          <p className="tnum mt-1 text-[16px] font-semibold text-fg">{money(processo.custas)}</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3.5">
        <Item rotulo="Parte contrária" valor={devedor?.nome ?? "—"} />
        <Item rotulo="Documento" valor={devedor ? maskDoc(devedor.documento) : "—"} />
        <Item rotulo="Credor" valor={empresa?.nomeFantasia ?? "—"} />
        <Item rotulo="Comarca" valor={processo.comarca} />
        <Item rotulo="Vara" valor={processo.vara} />
        <Item
          rotulo="Advogado"
          valor={advogado ? `${advogado.nome} — OAB ${advogado.ufOab} ${advogado.oab}` : "—"}
        />
        <Item rotulo="Criado em" valor={date(processo.criadoEm)} />
        <Item
          rotulo="Distribuído em"
          valor={processo.distribuidoEm ? date(processo.distribuidoEm) : "Não distribuído"}
        />
      </div>

      <Divider className="my-6" label={`Títulos executados (${titulos.length})`} />
      <div className="space-y-1.5">
        {titulos.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-3 rounded-lg border border-line px-3.5 py-2.5"
          >
            <span className="tnum flex-1 text-[13px] text-fg">Título {t.numero}</span>
            <span className="text-[12px] text-fg-muted">venc. {date(t.vencimento)}</span>
            <span className="tnum text-[13px] font-semibold text-fg">
              {money(t.valorAtualizado)}
            </span>
          </div>
        ))}
      </div>

      <Divider className="my-6" label={`Movimentações (${processo.movimentacoes.length})`} />
      <ol className="relative space-y-4 border-l border-line pl-5">
        {[...processo.movimentacoes].reverse().map((m) => (
          <li key={m.id} className="relative">
            <span className="absolute top-1 -left-[26px] size-2.5 rounded-full border-2 border-surface bg-accent" />
            <p className="text-[13px] font-medium text-fg">{m.titulo}</p>
            <p className="mt-0.5 text-[12.5px] leading-relaxed text-fg-muted">{m.descricao}</p>
            <p className="mt-1 text-[11.5px] text-fg-subtle">{date(m.data)}</p>
          </li>
        ))}
        {processo.movimentacoes.length === 0 && (
          <li className="text-[13px] text-fg-muted">Nenhuma movimentação registrada.</li>
        )}
      </ol>

      <Divider className="my-6" label={`Anexos (${processo.anexos.length})`} />
      <div className="space-y-1.5">
        {processo.anexos.map((a) => (
          <div
            key={a.id}
            className="flex items-center gap-3 rounded-lg border border-line px-3.5 py-2.5"
          >
            <Paperclip size={15} className="shrink-0 text-fg-subtle" />
            <span className="min-w-0 flex-1 truncate text-[13px] text-fg">{a.nome}</span>
            <span className="tnum text-[11.5px] text-fg-subtle">
              {(a.tamanhoKb / 1024).toFixed(1)} MB
            </span>
            <span className="text-[11.5px] text-fg-subtle">{date(a.enviadoEm)}</span>
          </div>
        ))}
        {processo.anexos.length === 0 && (
          <p className="text-[13px] text-fg-muted">Nenhum documento anexado.</p>
        )}
      </div>
    </Drawer>
  );
}

function Item({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium tracking-wide text-fg-subtle uppercase">{rotulo}</p>
      <p className="tnum mt-0.5 truncate text-[13px] text-fg" title={valor}>
        {valor}
      </p>
    </div>
  );
}

function NovoProcessoModal({ aberto, onClose }: { aberto: boolean; onClose: () => void }) {
  const { db, empresaAtivaId, salvarProcesso, notificar } = useApp();
  const [devedorId, setDevedorId] = useState("");
  const [cnj, setCnj] = useState("");
  const [comarca, setComarca] = useState("");
  const [vara, setVara] = useState("");
  const [advogadoId, setAdvogadoId] = useState(db.advogados[0]?.id ?? "");
  const [prioridade, setPrioridade] = useState<Prioridade>("MEDIA");
  const [erro, setErro] = useState<string | null>(null);

  const devedores = useMemo(() => {
    const escopo =
      empresaAtivaId === "TODAS"
        ? db.devedores
        : db.devedores.filter((d) => d.empresaId === empresaAtivaId);
    return escopo.filter((d) =>
      db.titulos.some((t) => t.devedorId === d.id && ["JURIDICO", "PROTESTADO"].includes(t.status)),
    );
  }, [db.devedores, db.titulos, empresaAtivaId]);

  const titulos = db.titulos.filter(
    (t) => t.devedorId === devedorId && ["JURIDICO", "PROTESTADO"].includes(t.status),
  );
  const valorCausa = titulos.reduce((s, t) => s + t.valorAtualizado, 0);

  const salvar = () => {
    if (!devedorId) return setErro("Selecione a parte contrária.");
    const digitos = cnj.replace(/\D/g, "");
    if (digitos && digitos.length !== 20)
      return setErro("O número CNJ deve ter 20 dígitos.");
    if (!comarca.trim()) return setErro("Informe a comarca.");

    salvarProcesso({
      empresaId: titulos[0]?.empresaId ?? db.empresas[0].id,
      devedorId,
      titulosIds: titulos.map((t) => t.id),
      numeroCNJ: digitos,
      comarca: comarca.trim(),
      vara: vara.trim(),
      advogadoId,
      prioridade,
      valorCausa,
      custas: Number((valorCausa * 0.01).toFixed(2)),
      status: "NOVO",
    });

    notificar({ titulo: "Processo criado", descricao: comarca, tone: "ok" });
    setDevedorId("");
    setCnj("");
    setComarca("");
    setVara("");
    setErro(null);
    onClose();
  };

  return (
    <Modal
      aberto={aberto}
      onClose={onClose}
      titulo="Novo processo judicial"
      descricao="Vincula os títulos protestados ou já no jurídico a uma ação de cobrança."
      largura="md"
      rodape={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button size="sm" onClick={salvar}>
            Criar processo
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Parte contrária" obrigatorio className="sm:col-span-2">
          <Select value={devedorId} onChange={(e) => setDevedorId(e.target.value)}>
            <option value="">Selecione…</option>
            {devedores.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nome} — {maskDoc(d.documento)}
              </option>
            ))}
          </Select>
        </Field>

        {devedorId && (
          <div className="rounded-lg border border-line bg-surface-2/60 p-4 sm:col-span-2">
            <p className="text-[12.5px] text-fg-muted">
              {titulos.length} título(s) elegíveis somando
            </p>
            <p className="tnum mt-1 text-[18px] font-semibold text-fg">{money(valorCausa)}</p>
          </div>
        )}

        <Field
          label="Número CNJ"
          hint="20 dígitos. Deixe em branco se ainda não distribuído."
          className="sm:col-span-2"
        >
          <input
            className="tnum h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-fg placeholder:text-fg-subtle focus:border-accent focus:outline-none"
            placeholder="0000000-00.0000.0.00.0000"
            value={cnj}
            onChange={(e) => setCnj(e.target.value)}
          />
        </Field>

        <Field label="Comarca" obrigatorio>
          <Select value={comarca} onChange={(e) => setComarca(e.target.value)}>
            <option value="">Selecione…</option>
            {[...new Set(db.processos.map((p) => p.comarca))].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Vara">
          <Select value={vara} onChange={(e) => setVara(e.target.value)}>
            <option value="">A distribuir</option>
            {[...new Set(db.processos.map((p) => p.vara))].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Advogado responsável">
          <Select value={advogadoId} onChange={(e) => setAdvogadoId(e.target.value)}>
            {db.advogados.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nome} — OAB {a.ufOab} {a.oab}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Prioridade">
          <Select
            value={prioridade}
            onChange={(e) => setPrioridade(e.target.value as Prioridade)}
          >
            {(Object.keys(PRIORIDADE_STATUS) as Prioridade[]).map((p) => (
              <option key={p} value={p}>
                {PRIORIDADE_STATUS[p].label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {erro && (
        <p className="mt-4 rounded-lg bg-danger-soft px-3 py-2.5 text-[13px] text-danger">{erro}</p>
      )}
    </Modal>
  );
}

export default function ProcessosPage() {
  return (
    <Suspense fallback={<Carregando />}>
      <Conteudo />
    </Suspense>
  );
}
