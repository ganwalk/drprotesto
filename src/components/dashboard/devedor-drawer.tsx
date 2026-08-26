"use client";

import Link from "next/link";
import {
  ChatCircleDots,
  Envelope,
  Handshake,
  Phone,
  Prohibit,
  Stamp,
} from "@phosphor-icons/react";
import { Drawer } from "@/components/ui/overlay";
import { Avatar, Badge, Button, Divider } from "@/components/ui/primitives";
import { StatusPill } from "@/components/ui/status-pill";
import { useApp } from "@/store/app-store";
import { ACORDO_STATUS, TITULO_STATUS } from "@/lib/status";
import { date, daysBetween, maskDoc, maskPhone, money } from "@/lib/format";
import { hoje, type Devedor } from "@/lib/domain";

export function DevedorDrawer({
  devedor,
  onClose,
}: {
  devedor: Devedor | null;
  onClose: () => void;
}) {
  const { db, alternarBloqueioDevedor, enviarAvisoManual, notificar } = useApp();

  if (!devedor) return null;

  const titulos = db.titulos.filter((t) => t.devedorId === devedor.id);
  const abertos = titulos.filter((t) => t.status !== "LIQUIDADO");
  const acordos = db.acordos.filter((a) => a.devedorId === devedor.id);
  const processos = db.processos.filter((p) => p.devedorId === devedor.id);
  const empresa = db.empresas.find((e) => e.id === devedor.empresaId);
  const valorAberto = abertos.reduce((s, t) => s + t.valorAtualizado, 0);
  const conversa = db.conversas.find((c) => c.devedorId === devedor.id);

  const dispararAviso = (canal: "EMAIL" | "WHATSAPP") => {
    const alvo = abertos[0];
    if (!alvo) {
      notificar({ titulo: "Nenhum título em aberto", tone: "warn" });
      return;
    }
    enviarAvisoManual(alvo.id, canal);
    notificar({
      titulo: `Aviso enviado por ${canal === "EMAIL" ? "e-mail" : "WhatsApp"}`,
      descricao: `Título ${alvo.numero} · ${devedor.nome}`,
      tone: "ok",
    });
  };

  return (
    <Drawer
      aberto
      onClose={onClose}
      titulo={devedor.nome}
      subtitulo={
        <span className="tnum">
          {maskDoc(devedor.documento)} · {devedor.tipo === "PJ" ? "Pessoa jurídica" : "Pessoa física"}
        </span>
      }
      largura={620}
      rodape={
        <>
          <Button
            variant={devedor.bloqueado ? "outline" : "ghost"}
            size="sm"
            onClick={() => {
              alternarBloqueioDevedor(devedor.id);
              notificar({
                titulo: devedor.bloqueado ? "Devedor desbloqueado" : "Devedor bloqueado",
                descricao: devedor.bloqueado
                  ? "A régua volta a disparar avisos para este devedor."
                  : "Nenhum aviso automático será enviado.",
                tone: devedor.bloqueado ? "ok" : "warn",
              });
            }}
          >
            <Prohibit size={14} />
            {devedor.bloqueado ? "Desbloquear" : "Bloquear régua"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!devedor.email}
            onClick={() => dispararAviso("EMAIL")}
          >
            <Envelope size={14} /> Enviar e-mail
          </Button>
          <Button size="sm" disabled={!devedor.whatsapp} onClick={() => dispararAviso("WHATSAPP")}>
            <ChatCircleDots size={14} /> Enviar WhatsApp
          </Button>
        </>
      }
    >
      <div className="flex items-center gap-4">
        <Avatar nome={devedor.nome} size={52} />
        <div className="min-w-0 flex-1">
          <p className="tnum font-display text-[22px] leading-none font-semibold text-fg">
            {money(valorAberto)}
          </p>
          <p className="mt-1.5 text-[13px] text-fg-muted">
            {abertos.length} título(s) em aberto de {titulos.length} no total
          </p>
        </div>
        {devedor.bloqueado && (
          <Badge tone="danger" dot>
            Bloqueado
          </Badge>
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <InfoLinha rotulo="Empresa credora" valor={empresa?.nomeFantasia ?? "—"} />
        <InfoLinha rotulo="Localidade" valor={`${devedor.cidade}/${devedor.uf}`} />
        <InfoLinha rotulo="E-mail" valor={devedor.email ?? "Não informado"} alerta={!devedor.email} />
        <InfoLinha
          rotulo="WhatsApp"
          valor={devedor.whatsapp ? maskPhone(devedor.whatsapp) : "Não informado"}
          alerta={!devedor.whatsapp}
        />
        <InfoLinha
          rotulo="Telefone"
          valor={devedor.telefone ? maskPhone(devedor.telefone) : "—"}
        />
        <InfoLinha rotulo="Na carteira desde" valor={date(devedor.criadoEm)} />
      </div>

      <Divider className="my-6" label="Títulos" />

      <div className="space-y-2">
        {titulos.map((t) => {
          const atraso = daysBetween(t.vencimento, hoje());
          return (
            <div
              key={t.id}
              className="flex flex-wrap items-center gap-3 rounded-lg border border-line p-3"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-surface-2 text-fg-muted">
                <Stamp size={15} weight="duotone" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="tnum text-[13px] font-medium text-fg">Título {t.numero}</p>
                <p className="text-[11.5px] text-fg-muted">
                  Venc. {date(t.vencimento)}
                  {atraso > 0 && ` · ${atraso} dias de atraso`}
                  {t.protocoloCartorio && ` · Prot. ${t.protocoloCartorio}`}
                </p>
              </div>
              <StatusPill meta={TITULO_STATUS[t.status]} />
              <p className="tnum w-24 text-right text-[13px] font-semibold text-fg">
                {money(t.valorAtualizado)}
              </p>
            </div>
          );
        })}
      </div>

      {acordos.length > 0 && (
        <>
          <Divider className="my-6" label="Acordos" />
          <div className="space-y-2">
            {acordos.map((a) => (
              <Link
                key={a.id}
                href={`/dashboard/gestao-acordos?acordo=${a.id}`}
                className="flex items-center gap-3 rounded-lg border border-line p-3 transition-colors hover:bg-surface-2"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent">
                  <Handshake size={15} weight="duotone" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="tnum text-[13px] font-medium text-fg">{a.codigo}</p>
                  <p className="text-[11.5px] text-fg-muted">
                    {a.parcelas.length}x · desconto de {a.descontoPercentual}%
                  </p>
                </div>
                <StatusPill meta={ACORDO_STATUS[a.status]} />
                <p className="tnum text-[13px] font-semibold text-fg">{money(a.valorAcordo)}</p>
              </Link>
            ))}
          </div>
        </>
      )}

      {processos.length > 0 && (
        <>
          <Divider className="my-6" label="Processos" />
          <div className="space-y-2">
            {processos.map((p) => (
              <Link
                key={p.id}
                href={`/dashboard/juridico-processos?processo=${p.id}`}
                className="block rounded-lg border border-line p-3 transition-colors hover:bg-surface-2"
              >
                <p className="tnum text-[13px] font-medium text-fg">{p.numeroCNJ}</p>
                <p className="mt-0.5 text-[11.5px] text-fg-muted">
                  {p.comarca} · {p.vara}
                </p>
              </Link>
            ))}
          </div>
        </>
      )}

      {conversa && (
        <>
          <Divider className="my-6" label="Última conversa" />
          <Link
            href="/dashboard/whatsapp-web/conversas"
            className="flex items-start gap-3 rounded-lg border border-line p-3.5 transition-colors hover:bg-surface-2"
          >
            <Phone size={16} weight="duotone" className="mt-0.5 shrink-0 text-accent" />
            <div className="min-w-0">
              <p className="line-clamp-2 text-[13px] text-fg">
                {conversa.mensagens[conversa.mensagens.length - 1].texto}
              </p>
              <p className="mt-1 text-[11.5px] text-fg-subtle">
                {date(conversa.atualizadaEm, "datetime")}
              </p>
            </div>
          </Link>
        </>
      )}
    </Drawer>
  );
}

function InfoLinha({
  rotulo,
  valor,
  alerta,
}: {
  rotulo: string;
  valor: string;
  alerta?: boolean;
}) {
  return (
    <div className="rounded-lg bg-surface-2/60 px-3 py-2.5">
      <p className="text-[11px] font-medium tracking-wide text-fg-subtle uppercase">{rotulo}</p>
      <p
        className={`tnum mt-1 truncate text-[13px] ${alerta ? "text-danger" : "text-fg"}`}
        title={valor}
      >
        {valor}
      </p>
    </div>
  );
}
