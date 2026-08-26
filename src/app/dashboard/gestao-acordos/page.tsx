"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle,
  CurrencyCircleDollar,
  DotsSixVertical,
  FileText,
  Handshake,
  Plus,
  Signature,
} from "@phosphor-icons/react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Divider,
  KpiCard,
  PageHeader,
  Progress,
  Segmented,
} from "@/components/ui/primitives";
import { StatusPill } from "@/components/ui/status-pill";
import { Drawer, Modal } from "@/components/ui/overlay";
import { Field, MoneyInput, Select, SearchInput } from "@/components/ui/form";
import { DataTable, type Coluna } from "@/components/ui/data-table";
import { Carregando } from "@/components/ui/loading";
import { useApp } from "@/store/app-store";
import { useEscopo, useIndices } from "@/store/selectors";
import { ACORDO_STATUS } from "@/lib/status";
import { date, maskDoc, money, num, pct } from "@/lib/format";
import {
  ACORDO_DESVIOS,
  ACORDO_FUNIL,
  addDays,
  hoje,
  iso,
  type Acordo,
  type AcordoStatus,
} from "@/lib/domain";
import { cn } from "@/lib/cn";

function Conteudo() {
  const params = useSearchParams();
  const { db, moverAcordo, notificar } = useApp();
  const acordos = useEscopo(db.acordos);
  const { devedorPorId } = useIndices();

  const [visao, setVisao] = useState<"funil" | "lista">("funil");
  const [busca, setBusca] = useState("");
  const [detalhe, setDetalhe] = useState<Acordo | null>(() => {
    const id = params.get("acordo");
    return id ? (db.acordos.find((a) => a.id === id) ?? null) : null;
  });
  const [novoAberto, setNovoAberto] = useState(false);
  const [arrastando, setArrastando] = useState<string | null>(null);
  const [alvoColuna, setAlvoColuna] = useState<AcordoStatus | null>(null);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return acordos;
    return acordos.filter((a) => {
      const d = devedorPorId.get(a.devedorId);
      return (
        a.codigo.toLowerCase().includes(termo) ||
        d?.nome.toLowerCase().includes(termo) ||
        d?.documento.includes(termo.replace(/\D/g, ""))
      );
    });
  }, [acordos, busca, devedorPorId]);

  const porStatus = (status: AcordoStatus) => filtrados.filter((a) => a.status === status);

  const valorTotal = filtrados.reduce((s, a) => s + a.valorAcordo, 0);
  const emCumprimento = filtrados.filter((a) =>
    ["FIRMADO", "EM_CUMPRIMENTO"].includes(a.status),
  );
  const concluidos = filtrados.filter((a) =>
    ["CONCLUIDO", "PROTESTO_BAIXADO"].includes(a.status),
  );
  const descumpridos = filtrados.filter((a) =>
    ["DESCUMPRIDO", "ATRASADO"].includes(a.status),
  );
  const descontoMedio = filtrados.length
    ? filtrados.reduce((s, a) => s + a.descontoPercentual, 0) / filtrados.length
    : 0;

  const soltar = (status: AcordoStatus) => {
    if (!arrastando) return;
    const acordo = db.acordos.find((a) => a.id === arrastando);
    moverAcordo(arrastando, status);
    notificar({
      titulo: "Acordo movido",
      descricao: `${acordo?.codigo} → ${ACORDO_STATUS[status].label}`,
      tone: "ok",
    });
    setArrastando(null);
    setAlvoColuna(null);
  };

  const colunasLista: Coluna<Acordo>[] = [
    {
      id: "codigo",
      cabecalho: "Acordo",
      ordenavel: true,
      valor: (a) => a.codigo,
      celula: (a) => <span className="tnum font-medium text-fg">{a.codigo}</span>,
    },
    {
      id: "devedor",
      cabecalho: "Devedor",
      largura: "260px",
      valor: (a) => devedorPorId.get(a.devedorId)?.nome ?? "",
      celula: (a) => (
        <div className="flex items-center gap-2.5">
          <Avatar nome={devedorPorId.get(a.devedorId)?.nome ?? "?"} size={28} />
          <span className="truncate font-medium text-fg">
            {devedorPorId.get(a.devedorId)?.nome ?? "—"}
          </span>
        </div>
      ),
    },
    {
      id: "divida",
      cabecalho: "Dívida",
      alinhamento: "right",
      opcional: true,
      ordenavel: true,
      valor: (a) => a.valorDivida,
      celula: (a) => <span className="tnum text-fg-muted">{money(a.valorDivida)}</span>,
    },
    {
      id: "acordo",
      cabecalho: "Valor do acordo",
      alinhamento: "right",
      ordenavel: true,
      valor: (a) => a.valorAcordo,
      celula: (a) => <span className="tnum font-semibold text-fg">{money(a.valorAcordo)}</span>,
    },
    {
      id: "desconto",
      cabecalho: "Desconto",
      alinhamento: "right",
      ordenavel: true,
      valor: (a) => a.descontoPercentual,
      celula: (a) => <span className="tnum text-fg-muted">{a.descontoPercentual}%</span>,
    },
    {
      id: "parcelas",
      cabecalho: "Parcelas",
      valor: (a) => a.parcelas.length,
      celula: (a) => {
        const pagas = a.parcelas.filter((p) => p.pago).length;
        return (
          <div className="w-24">
            <p className="tnum text-[12px] text-fg-muted">
              {pagas}/{a.parcelas.length}
            </p>
            <Progress
              value={a.parcelas.length ? pagas / a.parcelas.length : 0}
              tone="ok"
              height={4}
              className="mt-1"
            />
          </div>
        );
      },
    },
    {
      id: "status",
      cabecalho: "Status",
      ordenavel: true,
      valor: (a) => ACORDO_STATUS[a.status].label,
      celula: (a) => <StatusPill meta={ACORDO_STATUS[a.status]} />,
    },
    {
      id: "criado",
      cabecalho: "Criado em",
      opcional: true,
      ordenavel: true,
      valor: (a) => new Date(a.criadoEm).getTime(),
      celula: (a) => <span className="tnum text-fg-muted">{date(a.criadoEm)}</span>,
    },
    {
      id: "responsavel",
      cabecalho: "Responsável",
      opcional: true,
      valor: (a) => a.responsavel,
      celula: (a) => <span className="text-fg-muted">{a.responsavel}</span>,
    },
  ];

  return (
    <>
      <PageHeader
        breadcrumb="Jurídico"
        titulo="Gestão de acordos"
        descricao="Funil de negociação da dívida — da proposta à baixa do protesto, com assinatura eletrônica."
        acoes={
          <Button onClick={() => setNovoAberto(true)}>
            <Plus size={15} weight="bold" /> Novo acordo
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Acordos no funil"
          valor={num(filtrados.length)}
          sub={`${money(valorTotal)} negociados`}
          icon={<Handshake size={17} weight="duotone" />}
        />
        <KpiCard
          label="Em cumprimento"
          valor={num(emCumprimento.length)}
          sub={money(emCumprimento.reduce((s, a) => s + a.valorAcordo, 0))}
          tone="ok"
          icon={<CheckCircle size={17} weight="duotone" />}
        />
        <KpiCard
          label="Em risco"
          valor={num(descumpridos.length)}
          sub="atrasados ou descumpridos"
          tone="danger"
        />
        <KpiCard
          label="Desconto médio"
          valor={`${descontoMedio.toFixed(1)}%`}
          sub={`${num(concluidos.length)} acordos concluídos`}
          tone="accent"
          icon={<CurrencyCircleDollar size={17} weight="duotone" />}
        />
      </div>

      <div className="mt-4 mb-4 flex flex-wrap items-center gap-3">
        <Segmented
          value={visao}
          onChange={setVisao}
          options={[
            { value: "funil", label: "Funil" },
            { value: "lista", label: "Lista" },
          ]}
        />
        <SearchInput
          className="max-w-xs"
          placeholder="Código, devedor ou documento"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {visao === "funil" ? (
        <>
          <div className="overflow-x-auto pb-3">
            <div className="flex min-w-max gap-3">
              {ACORDO_FUNIL.map((status) => {
                const itens = porStatus(status);
                const meta = ACORDO_STATUS[status];
                const proporcao = filtrados.length ? itens.length / filtrados.length : 0;
                return (
                  <div
                    key={status}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setAlvoColuna(status);
                    }}
                    onDragLeave={() => setAlvoColuna(null)}
                    onDrop={() => soltar(status)}
                    className={cn(
                      "flex w-[272px] shrink-0 flex-col rounded-xl border bg-surface-2/40 transition-colors",
                      alvoColuna === status
                        ? "border-accent bg-accent-soft/60"
                        : "border-line",
                    )}
                  >
                    <div className="border-b border-line px-3.5 py-3">
                      <div className="flex items-center justify-between gap-2">
                        <StatusPill meta={meta} />
                        <span className="tnum text-[12.5px] font-semibold text-fg">
                          {itens.length}
                        </span>
                      </div>
                      <p className="tnum mt-2 text-[12px] text-fg-muted">
                        {money(itens.reduce((s, a) => s + a.valorAcordo, 0))}
                      </p>
                      <Progress value={proporcao} tone={meta.tone} className="mt-2" height={3} />
                      <p className="mt-1.5 text-[11px] text-fg-subtle">
                        {pct(proporcao)} do funil
                      </p>
                    </div>

                    <div className="flex-1 space-y-2 p-2.5">
                      {itens.slice(0, 12).map((a) => (
                        <CartaoAcordo
                          key={a.id}
                          acordo={a}
                          nome={devedorPorId.get(a.devedorId)?.nome ?? "—"}
                          onClick={() => setDetalhe(a)}
                          onDragStart={() => setArrastando(a.id)}
                          onDragEnd={() => {
                            setArrastando(null);
                            setAlvoColuna(null);
                          }}
                        />
                      ))}
                      {itens.length === 0 && (
                        <p className="py-8 text-center text-[12px] text-fg-subtle">
                          Arraste um acordo para cá
                        </p>
                      )}
                      {itens.length > 12 && (
                        <p className="py-2 text-center text-[11.5px] text-fg-subtle">
                          +{itens.length - 12} nesta etapa
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4">
            <p className="mb-2.5 text-[11.5px] font-semibold tracking-wider text-fg-subtle uppercase">
              Desvios do funil
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {ACORDO_DESVIOS.map((status) => {
                const itens = porStatus(status);
                const meta = ACORDO_STATUS[status];
                return (
                  <Card
                    key={status}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setAlvoColuna(status);
                    }}
                    onDragLeave={() => setAlvoColuna(null)}
                    onDrop={() => soltar(status)}
                    className={cn(
                      "p-4 transition-colors",
                      alvoColuna === status && "border-accent bg-accent-soft/50",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <StatusPill meta={meta} />
                      <span className="tnum text-[15px] font-semibold text-fg">
                        {itens.length}
                      </span>
                    </div>
                    <p className="tnum mt-2 text-[12.5px] text-fg-muted">
                      {money(itens.reduce((s, a) => s + a.valorAcordo, 0))}
                    </p>
                    <p className="mt-1 text-[12px] leading-relaxed text-fg-subtle">{meta.hint}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <DataTable
          dados={filtrados}
          colunas={colunasLista}
          chave={(a) => a.id}
          storageKey="acordos"
          aoClicarLinha={setDetalhe}
          exportarNome="acordos"
          vazio={{ icon: <Handshake size={22} />, titulo: "Nenhum acordo encontrado" }}
        />
      )}

      <AcordoDrawer acordo={detalhe} onClose={() => setDetalhe(null)} />
      <NovoAcordoModal aberto={novoAberto} onClose={() => setNovoAberto(false)} />
    </>
  );
}

function CartaoAcordo({
  acordo,
  nome,
  onClick,
  onDragStart,
  onDragEnd,
}: {
  acordo: Acordo;
  nome: string;
  onClick: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const pagas = acordo.parcelas.filter((p) => p.pago).length;
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className="group cursor-pointer rounded-lg border border-line bg-surface p-3 transition-all hover:border-line-strong hover:shadow-[var(--shadow-card)] active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="tnum text-[11.5px] font-semibold text-accent">{acordo.codigo}</span>
        <DotsSixVertical
          size={13}
          className="text-fg-subtle opacity-0 transition-opacity group-hover:opacity-100"
        />
      </div>
      <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-snug font-medium text-fg">{nome}</p>
      <p className="tnum mt-2 text-[14px] font-semibold text-fg">{money(acordo.valorAcordo)}</p>
      <div className="mt-2 flex items-center gap-2">
        <Progress
          value={acordo.parcelas.length ? pagas / acordo.parcelas.length : 0}
          tone="ok"
          height={3}
          className="flex-1"
        />
        <span className="tnum shrink-0 text-[11px] text-fg-subtle">
          {pagas}/{acordo.parcelas.length}
        </span>
      </div>
      {acordo.descontoPercentual > 0 && (
        <Badge tone="accent" className="mt-2">
          −{acordo.descontoPercentual}%
        </Badge>
      )}
    </div>
  );
}

function AcordoDrawer({ acordo, onClose }: { acordo: Acordo | null; onClose: () => void }) {
  const { db, registrarPagamentoParcela, moverAcordo, notificar } = useApp();
  if (!acordo) return null;

  const devedor = db.devedores.find((d) => d.id === acordo.devedorId);
  const titulos = db.titulos.filter((t) => acordo.titulosIds.includes(t.id));
  const pagas = acordo.parcelas.filter((p) => p.pago);
  const pago = pagas.reduce((s, p) => s + p.valor, 0) + acordo.entrada;

  return (
    <Drawer
      aberto
      onClose={onClose}
      titulo={acordo.codigo}
      subtitulo={<StatusPill meta={ACORDO_STATUS[acordo.status]} />}
      largura={620}
      rodape={
        <>
          {acordo.status === "NEGOCIACAO" && (
            <Button
              size="sm"
              onClick={() => {
                moverAcordo(acordo.id, "AGUARDANDO_ASSINATURA");
                notificar({
                  titulo: "Enviado para assinatura",
                  descricao: `PDF transmitido ao assinador ${db.integracoes.assinatura.provedor}.`,
                  tone: "ok",
                });
                onClose();
              }}
            >
              <Signature size={14} /> Enviar para assinatura
            </Button>
          )}
          {acordo.status === "AGUARDANDO_ASSINATURA" && (
            <Button
              size="sm"
              onClick={() => {
                moverAcordo(acordo.id, "FIRMADO");
                notificar({
                  titulo: "Assinatura recebida",
                  descricao: "Webhook processado · evento RECEBIMENTO_ASSINATURA_DIGITAL.",
                  tone: "ok",
                });
                onClose();
              }}
            >
              <CheckCircle size={14} /> Registrar assinatura
            </Button>
          )}
          <Button variant="outline" size="sm">
            <FileText size={14} /> Gerar PDF do acordo
          </Button>
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <Bloco rotulo="Dívida original" valor={money(acordo.valorDivida)} />
        <Bloco rotulo={`Desconto ${acordo.descontoPercentual}%`} valor={money(acordo.valorDivida - acordo.valorAcordo)} tom="warn" />
        <Bloco rotulo="Valor do acordo" valor={money(acordo.valorAcordo)} destaque />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3.5">
        <Item rotulo="Devedor" valor={devedor?.nome ?? "—"} />
        <Item rotulo="Documento" valor={devedor ? maskDoc(devedor.documento) : "—"} />
        <Item rotulo="Entrada" valor={acordo.entrada ? money(acordo.entrada) : "Sem entrada"} />
        <Item rotulo="Parcelamento" valor={`${acordo.parcelas.length}x`} />
        <Item rotulo="Criado em" valor={date(acordo.criadoEm)} />
        <Item
          rotulo="Assinado em"
          valor={acordo.assinadoEm ? date(acordo.assinadoEm) : "Pendente"}
        />
        <Item rotulo="Responsável" valor={acordo.responsavel} />
        <Item rotulo="Assinador" valor={acordo.assinadorExterno ?? "—"} />
      </div>

      {acordo.observacao && (
        <p className="mt-4 rounded-lg bg-surface-2 px-3.5 py-3 text-[13px] leading-relaxed text-fg-muted">
          {acordo.observacao}
        </p>
      )}

      <Divider className="my-6" label={`Parcelas — ${money(pago)} recebido`} />

      <div className="space-y-1.5">
        {acordo.entrada > 0 && (
          <div className="flex items-center gap-3 rounded-lg border border-ok/30 bg-ok-soft px-3.5 py-2.5">
            <CheckCircle size={16} weight="fill" className="shrink-0 text-ok" />
            <span className="flex-1 text-[13px] font-medium text-fg">Entrada</span>
            <span className="tnum text-[13px] font-semibold text-fg">{money(acordo.entrada)}</span>
          </div>
        )}
        {acordo.parcelas.map((p) => {
          const vencida = !p.pago && new Date(p.vencimento) < hoje();
          return (
            <div
              key={p.id}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-3.5 py-2.5",
                p.pago
                  ? "border-ok/30 bg-ok-soft"
                  : vencida
                    ? "border-danger/30 bg-danger-soft"
                    : "border-line",
              )}
            >
              <span className="tnum w-8 shrink-0 text-[12.5px] text-fg-subtle">
                {String(p.numero).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <p className="tnum text-[13px] text-fg">{date(p.vencimento)}</p>
                {p.pago && p.pagoEm && (
                  <p className="text-[11.5px] text-ok">Pago em {date(p.pagoEm)}</p>
                )}
                {vencida && <p className="text-[11.5px] text-danger">Vencida</p>}
              </div>
              <span className="tnum text-[13px] font-semibold text-fg">{money(p.valor)}</span>
              {!p.pago && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    registrarPagamentoParcela(acordo.id, p.id);
                    notificar({
                      titulo: `Parcela ${p.numero} baixada`,
                      descricao: money(p.valor),
                      tone: "ok",
                    });
                  }}
                >
                  Dar baixa
                </Button>
              )}
            </div>
          );
        })}
      </div>

      <Divider className="my-6" label={`Títulos incluídos (${titulos.length})`} />
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
    </Drawer>
  );
}

function Bloco({
  rotulo,
  valor,
  destaque,
  tom,
}: {
  rotulo: string;
  valor: string;
  destaque?: boolean;
  tom?: "warn";
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-3.5",
        destaque ? "border-accent bg-accent-soft" : "border-line bg-surface-2/60",
      )}
    >
      <p
        className={cn(
          "text-[11px] font-medium tracking-wide uppercase",
          destaque ? "text-accent" : "text-fg-subtle",
        )}
      >
        {rotulo}
      </p>
      <p
        className={cn(
          "tnum mt-1 text-[15px] font-semibold",
          destaque ? "text-accent" : tom === "warn" ? "text-warn" : "text-fg",
        )}
      >
        {valor}
      </p>
    </div>
  );
}

function Item({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium tracking-wide text-fg-subtle uppercase">{rotulo}</p>
      <p className="tnum mt-0.5 text-[13px] text-fg">{valor}</p>
    </div>
  );
}

function NovoAcordoModal({ aberto, onClose }: { aberto: boolean; onClose: () => void }) {
  const { db, empresaAtivaId, salvarAcordo, notificar } = useApp();
  const [devedorId, setDevedorId] = useState("");
  const [desconto, setDesconto] = useState(10);
  const [parcelas, setParcelas] = useState(6);
  const [entrada, setEntrada] = useState(0);
  const [erro, setErro] = useState<string | null>(null);

  const devedores = useMemo(() => {
    const escopo =
      empresaAtivaId === "TODAS"
        ? db.devedores
        : db.devedores.filter((d) => d.empresaId === empresaAtivaId);
    // Só faz sentido negociar com quem tem título em aberto.
    return escopo.filter((d) =>
      db.titulos.some((t) => t.devedorId === d.id && t.status !== "LIQUIDADO"),
    );
  }, [db.devedores, db.titulos, empresaAtivaId]);

  const titulosDoDevedor = db.titulos.filter(
    (t) => t.devedorId === devedorId && t.status !== "LIQUIDADO",
  );
  const valorDivida = titulosDoDevedor.reduce((s, t) => s + t.valorAtualizado, 0);
  const valorAcordo = valorDivida * (1 - desconto / 100);
  const valorParcela = parcelas > 0 ? (valorAcordo - entrada) / parcelas : 0;

  const salvar = () => {
    if (!devedorId) return setErro("Selecione o devedor.");
    if (titulosDoDevedor.length === 0) return setErro("Este devedor não tem títulos em aberto.");
    if (entrada > valorAcordo) return setErro("A entrada não pode superar o valor do acordo.");

    const criado = salvarAcordo({
      empresaId: titulosDoDevedor[0].empresaId,
      devedorId,
      titulosIds: titulosDoDevedor.map((t) => t.id),
      valorDivida,
      valorAcordo: Number(valorAcordo.toFixed(2)),
      descontoPercentual: desconto,
      entrada,
      parcelas: Array.from({ length: parcelas }, (_, k) => ({
        id: `p${k + 1}_${Date.now()}`,
        numero: k + 1,
        vencimento: iso(addDays(hoje(), 30 * (k + 1))),
        valor: Number(valorParcela.toFixed(2)),
        pago: false,
        pagoEm: null,
      })),
      status: "NEGOCIACAO",
    });

    notificar({
      titulo: "Acordo criado",
      descricao: `${criado.codigo} · ${money(criado.valorAcordo)} em ${parcelas}x`,
      tone: "ok",
    });
    setDevedorId("");
    setEntrada(0);
    setErro(null);
    onClose();
  };

  return (
    <Modal
      aberto={aberto}
      onClose={onClose}
      titulo="Novo acordo"
      descricao="Consolida os títulos em aberto do devedor numa proposta de pagamento."
      largura="md"
      rodape={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button size="sm" onClick={salvar}>
            Criar proposta
          </Button>
        </>
      }
    >
      <Field label="Devedor" obrigatorio hint={`${devedores.length} devedores com títulos em aberto`}>
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
        <div className="mt-4 rounded-lg border border-line bg-surface-2/60 p-4">
          <p className="text-[12.5px] text-fg-muted">
            {titulosDoDevedor.length} título(s) em aberto somando
          </p>
          <p className="tnum mt-1 text-[20px] font-semibold text-fg">{money(valorDivida)}</p>
        </div>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Field label="Desconto (%)">
          <Select value={desconto} onChange={(e) => setDesconto(Number(e.target.value))}>
            {[0, 5, 10, 15, 20, 25, 30, 40].map((d) => (
              <option key={d} value={d}>
                {d}%
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Parcelas">
          <Select value={parcelas} onChange={(e) => setParcelas(Number(e.target.value))}>
            {[1, 2, 3, 4, 6, 8, 10, 12, 18, 24].map((p) => (
              <option key={p} value={p}>
                {p}x
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Entrada">
          <MoneyInput value={entrada} onChange={setEntrada} />
        </Field>
      </div>

      {devedorId && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Bloco rotulo="Valor do acordo" valor={money(valorAcordo)} destaque />
          <Bloco rotulo={`${parcelas}x de`} valor={money(valorParcela)} />
        </div>
      )}

      {erro && (
        <p className="mt-4 rounded-lg bg-danger-soft px-3 py-2.5 text-[13px] text-danger">{erro}</p>
      )}
    </Modal>
  );
}

export default function GestaoAcordosPage() {
  return (
    <Suspense fallback={<Carregando />}>
      <Conteudo />
    </Suspense>
  );
}
