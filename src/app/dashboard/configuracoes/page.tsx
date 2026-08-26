"use client";

import { useState } from "react";
import {
  Bell,
  ChatCircleDots,
  Envelope,
  FloppyDisk,
  GearSix,
  Stamp,
  Clock,
  Percent,
} from "@phosphor-icons/react";
import { Badge, Button, Card, CardHeader, PageHeader, Segmented } from "@/components/ui/primitives";
import { Field, Input, Select, Switch } from "@/components/ui/form";
import { useApp } from "@/store/app-store";
import { DIAS_SEMANA } from "@/lib/status";
import { maskDoc } from "@/lib/format";
import { INDICES, type Canal, type IndiceFinanceiro } from "@/lib/domain";
import { cn } from "@/lib/cn";

type Aba = "mensagens" | "protesto" | "financeiro" | "alertas";

export default function ConfiguracoesPage() {
  const { db, salvarConfigMensagens, salvarIntegracoes, salvarEmpresa, notificar } = useApp();
  const [aba, setAba] = useState<Aba>("mensagens");
  const [config, setConfig] = useState(db.configMensagens);
  const [integracoes, setIntegracoes] = useState(db.integracoes);
  const [empresaId, setEmpresaId] = useState(db.empresas[0].id);

  const empresa = db.empresas.find((e) => e.id === empresaId)!;
  const [paramsEmpresa, setParamsEmpresa] = useState({
    indiceFinanceiro: empresa.indiceFinanceiro,
    multaPercentual: empresa.multaPercentual,
    jurosMensalPercentual: empresa.jurosMensalPercentual,
    protestoAutomatico: empresa.protestoAutomatico,
    diasParaProtesto: empresa.diasParaProtesto,
  });

  const trocarEmpresa = (id: string) => {
    const e = db.empresas.find((x) => x.id === id)!;
    setEmpresaId(id);
    setParamsEmpresa({
      indiceFinanceiro: e.indiceFinanceiro,
      multaPercentual: e.multaPercentual,
      jurosMensalPercentual: e.jurosMensalPercentual,
      protestoAutomatico: e.protestoAutomatico,
      diasParaProtesto: e.diasParaProtesto,
    });
  };

  const salvarTudo = () => {
    salvarConfigMensagens(config);
    salvarIntegracoes(integracoes);
    salvarEmpresa({ id: empresaId, ...paramsEmpresa });
    notificar({
      titulo: "Configurações salvas",
      descricao: "As alterações valem para os próximos disparos e remessas.",
      tone: "ok",
    });
  };

  const alternarCanal = (canal: Canal) =>
    setConfig({
      ...config,
      canais: config.canais.includes(canal)
        ? config.canais.filter((c) => c !== canal)
        : [...config.canais, canal],
    });

  return (
    <>
      <PageHeader
        breadcrumb="Conta"
        titulo="Configurações"
        descricao="Central de mensagens, ambiente de protesto, parâmetros financeiros e alertas da operação."
        acoes={
          <Button onClick={salvarTudo}>
            <FloppyDisk size={15} /> Salvar configurações
          </Button>
        }
      />

      <div className="mb-4">
        <Segmented
          value={aba}
          onChange={setAba}
          options={[
            { value: "mensagens", label: "Central de mensagens" },
            { value: "protesto", label: "Protesto e CENPROT" },
            { value: "financeiro", label: "Parâmetros financeiros" },
            { value: "alertas", label: "Alertas" },
          ]}
        />
      </div>

      {aba === "mensagens" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader
              title="Canais habilitados"
              description="Valem como padrão para todas as réguas da conta."
              icon={<ChatCircleDots size={15} weight="duotone" />}
            />
            <div className="space-y-4 p-5">
              <Switch
                checked={config.canais.includes("EMAIL")}
                onChange={() => alternarCanal("EMAIL")}
                label="E-mail"
                descricao="Disparo transacional com o template da fase."
              />
              <Switch
                checked={config.canais.includes("WHATSAPP")}
                onChange={() => alternarCanal("WHATSAPP")}
                label="WhatsApp"
                descricao={
                  integracoes.whatsapp.conectado
                    ? "Sessão pareada e ativa."
                    : "Requer pareamento por QR Code em Integrações."
                }
              />
              <Switch
                checked={config.canais.includes("SMS")}
                onChange={() => alternarCanal("SMS")}
                label="SMS"
                descricao="Canal de contingência — cobrado por mensagem enviada."
              />
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Janela de disparo padrão"
              description="Nenhuma mensagem sai fora deste intervalo."
              icon={<Clock size={15} weight="duotone" />}
            />
            <div className="space-y-5 p-5">
              <div>
                <p className="mb-2 text-[12.5px] font-medium text-fg">Dias permitidos</p>
                <div className="flex flex-wrap gap-1.5">
                  {DIAS_SEMANA.map((d) => {
                    const ativo = config.diasSemana.includes(d.valor);
                    return (
                      <button
                        key={d.valor}
                        title={d.label}
                        onClick={() =>
                          setConfig({
                            ...config,
                            diasSemana: ativo
                              ? config.diasSemana.filter((x) => x !== d.valor)
                              : [...config.diasSemana, d.valor].sort(),
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
                    value={config.horaInicio}
                    onChange={(e) => setConfig({ ...config, horaInicio: e.target.value })}
                  />
                </Field>
                <Field label="Fim">
                  <Input
                    type="time"
                    className="tnum"
                    value={config.horaFim}
                    onChange={(e) => setConfig({ ...config, horaFim: e.target.value })}
                  />
                </Field>
              </div>
              <p className="rounded-lg bg-surface-2 px-3.5 py-3 text-[12.5px] leading-relaxed text-fg-muted">
                Domingos e feriados nacionais são bloqueados automaticamente em todas as réguas.
                Disparos previstos para esses dias são reagendados para o próximo dia útil dentro
                da janela.
              </p>
            </div>
          </Card>
        </div>
      )}

      {aba === "protesto" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader
              title="Ambiente CENPROT"
              description="Controle de qual ambiente recebe as remessas de protesto."
              icon={<Stamp size={15} weight="duotone" />}
            />
            <div className="space-y-5 p-5">
              <Field label="Ambiente ativo">
                <Select
                  value={integracoes.cenprot.ambiente}
                  onChange={(e) =>
                    setIntegracoes({
                      ...integracoes,
                      cenprot: {
                        ...integracoes.cenprot,
                        ambiente: e.target.value as "HOMOLOGACAO" | "PRODUCAO",
                      },
                    })
                  }
                >
                  <option value="HOMOLOGACAO">Homologação — sem efeito legal</option>
                  <option value="PRODUCAO" disabled={!integracoes.cenprot.permitirProducao}>
                    Produção — protesto real em cartório
                  </option>
                </Select>
              </Field>

              {integracoes.cenprot.ambiente === "PRODUCAO" && (
                <p className="rounded-lg border border-danger/30 bg-danger-soft px-3.5 py-3 text-[12.5px] leading-relaxed text-danger">
                  <strong className="font-semibold">Atenção:</strong> neste ambiente as remessas são
                  transmitidas aos tabelionatos e produzem efeitos legais. A retirada de um
                  apontamento indevido gera custos e pode exigir ação judicial.
                </p>
              )}

              <Field label="CNPJ apresentante">
                <Input
                  className="tnum"
                  value={maskDoc(integracoes.cenprot.cnpjApresentante)}
                  onChange={(e) =>
                    setIntegracoes({
                      ...integracoes,
                      cenprot: {
                        ...integracoes.cenprot,
                        cnpjApresentante: e.target.value.replace(/\D/g, ""),
                      },
                    })
                  }
                />
              </Field>

              <Switch
                checked={integracoes.cenprot.permitirProducao}
                onChange={(v) =>
                  setIntegracoes({
                    ...integracoes,
                    cenprot: {
                      ...integracoes.cenprot,
                      permitirProducao: v,
                      ambiente: v ? integracoes.cenprot.ambiente : "HOMOLOGACAO",
                    },
                  })
                }
                label="Liberar envio em produção"
                descricao="Trava de segurança da conta. Desligada, o sistema só opera em homologação."
              />
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Protesto automático por empresa"
              description="Quando ligado, títulos elegíveis entram na fila sem aprovação manual."
            />
            <div className="space-y-5 p-5">
              <Field label="Empresa">
                <Select value={empresaId} onChange={(e) => trocarEmpresa(e.target.value)}>
                  {db.empresas.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nomeFantasia}
                    </option>
                  ))}
                </Select>
              </Field>

              <Switch
                checked={paramsEmpresa.protestoAutomatico}
                onChange={(v) =>
                  setParamsEmpresa({ ...paramsEmpresa, protestoAutomatico: v })
                }
                label="Protesto automático"
                descricao="Aplica-se apenas à empresa selecionada acima."
              />

              {paramsEmpresa.protestoAutomatico && (
                <Field
                  label="Dias de atraso até a remessa"
                  hint="Contados a partir do vencimento do título."
                >
                  <Input
                    type="number"
                    className="tnum max-w-[160px]"
                    value={paramsEmpresa.diasParaProtesto}
                    onChange={(e) =>
                      setParamsEmpresa({
                        ...paramsEmpresa,
                        diasParaProtesto: Number(e.target.value),
                      })
                    }
                  />
                </Field>
              )}

              <div className="rounded-lg bg-surface-2 px-3.5 py-3">
                <p className="text-[12px] font-semibold text-fg">Nunca entram na fila</p>
                <ul className="mt-1.5 space-y-1 text-[12px] leading-relaxed text-fg-muted">
                  <li>· Devedores bloqueados na carteira</li>
                  <li>· Títulos com acordo firmado ou em cumprimento</li>
                  <li>· Títulos já protestados ou liquidados</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      )}

      {aba === "financeiro" && (
        <Card className="max-w-2xl">
          <CardHeader
            title="Parâmetros de correção"
            description="Definem o valor atualizado exibido na carteira e nos avisos."
            icon={<Percent size={15} weight="duotone" />}
            actions={<Badge tone="accent">{db.empresas.find((e) => e.id === empresaId)?.nomeFantasia}</Badge>}
          />
          <div className="space-y-4 p-5">
            <Field label="Empresa">
              <Select value={empresaId} onChange={(e) => trocarEmpresa(e.target.value)}>
                {db.empresas.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nomeFantasia}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Índice financeiro padrão" hint="Usado na atualização automática dos títulos.">
              <Select
                value={paramsEmpresa.indiceFinanceiro}
                onChange={(e) =>
                  setParamsEmpresa({
                    ...paramsEmpresa,
                    indiceFinanceiro: e.target.value as IndiceFinanceiro,
                  })
                }
              >
                {(Object.keys(INDICES) as IndiceFinanceiro[]).map((i) => (
                  <option key={i} value={i}>
                    {INDICES[i].label} — {INDICES[i].fonte}
                  </option>
                ))}
              </Select>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Multa por atraso (%)">
                <Input
                  type="number"
                  step="0.5"
                  className="tnum"
                  value={paramsEmpresa.multaPercentual}
                  onChange={(e) =>
                    setParamsEmpresa({ ...paramsEmpresa, multaPercentual: Number(e.target.value) })
                  }
                />
              </Field>
              <Field label="Juros ao mês (%)">
                <Input
                  type="number"
                  step="0.1"
                  className="tnum"
                  value={paramsEmpresa.jurosMensalPercentual}
                  onChange={(e) =>
                    setParamsEmpresa({
                      ...paramsEmpresa,
                      jurosMensalPercentual: Number(e.target.value),
                    })
                  }
                />
              </Field>
            </div>

            <p className="rounded-lg bg-surface-2 px-3.5 py-3 text-[12.5px] leading-relaxed text-fg-muted">
              Para contratos de consumo, o Código de Defesa do Consumidor limita a multa moratória a
              2%. Os 10% costumam aparecer apenas em contratos entre empresas com previsão expressa.
            </p>
          </div>
        </Card>
      )}

      {aba === "alertas" && (
        <Card className="max-w-2xl">
          <CardHeader
            title="Alertas da operação"
            description="Notificações internas para o time de crédito."
            icon={<Bell size={15} weight="duotone" />}
          />
          <div className="space-y-5 p-5">
            <Switch
              checked={config.alertaNovosDevedores}
              onChange={(v) => setConfig({ ...config, alertaNovosDevedores: v })}
              label="Alertar sobre novos devedores"
              descricao="Envia um resumo diário dos devedores incluídos na carteira."
            />
            <Switch
              checked={config.protestoAutomatico}
              onChange={(v) => setConfig({ ...config, protestoAutomatico: v })}
              label="Avisar antes de cada remessa"
              descricao="Um e-mail lista os títulos que serão enviados na próxima janela."
            />
            <Switch
              checked
              onChange={() => undefined}
              label="Relatório semanal de recuperação"
              descricao="Consolidado de valores recuperados e taxa de conversão da régua."
            />
            <Switch
              checked
              onChange={() => undefined}
              label="Alerta de falha de entrega acima de 10%"
              descricao="Dispara quando a taxa de falha do dia ultrapassa o limite."
            />

            <div className="rounded-lg border border-line p-4">
              <p className="flex items-center gap-2 text-[13px] font-semibold text-fg">
                <Envelope size={15} weight="duotone" className="text-accent" />
                Destinatários dos alertas
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {db.usuarios
                  .filter((u) => ["MASTER", "SUPERVISOR"].includes(u.perfil))
                  .map((u) => (
                    <Badge key={u.id} tone="neutral">
                      {u.email}
                    </Badge>
                  ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="mt-6 flex items-center gap-2 text-[12.5px] text-fg-subtle">
        <GearSix size={14} />
        As alterações passam a valer no próximo ciclo de disparo e na próxima remessa ao CENPROT.
      </div>
    </>
  );
}
