"use client";

import { useState } from "react";
import {
  ArrowUUpLeft,
  ChatCircleDots,
  Envelope,
  Stamp,
  Clock,
} from "@phosphor-icons/react";
import { Drawer } from "@/components/ui/overlay";
import { Badge, Button, Divider } from "@/components/ui/primitives";
import { StatusPill } from "@/components/ui/status-pill";
import { Select } from "@/components/ui/form";
import { useApp } from "@/store/app-store";
import { TITULO_STATUS } from "@/lib/status";
import { date, daysBetween, maskDoc, money } from "@/lib/format";
import { ESPECIES, hoje, TITULO_FLOW, type Titulo, type TituloStatus } from "@/lib/domain";

export function TituloDrawer({
  titulo,
  onClose,
}: {
  titulo: Titulo | null;
  onClose: () => void;
}) {
  const { db, mudarStatusTitulo, enviarParaProtesto, enviarAvisoManual, notificar } = useApp();
  const [novoStatus, setNovoStatus] = useState<TituloStatus | "">("");

  if (!titulo) return null;

  const devedor = db.devedores.find((d) => d.id === titulo.devedorId);
  const empresa = db.empresas.find((e) => e.id === titulo.empresaId);
  const acordo = db.acordos.find((a) => a.id === titulo.acordoId);
  const processo = db.processos.find((p) => p.id === titulo.processoId);
  const avisos = db.avisos.filter((a) => a.tituloId === titulo.id);
  const atraso = daysBetween(titulo.vencimento, hoje());
  const encargos = titulo.valorAtualizado - titulo.valorOriginal;

  const podeProtestar = ["PRE_PROTESTO", "DEVOLVIDO"].includes(titulo.status);

  return (
    <Drawer
      aberto
      onClose={onClose}
      titulo={`Título ${titulo.numero}`}
      subtitulo={
        <span className="flex items-center gap-2">
          <StatusPill meta={TITULO_STATUS[titulo.status]} />
          <span className="text-fg-muted">{ESPECIES[titulo.especie]}</span>
        </span>
      }
      largura={640}
      rodape={
        <>
          <Button
            variant="ghost"
            size="sm"
            disabled={!devedor?.email}
            onClick={() => {
              enviarAvisoManual(titulo.id, "EMAIL");
              notificar({ titulo: "Aviso por e-mail enviado", tone: "ok" });
            }}
          >
            <Envelope size={14} /> E-mail
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={!devedor?.whatsapp}
            onClick={() => {
              enviarAvisoManual(titulo.id, "WHATSAPP");
              notificar({ titulo: "Aviso por WhatsApp enviado", tone: "ok" });
            }}
          >
            <ChatCircleDots size={14} /> WhatsApp
          </Button>
          {podeProtestar && (
            <Button size="sm" onClick={() => enviarParaProtesto([titulo.id])}>
              <Stamp size={14} /> Enviar a protesto
            </Button>
          )}
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-line bg-surface-2/60 p-3.5">
          <p className="text-[11px] font-medium tracking-wide text-fg-subtle uppercase">
            Valor original
          </p>
          <p className="tnum mt-1 text-[15px] font-semibold text-fg">
            {money(titulo.valorOriginal)}
          </p>
        </div>
        <div className="rounded-lg border border-line bg-surface-2/60 p-3.5">
          <p className="text-[11px] font-medium tracking-wide text-fg-subtle uppercase">
            Encargos
          </p>
          <p className="tnum mt-1 text-[15px] font-semibold text-warn">{money(encargos)}</p>
        </div>
        <div className="rounded-lg border border-accent bg-accent-soft p-3.5">
          <p className="text-[11px] font-medium tracking-wide text-accent uppercase">
            Valor atualizado
          </p>
          <p className="tnum mt-1 text-[15px] font-semibold text-accent">
            {money(titulo.valorAtualizado)}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3.5">
        <Info rotulo="Devedor" valor={devedor?.nome ?? "—"} />
        <Info rotulo="Documento" valor={devedor ? maskDoc(devedor.documento) : "—"} />
        <Info rotulo="Empresa credora" valor={empresa?.nomeFantasia ?? "—"} />
        <Info rotulo="Espécie" valor={`${titulo.especie} — ${ESPECIES[titulo.especie]}`} />
        <Info rotulo="Emissão" valor={date(titulo.emissao)} />
        <Info
          rotulo="Vencimento"
          valor={`${date(titulo.vencimento)}${atraso > 0 ? ` · ${atraso} dias de atraso` : ""}`}
          alerta={atraso > 60}
        />
        {titulo.protocoloCartorio && (
          <>
            <Info rotulo="Protocolo" valor={titulo.protocoloCartorio} />
            <Info rotulo="Cartório" valor={`${titulo.cartorio} — ${titulo.ufCartorio}`} />
          </>
        )}
        {titulo.dataRemessa && <Info rotulo="Remessa" valor={date(titulo.dataRemessa)} />}
        {titulo.dataProtesto && <Info rotulo="Protesto lavrado" valor={date(titulo.dataProtesto)} />}
      </div>

      {titulo.motivoDevolucao && (
        <div className="mt-5 rounded-lg border border-danger/30 bg-danger-soft p-3.5">
          <p className="text-[12px] font-semibold text-danger">Devolvido pelo cartório</p>
          <p className="mt-1 text-[13px] text-danger">{titulo.motivoDevolucao}</p>
        </div>
      )}

      {(acordo || processo) && (
        <div className="mt-5 flex flex-wrap gap-2">
          {acordo && <Badge tone="accent">Acordo {acordo.codigo}</Badge>}
          {processo && <Badge tone="warn">Processo {processo.numeroCNJ}</Badge>}
        </div>
      )}

      <Divider className="my-6" label="Alterar status" />

      <div className="flex flex-wrap items-end gap-2">
        <label className="min-w-[220px] flex-1">
          <span className="mb-1.5 block text-[12.5px] font-medium text-fg">Novo status</span>
          <Select
            value={novoStatus}
            onChange={(e) => setNovoStatus(e.target.value as TituloStatus)}
          >
            <option value="">Selecione…</option>
            {[...TITULO_FLOW, "DEVOLVIDO", "LIQUIDADO"].map((s) => (
              <option key={s} value={s}>
                {TITULO_STATUS[s as TituloStatus].label}
              </option>
            ))}
          </Select>
        </label>
        <Button
          size="md"
          disabled={!novoStatus}
          onClick={() => {
            if (!novoStatus) return;
            mudarStatusTitulo([titulo.id], novoStatus, "Alteração manual pelo operador.");
            notificar({
              titulo: "Status atualizado",
              descricao: `Título ${titulo.numero} → ${TITULO_STATUS[novoStatus].label}`,
              tone: "ok",
            });
            setNovoStatus("");
            onClose();
          }}
        >
          <ArrowUUpLeft size={14} /> Aplicar
        </Button>
      </div>

      <Divider className="my-6" label={`Histórico (${titulo.historico.length})`} />

      <ol className="relative space-y-4 border-l border-line pl-5">
        {[...titulo.historico].reverse().map((ev) => (
          <li key={ev.id} className="relative">
            <span className="absolute top-1 -left-[26px] size-2.5 rounded-full border-2 border-surface bg-accent" />
            <p className="text-[13px] font-medium text-fg">{ev.tipo}</p>
            <p className="mt-0.5 text-[12.5px] leading-relaxed text-fg-muted">{ev.descricao}</p>
            <p className="mt-1 flex items-center gap-1.5 text-[11.5px] text-fg-subtle">
              <Clock size={11} />
              {date(ev.data, "datetime")} · {ev.autor}
            </p>
          </li>
        ))}
      </ol>

      {avisos.length > 0 && (
        <>
          <Divider className="my-6" label={`Avisos enviados (${avisos.length})`} />
          <div className="space-y-1.5">
            {avisos.slice(0, 8).map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-3 rounded-lg border border-line px-3 py-2"
              >
                {a.canal === "EMAIL" ? (
                  <Envelope size={14} className="shrink-0 text-fg-subtle" />
                ) : (
                  <ChatCircleDots size={14} className="shrink-0 text-fg-subtle" />
                )}
                <span className="tnum min-w-0 flex-1 truncate text-[12.5px] text-fg-muted">
                  {a.destino}
                </span>
                <span className="text-[11.5px] text-fg-subtle">{date(a.enviadoEm)}</span>
                <Badge
                  tone={
                    a.status === "FALHA" ? "danger" : a.status === "LIDO" ? "ok" : "neutral"
                  }
                  title={a.erro ?? undefined}
                >
                  {a.status}
                </Badge>
              </div>
            ))}
          </div>
        </>
      )}
    </Drawer>
  );
}

function Info({
  rotulo,
  valor,
  alerta,
}: {
  rotulo: string;
  valor: string;
  alerta?: boolean;
}) {
  return (
    <div>
      <p className="text-[11px] font-medium tracking-wide text-fg-subtle uppercase">{rotulo}</p>
      <p className={`tnum mt-0.5 text-[13px] ${alerta ? "text-danger" : "text-fg"}`}>{valor}</p>
    </div>
  );
}
