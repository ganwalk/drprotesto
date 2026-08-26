"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import {
  ChatCircleDots,
  CheckCircle,
  PaperPlaneRight,
  Robot,
  User,
  UserCircle,
} from "@phosphor-icons/react";
import { Avatar, Badge, Button, PageHeader, Segmented } from "@/components/ui/primitives";
import { SearchInput } from "@/components/ui/form";
import { useApp } from "@/store/app-store";
import { useEscopo, useIndices } from "@/store/selectors";
import { TRIAGEM_STATUS } from "@/lib/status";
import { date, maskPhone, money } from "@/lib/format";
import type { TriagemStatus } from "@/lib/domain";
import { cn } from "@/lib/cn";

export default function ConversasPage() {
  const { db, responderConversa, marcarConversaLida, definirTriagem, notificar } = useApp();
  const conversas = useEscopo(db.conversas);
  const { devedorPorId } = useIndices();

  const [filtro, setFiltro] = useState<TriagemStatus | "TODAS">("TODAS");
  const [busca, setBusca] = useState("");
  const [ativaId, setAtivaId] = useState<string | null>(null);
  const [texto, setTexto] = useState("");
  const fimRef = useRef<HTMLDivElement>(null);

  const ordenadas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return [...conversas]
      .filter((c) => {
        if (filtro !== "TODAS" && c.triagem !== filtro) return false;
        if (!termo) return true;
        const d = devedorPorId.get(c.devedorId);
        return d?.nome.toLowerCase().includes(termo) ?? false;
      })
      .sort((a, b) => new Date(b.atualizadaEm).getTime() - new Date(a.atualizadaEm).getTime());
  }, [conversas, filtro, busca, devedorPorId]);

  const ativa = conversas.find((c) => c.id === ativaId) ?? ordenadas[0] ?? null;
  const devedorAtivo = ativa ? devedorPorId.get(ativa.devedorId) : null;

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ativa?.mensagens.length, ativa?.id]);

  useEffect(() => {
    if (ativa && ativa.naoLidas > 0) marcarConversaLida(ativa.id);
  }, [ativa, marcarConversaLida]);

  const contar = (t: TriagemStatus | "TODAS") =>
    t === "TODAS" ? conversas.length : conversas.filter((c) => c.triagem === t).length;

  const enviar = () => {
    if (!ativa || !texto.trim()) return;
    responderConversa(ativa.id, texto.trim());
    setTexto("");
  };

  const titulosDoDevedor = devedorAtivo
    ? db.titulos.filter((t) => t.devedorId === devedorAtivo.id && t.status !== "LIQUIDADO")
    : [];
  const totalAberto = titulosDoDevedor.reduce((s, t) => s + t.valorAtualizado, 0);

  return (
    <>
      <PageHeader
        breadcrumb="Conta"
        titulo="WhatsApp"
        descricao="Caixa de conversas integrada, com triagem entre atendimento automático e humano."
        acoes={
          <Badge tone={db.integracoes.whatsapp.conectado ? "ok" : "danger"} dot>
            {db.integracoes.whatsapp.conectado
              ? `Conectado · ${maskPhone(db.integracoes.whatsapp.numero ?? "")}`
              : "Sessão desconectada"}
          </Badge>
        }
      />

      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        <div className="grid h-[calc(100dvh-260px)] min-h-[520px] grid-cols-1 md:grid-cols-[320px_1fr] lg:grid-cols-[320px_1fr_280px]">
          {/* Lista de conversas */}
          <div className="flex min-h-0 flex-col border-r border-line">
            <div className="space-y-3 border-b border-line p-3">
              <SearchInput
                placeholder="Buscar devedor…"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
              <div className="overflow-x-auto">
                <Segmented
                  size="sm"
                  value={filtro}
                  onChange={setFiltro}
                  options={[
                    { value: "TODAS" as const, label: "Todas", count: contar("TODAS") },
                    { value: "DEVEDOR" as const, label: "Devedores", count: contar("DEVEDOR") },
                    { value: "HUMANO" as const, label: "Humano", count: contar("HUMANO") },
                    { value: "ENGAJOU" as const, label: "Engajou", count: contar("ENGAJOU") },
                    {
                      value: "SEM_RESPOSTA" as const,
                      label: "Sem resposta",
                      count: contar("SEM_RESPOSTA"),
                    },
                  ]}
                />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {ordenadas.map((c) => {
                const d = devedorPorId.get(c.devedorId);
                const ultima = c.mensagens[c.mensagens.length - 1];
                const selecionada = ativa?.id === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setAtivaId(c.id)}
                    className={cn(
                      "flex w-full items-start gap-3 border-b border-line/70 px-3.5 py-3 text-left transition-colors",
                      selecionada ? "bg-accent-soft" : "hover:bg-surface-2/70",
                    )}
                  >
                    <Avatar nome={d?.nome ?? "?"} size={36} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="truncate text-[13px] font-medium text-fg">
                          {d?.nome ?? "—"}
                        </p>
                        <span className="shrink-0 text-[10.5px] text-fg-subtle">
                          {date(c.atualizadaEm)}
                        </span>
                      </div>
                      <p className="mt-0.5 line-clamp-1 text-[12px] text-fg-muted">
                        {ultima?.texto}
                      </p>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <Badge tone={TRIAGEM_STATUS[c.triagem].tone}>
                          {TRIAGEM_STATUS[c.triagem].label}
                        </Badge>
                        {c.naoLidas > 0 && (
                          <span className="tnum rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-accent-fg">
                            {c.naoLidas}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
              {ordenadas.length === 0 && (
                <p className="px-4 py-12 text-center text-[13px] text-fg-muted">
                  Nenhuma conversa neste filtro.
                </p>
              )}
            </div>
          </div>

          {/* Painel de mensagens */}
          <div className="flex min-h-0 flex-col">
            {!ativa || !devedorAtivo ? (
              <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                <span className="grid size-12 place-items-center rounded-xl bg-surface-2 text-fg-subtle">
                  <ChatCircleDots size={22} />
                </span>
                <p className="mt-4 text-[14px] font-medium text-fg">Selecione uma conversa</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 border-b border-line px-4 py-3">
                  <Avatar nome={devedorAtivo.nome} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-semibold text-fg">
                      {devedorAtivo.nome}
                    </p>
                    <p className="tnum text-[11.5px] text-fg-muted">
                      {devedorAtivo.whatsapp ? maskPhone(devedorAtivo.whatsapp) : "sem WhatsApp"}
                    </p>
                  </div>
                  <select
                    value={ativa.triagem}
                    onChange={(e) => {
                      definirTriagem(ativa.id, e.target.value as TriagemStatus);
                      notificar({ titulo: "Triagem atualizada", tone: "info" });
                    }}
                    className="h-8 rounded-lg border border-line bg-surface px-2 text-[12px] text-fg"
                  >
                    {(Object.keys(TRIAGEM_STATUS) as TriagemStatus[]).map((t) => (
                      <option key={t} value={t}>
                        {TRIAGEM_STATUS[t].label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-surface-2/40 p-4">
                  {ativa.mensagens.map((m) => {
                    const meu = m.autor !== "DEVEDOR";
                    return (
                      <div
                        key={m.id}
                        className={cn("flex", meu ? "justify-end" : "justify-start")}
                      >
                        <div
                          className={cn(
                            "max-w-[78%] rounded-xl px-3.5 py-2.5",
                            meu
                              ? "rounded-tr-sm bg-accent text-accent-fg"
                              : "rounded-tl-sm border border-line bg-surface text-fg",
                          )}
                        >
                          {m.autor === "SISTEMA" && (
                            <p className="mb-1 flex items-center gap-1 text-[10.5px] opacity-70">
                              <Robot size={11} /> Régua automática
                            </p>
                          )}
                          {m.autor === "OPERADOR" && (
                            <p className="mb-1 flex items-center gap-1 text-[10.5px] opacity-70">
                              <UserCircle size={11} /> Operador
                            </p>
                          )}
                          <p className="text-[13px] leading-relaxed whitespace-pre-wrap">
                            {m.texto}
                          </p>
                          <p
                            className={cn(
                              "mt-1 text-right text-[10px]",
                              meu ? "text-accent-fg/60" : "text-fg-subtle",
                            )}
                          >
                            {date(m.enviadaEm, "datetime")}
                            {meu && m.lida && " ✓✓"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={fimRef} />
                </div>

                <div className="flex items-end gap-2 border-t border-line p-3">
                  <textarea
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        enviar();
                      }
                    }}
                    placeholder="Escreva uma mensagem… (Enter envia, Shift+Enter quebra linha)"
                    rows={2}
                    className="max-h-32 min-h-[42px] flex-1 resize-y rounded-lg border border-line bg-surface px-3 py-2.5 text-[13px] text-fg placeholder:text-fg-subtle focus:border-accent focus:outline-none"
                  />
                  <Button size="icon" onClick={enviar} disabled={!texto.trim()} aria-label="Enviar">
                    <PaperPlaneRight size={16} weight="fill" />
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Contexto do devedor */}
          <div className="hidden min-h-0 flex-col overflow-y-auto border-l border-line lg:flex">
            {devedorAtivo ? (
              <div className="p-4">
                <p className="mb-3 text-[11px] font-semibold tracking-wider text-fg-subtle uppercase">
                  Contexto do devedor
                </p>
                <div className="rounded-lg border border-accent bg-accent-soft p-3.5">
                  <p className="text-[11px] font-medium tracking-wide text-accent uppercase">
                    Em aberto
                  </p>
                  <p className="tnum mt-1 text-[17px] font-semibold text-accent">
                    {money(totalAberto)}
                  </p>
                  <p className="mt-0.5 text-[11.5px] text-fg-muted">
                    {titulosDoDevedor.length} título(s)
                  </p>
                </div>

                <div className="mt-4 space-y-2">
                  {titulosDoDevedor.slice(0, 6).map((t) => (
                    <div key={t.id} className="rounded-lg border border-line p-2.5">
                      <p className="tnum text-[12px] font-medium text-fg">Título {t.numero}</p>
                      <p className="tnum mt-0.5 text-[11.5px] text-fg-muted">
                        {money(t.valorAtualizado)} · venc. {date(t.vencimento)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 space-y-2 border-t border-line pt-4">
                  <p className="text-[11px] font-semibold tracking-wider text-fg-subtle uppercase">
                    Respostas rápidas
                  </p>
                  {[
                    "Consigo parcelar em até 6x com entrada de 20%. Posso gerar a proposta?",
                    "Segue o valor atualizado até hoje. Vou te enviar o PIX em seguida.",
                    "Acabei de enviar o contrato para assinatura no seu e-mail.",
                  ].map((r) => (
                    <button
                      key={r}
                      onClick={() => setTexto(r)}
                      className="w-full rounded-lg border border-line px-2.5 py-2 text-left text-[11.5px] leading-snug text-fg-muted transition-colors hover:border-accent hover:bg-accent-soft hover:text-fg"
                    >
                      {r}
                    </button>
                  ))}
                </div>

                {ativa?.triagem === "ENGAJOU" && (
                  <div className="mt-4 flex gap-2 rounded-lg border border-ok/30 bg-ok-soft p-3">
                    <CheckCircle size={15} weight="duotone" className="mt-0.5 shrink-0 text-ok" />
                    <p className="text-[11.5px] leading-relaxed text-fg-muted">
                      Devedor engajado — bom momento para propor acordo com desconto.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center px-4 text-center">
                <p className="flex flex-col items-center gap-2 text-[12.5px] text-fg-subtle">
                  <User size={20} />
                  Selecione uma conversa
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
