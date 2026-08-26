"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Buildings,
  CurrencyCircleDollar,
  Envelope,
  Gavel,
  Handshake,
  Stamp,
  TrendUp,
  UploadSimple,
  Users,
} from "@phosphor-icons/react";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  KpiCard,
  PageHeader,
  Progress,
} from "@/components/ui/primitives";
import { StatusPill } from "@/components/ui/status-pill";
import { GraficoAging, GraficoDistribuicao, GraficoEvolucao } from "@/components/ui/charts";
import { useApp } from "@/store/app-store";
import {
  useAging,
  useAvisosResumo,
  useCarteira,
  useEmpresaAtiva,
  useEscopo,
  useKpis,
  useSerieMensal,
} from "@/store/selectors";
import { TITULO_COR, TITULO_STATUS } from "@/lib/status";
import { date, money, moneyCompact, num, pct } from "@/lib/format";
import { TITULO_FLOW, type TituloStatus } from "@/lib/domain";

const ATALHOS = [
  { href: "/dashboard/regua", label: "Minhas réguas", icon: Envelope },
  { href: "/dashboard/controle-titulo?novo=1", label: "Novo título", icon: Stamp },
  { href: "/dashboard/importar-devedores-juridicos", label: "Importar devedores", icon: UploadSimple },
  { href: "/dashboard/pix/configurar-link", label: "Gerar cobrança", icon: CurrencyCircleDollar },
];

export default function DashboardPage() {
  const { db } = useApp();
  const empresa = useEmpresaAtiva();
  const kpis = useKpis();
  const serie = useSerieMensal(12);
  const aging = useAging();
  const carteira = useCarteira();
  const avisos = useAvisosResumo();
  const titulos = useEscopo(db.titulos);
  const acordos = useEscopo(db.acordos);
  const processos = useEscopo(db.processos);

  const distribuicao = useMemo(
    () =>
      (Object.keys(kpis.porStatus) as TituloStatus[])
        .filter((s) => kpis.porStatus[s].qtd > 0)
        .map((s) => ({
          nome: TITULO_STATUS[s].label,
          valor: kpis.porStatus[s].qtd,
          cor: TITULO_COR[s],
        })),
    [kpis.porStatus],
  );

  const maioresDevedores = carteira.slice(0, 7);

  const atividade = useMemo(() => {
    return titulos
      .flatMap((t) =>
        t.historico.map((h) => ({
          ...h,
          tituloNumero: t.numero,
          devedor: db.devedores.find((d) => d.id === t.devedorId)?.nome ?? "—",
        })),
      )
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
      .slice(0, 8);
  }, [titulos, db.devedores]);

  const acordosEmRisco = acordos.filter((a) =>
    ["ATRASADO", "DESCUMPRIDO"].includes(a.status),
  ).length;

  return (
    <>
      <PageHeader
        breadcrumb="Credor · Acompanhamento"
        titulo="Dashboard de títulos"
        descricao={
          empresa
            ? `Escopo: ${empresa.nomeFantasia} · ${empresa.cidade}/${empresa.uf}`
            : `Consolidado de ${db.empresas.length} empresas da conta matriz.`
        }
        acoes={
          <>
            <Link href="/dashboard/regua">
              <Button variant="outline" size="md">
                <Envelope size={15} /> Minhas réguas
              </Button>
            </Link>
            <Link href="/dashboard/controle-titulo?novo=1">
              <Button size="md">
                <Stamp size={15} /> Novo título
              </Button>
            </Link>
          </>
        }
      />

      {/* Indicadores principais */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Carteira em aberto"
          valor={money(kpis.valorTotal)}
          sub={`${num(kpis.totalTitulos - kpis.porStatus.LIQUIDADO.qtd)} títulos ativos`}
          icon={<CurrencyCircleDollar size={17} weight="duotone" />}
          tone="accent"
        />
        <KpiCard
          label="Vencido"
          valor={money(kpis.valorVencido)}
          sub={`atraso médio de ${kpis.diasMedioAtraso} dias`}
          icon={<TrendUp size={17} weight="duotone" />}
          tone="warn"
        />
        <KpiCard
          label="Recuperado"
          valor={money(kpis.valorRecuperado)}
          delta={{ valor: pct(kpis.taxaRecuperacao), positivo: true }}
          sub="da carteira total"
          icon={<Handshake size={17} weight="duotone" />}
          tone="ok"
        />
        <KpiCard
          label="Devedores"
          valor={num(kpis.devedoresAtivos)}
          sub={`ticket médio ${moneyCompact(kpis.ticketMedio)}`}
          icon={<Users size={17} weight="duotone" />}
          tone="info"
        />
      </div>

      {/* Fluxo de status */}
      <Card className="mt-4 p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-[15px] font-semibold text-fg">
              Distribuição pelo fluxo de protesto
            </h3>
            <p className="mt-0.5 text-[13px] text-fg-muted">
              Quantidade e valor em cada etapa, do prazo normal ao jurídico.
            </p>
          </div>
          <Link
            href="/dashboard/controle-titulo"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-accent hover:underline"
          >
            Ver títulos <ArrowRight size={13} weight="bold" />
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {TITULO_FLOW.map((status) => {
            const meta = TITULO_STATUS[status];
            const dado = kpis.porStatus[status];
            const proporcao = kpis.totalTitulos ? dado.qtd / kpis.totalTitulos : 0;
            return (
              <Link
                key={status}
                href={`/dashboard/controle-titulo?status=${status}`}
                className="group rounded-lg border border-line bg-surface-2/50 p-3.5 transition-colors hover:border-line-strong hover:bg-surface-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <StatusPill meta={meta} />
                  <ArrowUpRight
                    size={13}
                    weight="bold"
                    className="text-fg-subtle opacity-0 transition-opacity group-hover:opacity-100"
                  />
                </div>
                <p className="tnum font-display mt-3 text-[21px] leading-none font-semibold text-fg">
                  {num(dado.qtd)}
                </p>
                <p className="tnum mt-1.5 text-[12px] text-fg-muted">{moneyCompact(dado.valor)}</p>
                <Progress value={proporcao} tone={meta.tone} className="mt-3" height={4} />
              </Link>
            );
          })}
        </div>
      </Card>

      {/* Gráficos */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Vencimento x recuperação"
            description="Quanto venceu e quanto foi efetivamente recuperado em cada mês."
            icon={<TrendUp size={15} weight="duotone" />}
          />
          <div className="p-4">
            <GraficoEvolucao dados={serie} />
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Composição da carteira"
            description="Títulos por status."
            icon={<Stamp size={15} weight="duotone" />}
          />
          <div className="p-4">
            <GraficoDistribuicao dados={distribuicao} altura={200} />
            <div className="mt-3 space-y-1.5">
              {distribuicao.slice(0, 5).map((d) => (
                <div key={d.nome} className="flex items-center gap-2 text-[12.5px]">
                  <span className="size-2 shrink-0 rounded-full" style={{ background: d.cor }} />
                  <span className="min-w-0 flex-1 truncate text-fg-muted">{d.nome}</span>
                  <span className="tnum font-semibold text-fg">{num(d.valor)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Aging da carteira"
            description="Valor em aberto por faixa de atraso."
          />
          <div className="p-4">
            <GraficoAging dados={aging} />
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="font-display text-[15px] font-semibold text-fg">Régua de cobrança</h3>
            <p className="mt-0.5 text-[13px] text-fg-muted">Desempenho dos disparos no período.</p>

            <div className="mt-4 space-y-3.5">
              <div>
                <div className="mb-1.5 flex items-center justify-between text-[12.5px]">
                  <span className="text-fg-muted">Taxa de entrega</span>
                  <span className="tnum font-semibold text-fg">{pct(avisos.taxaSucesso)}</span>
                </div>
                <Progress value={avisos.taxaSucesso} tone="ok" />
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between text-[12.5px]">
                  <span className="text-fg-muted">Taxa de leitura</span>
                  <span className="tnum font-semibold text-fg">{pct(avisos.taxaLeitura)}</span>
                </div>
                <Progress value={avisos.taxaLeitura} tone="accent" />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-4 text-center">
              <div>
                <p className="tnum text-[16px] font-semibold text-fg">{num(avisos.total)}</p>
                <p className="text-[11px] text-fg-subtle">disparos</p>
              </div>
              <div>
                <p className="tnum text-[16px] font-semibold text-ok">{num(avisos.entregues)}</p>
                <p className="text-[11px] text-fg-subtle">entregues</p>
              </div>
              <div>
                <p className="tnum text-[16px] font-semibold text-danger">{num(avisos.falhas)}</p>
                <p className="text-[11px] text-fg-subtle">falhas</p>
              </div>
            </div>

            <Link
              href="/dashboard/relatorio-avisos"
              className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-accent hover:underline"
            >
              Relatório completo <ArrowRight size={13} weight="bold" />
            </Link>
          </Card>

          <Card className="p-5">
            <h3 className="font-display text-[15px] font-semibold text-fg">Atalhos</h3>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {ATALHOS.map(({ href, label, icon: Icone }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex flex-col gap-2 rounded-lg border border-line bg-surface-2/50 p-3 transition-colors hover:border-accent hover:bg-accent-soft"
                >
                  <Icone size={17} weight="duotone" className="text-accent" />
                  <span className="text-[12.5px] leading-snug font-medium text-fg">{label}</span>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Maiores devedores + atividade */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Maiores exposições"
            description="Devedores com maior valor em aberto."
            icon={<Buildings size={15} weight="duotone" />}
            actions={
              <Link href="/dashboard/carteira-devedores">
                <Button variant="ghost" size="sm">
                  Ver carteira
                </Button>
              </Link>
            }
          />
          <div className="divide-y divide-line">
            {maioresDevedores.map((linha) => (
              <Link
                key={linha.devedor.id}
                href={`/dashboard/carteira-devedores?devedor=${linha.devedor.id}`}
                className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-surface-2/60"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-fg">{linha.devedor.nome}</p>
                  <p className="tnum mt-0.5 text-[12px] text-fg-muted">
                    {linha.qtdTitulos} título(s) · {linha.maiorAtraso} dias de atraso
                  </p>
                </div>
                <StatusPill meta={TITULO_STATUS[linha.statusPrincipal]} dot={false} />
                <p className="tnum w-24 shrink-0 text-right text-[13px] font-semibold text-fg">
                  {money(linha.valorAberto)}
                </p>
              </Link>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Atividade recente"
            description="Últimos eventos registrados nos títulos."
            actions={
              acordosEmRisco > 0 ? (
                <Badge tone="warn" dot>
                  {acordosEmRisco} acordos em risco
                </Badge>
              ) : undefined
            }
          />
          <div className="divide-y divide-line">
            {atividade.map((ev) => (
              <div key={ev.id} className="flex gap-3 px-5 py-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-fg">
                    {ev.tipo} · <span className="tnum text-fg-muted">título {ev.tituloNumero}</span>
                  </p>
                  <p className="mt-0.5 truncate text-[12px] text-fg-muted">{ev.descricao}</p>
                  <p className="mt-1 text-[11.5px] text-fg-subtle">
                    {ev.devedor} · {date(ev.data)} · {ev.autor}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Faixa jurídica */}
      <Card className="mt-4 flex flex-wrap items-center gap-6 p-5">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
          <Gavel size={20} weight="duotone" />
        </span>
        <div className="min-w-[180px] flex-1">
          <p className="font-display text-[15px] font-semibold text-fg">Frente jurídica</p>
          <p className="mt-0.5 text-[13px] text-fg-muted">
            {num(processos.length)} processos em andamento ·{" "}
            {money(processos.reduce((s, p) => s + p.valorCausa, 0))} em valor de causa
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/gestao-acordos">
            <Button variant="outline" size="sm">
              <Handshake size={14} /> Acordos ({acordos.length})
            </Button>
          </Link>
          <Link href="/dashboard/juridico-processos">
            <Button size="sm">
              <Gavel size={14} /> Processos
            </Button>
          </Link>
        </div>
      </Card>
    </>
  );
}
