"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  ArrowsLeftRight,
  Bank,
  CalendarCheck,
  Copy,
  CurrencyCircleDollar,
  Key,
  QrCode,
  Receipt,
  Star,
  Check,
} from "@phosphor-icons/react";
import { Badge, Button, Card, CardHeader, KpiCard, PageHeader } from "@/components/ui/primitives";
import { StatusPill } from "@/components/ui/status-pill";
import { useCopiar } from "@/components/dashboard/qrcode-pix";
import { useApp } from "@/store/app-store";
import { useEscopo } from "@/store/selectors";
import { COBRANCA_STATUS } from "@/lib/status";
import { date, maskDoc, money, num } from "@/lib/format";
import { hoje } from "@/lib/domain";

const ACOES = [
  {
    href: "/dashboard/pix/configurar-link",
    icon: QrCode,
    titulo: "Gerar cobrança",
    texto: "QR Code e copia-e-cola com validade e compartilhamento por WhatsApp.",
  },
  {
    href: "/dashboard/pix/links-cobranca",
    icon: Receipt,
    titulo: "Meus links de cobrança",
    texto: "Acompanhe pendentes, pagos, expirados e cancelados.",
  },
  {
    href: "/dashboard/extract",
    icon: ArrowsLeftRight,
    titulo: "Extrato bancário",
    texto: "Lançamentos por período com exportação em PDF e Excel.",
  },
  {
    href: "/dashboard/financeiro-credor/despesas",
    icon: CurrencyCircleDollar,
    titulo: "Despesas",
    texto: "Custas, emolumentos e honorários por empresa.",
  },
];

export default function AreaPixPage() {
  const { db, empresaAtivaId } = useApp();
  const cobrancas = useEscopo(db.cobrancas);
  const lancamentos = useEscopo(db.lancamentos);
  const { copiado, copiar } = useCopiar();
  const [chaveCopiada, setChaveCopiada] = useState<string | null>(null);

  const chaves = db.chavesPix.filter(
    (c) => empresaAtivaId === "TODAS" || c.empresaId === empresaAtivaId,
  );

  const pagas = cobrancas.filter((c) => c.status === "PAGO");
  const pendentes = cobrancas.filter((c) => c.status === "PENDENTE");
  const recebidoMes = lancamentos
    .filter((l) => {
      const d = new Date(l.data);
      const ref = hoje();
      return (
        l.tipo === "CREDITO" &&
        d.getMonth() === ref.getMonth() &&
        d.getFullYear() === ref.getFullYear()
      );
    })
    .reduce((s, l) => s + l.valor, 0);

  const saldo = lancamentos.length ? lancamentos[lancamentos.length - 1].saldo : 0;
  const recentes = [...cobrancas]
    .sort((a, b) => new Date(b.criadaEm).getTime() - new Date(a.criadaEm).getTime())
    .slice(0, 6);

  return (
    <>
      <PageHeader
        breadcrumb="Financeiro"
        titulo="Área PIX"
        descricao="Cobranças instantâneas, chaves cadastradas e conciliação automática com a carteira de títulos."
        acoes={
          <Link href="/dashboard/pix/configurar-link">
            <Button>
              <QrCode size={15} /> Gerar cobrança
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Saldo disponível"
          valor={money(saldo)}
          sub="conta de recebimento"
          icon={<Bank size={17} weight="duotone" />}
          tone="accent"
        />
        <KpiCard
          label="Recebido no mês"
          valor={money(recebidoMes)}
          sub={`${num(pagas.length)} cobranças pagas`}
          tone="ok"
        />
        <KpiCard
          label="Cobranças pendentes"
          valor={num(pendentes.length)}
          sub={money(pendentes.reduce((s, c) => s + c.valor, 0))}
          tone="warn"
        />
        <KpiCard
          label="Taxa de conversão"
          valor={
            cobrancas.length
              ? `${((pagas.length / cobrancas.length) * 100).toFixed(1)}%`
              : "—"
          }
          sub="links pagos sobre gerados"
          tone="info"
        />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {ACOES.map(({ href, icon: Icone, titulo, texto }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-xl border border-line bg-surface p-5 transition-colors hover:border-accent hover:bg-accent-soft/40"
          >
            <div className="flex items-start justify-between">
              <span className="grid size-10 place-items-center rounded-xl bg-accent-soft text-accent transition-colors group-hover:bg-accent group-hover:text-accent-fg">
                <Icone size={19} weight="duotone" />
              </span>
              <ArrowRight
                size={14}
                weight="bold"
                className="mt-1 text-fg-subtle opacity-0 transition-opacity group-hover:opacity-100"
              />
            </div>
            <p className="font-display mt-4 text-[14.5px] font-semibold text-fg">{titulo}</p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-fg-muted">{texto}</p>
          </Link>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Cobranças recentes"
            description="Últimos links gerados no escopo atual."
            icon={<Receipt size={15} weight="duotone" />}
            actions={
              <Link href="/dashboard/pix/links-cobranca">
                <Button variant="ghost" size="sm">
                  Ver todos
                </Button>
              </Link>
            }
          />
          <div className="divide-y divide-line">
            {recentes.map((c) => {
              const devedor = db.devedores.find((d) => d.id === c.devedorId);
              return (
                <div key={c.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-fg">
                      {devedor?.nome ?? c.descricao}
                    </p>
                    <p className="tnum text-[11.5px] text-fg-muted">
                      {c.codigo} · criada em {date(c.criadaEm)}
                    </p>
                  </div>
                  <StatusPill meta={COBRANCA_STATUS[c.status]} />
                  <p className="tnum w-24 text-right text-[13px] font-semibold text-fg">
                    {money(c.valor)}
                  </p>
                </div>
              );
            })}
            {recentes.length === 0 && (
              <p className="px-5 py-10 text-center text-[13px] text-fg-muted">
                Nenhuma cobrança gerada ainda.
              </p>
            )}
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader
              title="Chaves PIX"
              description="Chaves cadastradas para recebimento."
              icon={<Key size={15} weight="duotone" />}
            />
            <div className="divide-y divide-line">
              {chaves.map((chave) => {
                const empresa = db.empresas.find((e) => e.id === chave.empresaId);
                return (
                  <div key={chave.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold tracking-wide text-fg-subtle uppercase">
                          {chave.tipo}
                        </span>
                        {chave.principal && (
                          <Badge tone="accent">
                            <Star size={9} weight="fill" /> Principal
                          </Badge>
                        )}
                      </div>
                      <p className="tnum mt-0.5 truncate text-[12.5px] text-fg">
                        {chave.tipo === "CNPJ" ? maskDoc(chave.valor) : chave.valor}
                      </p>
                      <p className="truncate text-[11px] text-fg-subtle">
                        {empresa?.nomeFantasia}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        void copiar(chave.valor);
                        setChaveCopiada(chave.id);
                      }}
                      aria-label="Copiar chave"
                      className="grid size-8 shrink-0 place-items-center rounded-lg text-fg-subtle transition-colors hover:bg-surface-2 hover:text-accent"
                    >
                      {copiado && chaveCopiada === chave.id ? (
                        <Check size={14} weight="bold" className="text-ok" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Favoritos"
              description="Contas usadas com frequência."
              icon={<Star size={15} weight="duotone" />}
            />
            <div className="divide-y divide-line">
              {db.favoritos.slice(0, 5).map((f) => (
                <div key={f.id} className="flex items-center gap-3 px-5 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-medium text-fg">{f.nome}</p>
                    <p className="truncate text-[11px] text-fg-muted">{f.banco}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    Enviar
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <p className="flex items-center gap-2 text-[13px] font-semibold text-fg">
              <CalendarCheck size={15} weight="duotone" className="text-accent" />
              PIX programado
            </p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-fg-muted">
              Agende transferências recorrentes para repasse de honorários e custas. Nenhum
              agendamento ativo no momento.
            </p>
            <Button variant="outline" size="sm" className="mt-3">
              Criar agendamento
            </Button>
          </Card>
        </div>
      </div>
    </>
  );
}
