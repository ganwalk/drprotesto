"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChatCircleDots,
  Clock,
  Envelope,
  Eye,
  FloppyDisk,
  PencilSimple,
  Prohibit,
} from "@phosphor-icons/react";
import { Badge, Button, Card, CardHeader, PageHeader, Segmented } from "@/components/ui/primitives";
import { Modal } from "@/components/ui/overlay";
import { Field, Input, Select, Switch, Textarea } from "@/components/ui/form";
import { useApp } from "@/store/app-store";
import { DIAS_SEMANA } from "@/lib/status";
import { date } from "@/lib/format";
import {
  FASE_LABELS,
  VARIAVEIS_TEMPLATE,
  type Canal,
  type PassoRegua,
  type Regua,
  type Template,
} from "@/lib/domain";
import { cn } from "@/lib/cn";

export default function ReguaPage() {
  const { db, salvarRegua, salvarTemplate, notificar } = useApp();
  const [reguaId, setReguaId] = useState(db.reguas[0]?.id ?? "");
  const [rascunho, setRascunho] = useState<Regua | null>(null);
  const [editandoTemplate, setEditandoTemplate] = useState<Template | null>(null);
  const [previewFase, setPreviewFase] = useState<PassoRegua | null>(null);

  const reguaOriginal = db.reguas.find((r) => r.id === reguaId);

  useEffect(() => {
    if (reguaOriginal) setRascunho(reguaOriginal);
  }, [reguaOriginal]);

  const alterado = useMemo(
    () => JSON.stringify(rascunho) !== JSON.stringify(reguaOriginal),
    [rascunho, reguaOriginal],
  );

  if (!rascunho || !reguaOriginal) return null;

  const empresa = db.empresas.find((e) => e.id === rascunho.empresaId);

  const atualizarPasso = (passoId: string, patch: Partial<PassoRegua>) =>
    setRascunho({
      ...rascunho,
      passos: rascunho.passos.map((p) => (p.id === passoId ? { ...p, ...patch } : p)),
    });

  const alternarCanal = (passo: PassoRegua, canal: Canal) => {
    const canais = passo.canais.includes(canal)
      ? passo.canais.filter((c) => c !== canal)
      : [...passo.canais, canal];

    // Ao ativar um canal, engata o template padrão daquela fase.
    const patch: Partial<PassoRegua> = { canais };
    if (canal === "EMAIL") {
      patch.templateEmailId = canais.includes("EMAIL")
        ? (db.templates.find((t) => t.canal === "EMAIL" && t.fase === passo.fase)?.id ?? null)
        : null;
    } else if (canal === "WHATSAPP") {
      patch.templateWhatsappId = canais.includes("WHATSAPP")
        ? (db.templates.find((t) => t.canal === "WHATSAPP" && t.fase === passo.fase)?.id ?? null)
        : null;
    }
    atualizarPasso(passo.id, patch);
  };

  const salvar = () => {
    salvarRegua(rascunho);
    notificar({
      titulo: "Régua salva",
      descricao: `${rascunho.nome} · alterações aplicadas aos próximos disparos.`,
      tone: "ok",
    });
  };

  const passosAtivos = rascunho.passos.filter((p) => p.ativo).length;

  return (
    <>
      <PageHeader
        breadcrumb="Credor · Automação"
        titulo="Régua de cobrança"
        descricao="Linha do tempo de comunicação por empresa: o que sai em cada fase, por qual canal e em que dia."
        acoes={
          <>
            {alterado && (
              <Badge tone="warn" dot>
                Alterações não salvas
              </Badge>
            )}
            <Button onClick={salvar} disabled={!alterado}>
              <FloppyDisk size={15} /> Salvar régua
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Select
          className="max-w-sm"
          value={reguaId}
          onChange={(e) => setReguaId(e.target.value)}
        >
          {db.reguas.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nome}
            </option>
          ))}
        </Select>
        <Switch
          checked={rascunho.ativa}
          onChange={(v) => setRascunho({ ...rascunho, ativa: v })}
          label={rascunho.ativa ? "Régua ativa" : "Régua pausada"}
        />
        <span className="ml-auto text-[12.5px] text-fg-subtle">
          Atualizada em {date(rascunho.atualizadaEm, "datetime")}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Linha do tempo */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader
              title="Fases da régua"
              description={`${passosAtivos} de ${rascunho.passos.length} fases ativas · empresa ${empresa?.nomeFantasia ?? "—"}`}
              icon={<Envelope size={15} weight="duotone" />}
            />
            <div className="divide-y divide-line">
              {rascunho.passos.map((passo, i) => {
                const templateEmail = db.templates.find((t) => t.id === passo.templateEmailId);
                const templateWhats = db.templates.find((t) => t.id === passo.templateWhatsappId);
                return (
                  <div
                    key={passo.id}
                    className={cn("p-5 transition-opacity", !passo.ativo && "opacity-55")}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="tnum mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-surface-2 font-mono text-[12px] font-semibold text-fg-muted">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <p className="font-display text-[14.5px] font-semibold text-fg">
                            {FASE_LABELS[passo.fase]}
                          </p>
                          <p className="mt-0.5 text-[12.5px] text-fg-muted">
                            Dispara{" "}
                            {passo.offsetDias === 0
                              ? "no dia do vencimento"
                              : passo.offsetDias < 0
                                ? `${Math.abs(passo.offsetDias)} dias antes do vencimento`
                                : `${passo.offsetDias} dias após o vencimento`}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={passo.ativo}
                        onChange={(v) => atualizarPasso(passo.id, { ativo: v })}
                      />
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-[140px_1fr]">
                      <Field label="Dia do disparo">
                        <Input
                          type="number"
                          className="tnum"
                          value={passo.offsetDias}
                          onChange={(e) =>
                            atualizarPasso(passo.id, { offsetDias: Number(e.target.value) })
                          }
                        />
                      </Field>

                      <div>
                        <span className="mb-1.5 block text-[12.5px] font-medium text-fg">
                          Canais e templates
                        </span>
                        <div className="space-y-2">
                          <LinhaCanal
                            icone={<Envelope size={14} />}
                            rotulo="E-mail"
                            ativo={passo.canais.includes("EMAIL")}
                            onToggle={() => alternarCanal(passo, "EMAIL")}
                            template={templateEmail}
                            onEditar={() => templateEmail && setEditandoTemplate(templateEmail)}
                          />
                          <LinhaCanal
                            icone={<ChatCircleDots size={14} />}
                            rotulo="WhatsApp"
                            ativo={passo.canais.includes("WHATSAPP")}
                            onToggle={() => alternarCanal(passo, "WHATSAPP")}
                            template={templateWhats}
                            onEditar={() => templateWhats && setEditandoTemplate(templateWhats)}
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setPreviewFase(passo)}
                      className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-accent hover:underline"
                    >
                      <Eye size={13} /> Pré-visualizar mensagem
                    </button>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Janela de disparo */}
        <div className="space-y-4">
          <Card>
            <CardHeader
              title="Janela de disparo"
              description="Nenhuma mensagem sai fora deste intervalo."
              icon={<Clock size={15} weight="duotone" />}
            />
            <div className="space-y-5 p-5">
              <div>
                <p className="mb-2 text-[12.5px] font-medium text-fg">Dias da semana</p>
                <div className="flex gap-1.5">
                  {DIAS_SEMANA.map((d) => {
                    const ativo = rascunho.diasSemana.includes(d.valor);
                    return (
                      <button
                        key={d.valor}
                        title={d.label}
                        onClick={() =>
                          setRascunho({
                            ...rascunho,
                            diasSemana: ativo
                              ? rascunho.diasSemana.filter((x) => x !== d.valor)
                              : [...rascunho.diasSemana, d.valor].sort(),
                          })
                        }
                        className={cn(
                          "size-9 rounded-lg text-[13px] font-semibold transition-colors",
                          ativo
                            ? "bg-accent text-accent-fg"
                            : "bg-surface-2 text-fg-subtle hover:bg-surface-3",
                        )}
                      >
                        {d.curto}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Início">
                  <Input
                    type="time"
                    className="tnum"
                    value={rascunho.horaInicio}
                    onChange={(e) => setRascunho({ ...rascunho, horaInicio: e.target.value })}
                  />
                </Field>
                <Field label="Fim">
                  <Input
                    type="time"
                    className="tnum"
                    value={rascunho.horaFim}
                    onChange={(e) => setRascunho({ ...rascunho, horaFim: e.target.value })}
                  />
                </Field>
              </div>

              <div className="space-y-3 border-t border-line pt-4">
                <Switch
                  checked={rascunho.bloquearDomingos}
                  onChange={(v) => setRascunho({ ...rascunho, bloquearDomingos: v })}
                  label="Bloquear domingos"
                  descricao="Recomendado para evitar contato em dia de descanso."
                />
                <Switch
                  checked={rascunho.bloquearFeriados}
                  onChange={(v) => setRascunho({ ...rascunho, bloquearFeriados: v })}
                  label="Bloquear feriados nacionais"
                  descricao="Disparos previstos são adiados para o próximo dia útil."
                />
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <p className="flex items-center gap-2 text-[13px] font-semibold text-fg">
              <Prohibit size={15} weight="duotone" className="text-warn" />
              Exclusões automáticas
            </p>
            <ul className="mt-3 space-y-2 text-[12.5px] leading-relaxed text-fg-muted">
              <li>· Devedores marcados como bloqueados na carteira</li>
              <li>· Devedores sem contato válido no canal da fase</li>
              <li>· Títulos com acordo em cumprimento ou já liquidados</li>
              <li>· Títulos em processo judicial com acordo homologado</li>
            </ul>
          </Card>

          <Card className="p-5">
            <p className="text-[13px] font-semibold text-fg">Variáveis disponíveis</p>
            <div className="mt-3 space-y-1.5">
              {VARIAVEIS_TEMPLATE.map((v) => (
                <div key={v.chave} className="flex items-baseline gap-2">
                  <code className="shrink-0 rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[11px] text-accent">
                    {v.chave}
                  </code>
                  <span className="text-[12px] text-fg-muted">{v.descricao}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <EditorTemplate
        template={editandoTemplate}
        onClose={() => setEditandoTemplate(null)}
        onSalvar={(t) => {
          salvarTemplate(t);
          notificar({ titulo: "Template salvo", descricao: t.nome, tone: "ok" });
          setEditandoTemplate(null);
        }}
      />

      <PreviewMensagem passo={previewFase} onClose={() => setPreviewFase(null)} />
    </>
  );
}

function LinhaCanal({
  icone,
  rotulo,
  ativo,
  onToggle,
  template,
  onEditar,
}: {
  icone: React.ReactNode;
  rotulo: string;
  ativo: boolean;
  onToggle: () => void;
  template?: Template;
  onEditar: () => void;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors",
        ativo ? "border-accent/40 bg-accent-soft/50" : "border-line",
      )}
    >
      <span className={cn("shrink-0", ativo ? "text-accent" : "text-fg-subtle")}>{icone}</span>
      <span className="w-20 shrink-0 text-[13px] font-medium text-fg">{rotulo}</span>
      <span className="min-w-0 flex-1 truncate text-[12px] text-fg-muted">
        {ativo ? (template?.nome ?? "Sem template") : "Desativado"}
      </span>
      {ativo && template && (
        <button
          onClick={onEditar}
          className="shrink-0 rounded-md p-1 text-fg-subtle transition-colors hover:bg-surface-2 hover:text-accent"
          aria-label={`Editar template de ${rotulo}`}
        >
          <PencilSimple size={13} />
        </button>
      )}
      <Switch checked={ativo} onChange={onToggle} />
    </div>
  );
}

function EditorTemplate({
  template,
  onClose,
  onSalvar,
}: {
  template: Template | null;
  onClose: () => void;
  onSalvar: (t: Template) => void;
}) {
  const [rascunho, setRascunho] = useState<Template | null>(template);
  useEffect(() => setRascunho(template), [template]);

  if (!template || !rascunho) return null;

  const inserirVariavel = (chave: string) =>
    setRascunho({ ...rascunho, corpo: `${rascunho.corpo}${chave}` });

  return (
    <Modal
      aberto
      onClose={onClose}
      titulo={`Editar template — ${FASE_LABELS[rascunho.fase]}`}
      descricao={rascunho.canal === "EMAIL" ? "Mensagem por e-mail" : "Mensagem por WhatsApp"}
      largura="lg"
      rodape={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button size="sm" onClick={() => onSalvar(rascunho)}>
            Salvar template
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Nome interno">
          <Input
            value={rascunho.nome}
            onChange={(e) => setRascunho({ ...rascunho, nome: e.target.value })}
          />
        </Field>

        {rascunho.canal === "EMAIL" && (
          <Field label="Assunto">
            <Input
              value={rascunho.assunto ?? ""}
              onChange={(e) => setRascunho({ ...rascunho, assunto: e.target.value })}
            />
          </Field>
        )}

        <Field
          label="Corpo da mensagem"
          hint="Use as variáveis abaixo para personalizar cada disparo."
        >
          <Textarea
            className="min-h-56 font-mono text-[12.5px]"
            value={rascunho.corpo}
            onChange={(e) => setRascunho({ ...rascunho, corpo: e.target.value })}
          />
        </Field>

        <div className="flex flex-wrap gap-1.5">
          {VARIAVEIS_TEMPLATE.map((v) => (
            <button
              key={v.chave}
              onClick={() => inserirVariavel(v.chave)}
              title={v.descricao}
              className="rounded-md bg-surface-2 px-2 py-1 font-mono text-[11px] text-accent transition-colors hover:bg-accent-soft"
            >
              {v.chave}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}

/** Substitui as variáveis por um exemplo realista para a pré-visualização. */
const EXEMPLO: Record<string, string> = {
  "{{nome}}": "Comercial Vértice Distribuidora LTDA",
  "{{primeiro_nome}}": "Comercial",
  "{{documento}}": "12.345.678/0001-99",
  "{{numero_titulo}}": "24801/03",
  "{{valor_cobranca}}": "R$ 8.412,55",
  "{{vencimento}}": "12/06/2026",
  "{{dias_atraso}}": "75",
  "{{fase}}": "Pré-protesto",
  "{{empresa}}": "Aurora Colchões",
  "{{link_pagamento}}": "https://drprotesto.com.br/p/9f2a1c",
};

function PreviewMensagem({
  passo,
  onClose,
}: {
  passo: PassoRegua | null;
  onClose: () => void;
}) {
  const { db } = useApp();
  const [canal, setCanal] = useState<Canal>("EMAIL");

  if (!passo) return null;

  const templateId = canal === "EMAIL" ? passo.templateEmailId : passo.templateWhatsappId;
  const template = db.templates.find((t) => t.id === templateId);

  const render = (texto: string) =>
    Object.entries(EXEMPLO).reduce(
      (acc, [chave, valor]) => acc.split(chave).join(valor),
      texto,
    );

  return (
    <Modal
      aberto
      onClose={onClose}
      titulo={`Pré-visualização — ${FASE_LABELS[passo.fase]}`}
      descricao="Como o devedor recebe a mensagem, com dados de exemplo."
      largura="md"
    >
      <Segmented
        value={canal}
        onChange={setCanal}
        options={[
          { value: "EMAIL" as Canal, label: "E-mail" },
          { value: "WHATSAPP" as Canal, label: "WhatsApp" },
        ]}
      />

      <div className="mt-4">
        {!template ? (
          <p className="rounded-lg bg-surface-2 px-4 py-8 text-center text-[13px] text-fg-muted">
            Este canal não está ativo nesta fase.
          </p>
        ) : canal === "EMAIL" ? (
          <div className="overflow-hidden rounded-xl border border-line">
            <div className="border-b border-line bg-surface-2 px-4 py-3">
              <p className="text-[11.5px] text-fg-subtle">Assunto</p>
              <p className="mt-0.5 text-[13.5px] font-semibold text-fg">
                {render(template.assunto ?? "")}
              </p>
            </div>
            <div className="p-5">
              <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap text-fg">
                {render(template.corpo)}
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-[#0b141a] p-5">
            <div className="ml-auto max-w-[85%] rounded-xl rounded-tr-sm bg-[#005c4b] px-3.5 py-2.5">
              <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap text-white">
                {render(template.corpo)}
              </p>
              <p className="mt-1 text-right text-[10.5px] text-white/50">14:32 ✓✓</p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
