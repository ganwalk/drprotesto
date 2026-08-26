"use client";

import { useState } from "react";
import {
  ArrowSquareOut,
  ArrowsClockwise,
  Certificate,
  ChatCircleDots,
  Check,
  Copy,
  Eye,
  EyeSlash,
  FloppyDisk,
  Stamp,
  Warning,
  WebhooksLogo,
} from "@phosphor-icons/react";
import { Badge, Button, Card, CardHeader, PageHeader, Segmented } from "@/components/ui/primitives";
import { Field, Input, Select, Switch } from "@/components/ui/form";
import { QrCodePix, useCopiar } from "@/components/dashboard/qrcode-pix";
import { useApp } from "@/store/app-store";
import { date, maskPhone } from "@/lib/format";

const PAYLOAD_SAIDA = `POST /v2/documentos  ·  multipart/form-data

  arquivo:            acordo-ACD-02431.pdf
  acordo_id:          "acr_18"
  devedor_id:         "dev_112"
  empresa_id:         "emp_1"
  signatarios[0][nome]:      "Comercial Vértice Distribuidora LTDA"
  signatarios[0][email]:     "financeiro@vertice.com.br"
  signatarios[0][whatsapp]:  "5511987654321"
  signatarios[0][papel]:     "DEVEDOR"
  signatarios[1][nome]:      "Aurora Colchões"
  signatarios[1][email]:     "juridico@auroracolchoes.com.br"
  signatarios[1][papel]:     "CREDOR"
  callback_url:       "https://api.drprotesto.com.br/integracoes/assinatura/webhook"`;

const PAYLOAD_ENTRADA = `POST /integracoes/assinatura/webhook  ·  application/json
X-Signature: sha256=<hmac do corpo com o segredo>

{
  "evento": "documento.assinado",
  "documento_id": "us_9f2a1c4b",
  "acordo_id": "acr_18",
  "devedor_id": "dev_112",
  "empresa_id": "emp_1",
  "assinado_em": "2026-08-24T14:31:07-03:00",
  "arquivo_assinado_url": "https://cdn.ultrasign.com.br/d/9f2a1c4b.pdf",
  "signatarios": [
    { "email": "financeiro@vertice.com.br", "assinado_em": "2026-08-24T14:12:55-03:00" },
    { "email": "juridico@auroracolchoes.com.br", "assinado_em": "2026-08-24T14:31:07-03:00" }
  ]
}`;

export default function IntegracoesPage() {
  const { db, salvarIntegracoes, notificar } = useApp();
  const [config, setConfig] = useState(db.integracoes);
  const [aba, setAba] = useState<"assinatura" | "cenprot" | "whatsapp">("assinatura");
  const [verSegredo, setVerSegredo] = useState(false);
  const { copiado, copiar } = useCopiar();
  const [copiadoId, setCopiadoId] = useState<string | null>(null);

  const copiarTexto = (texto: string, id: string) => {
    void copiar(texto);
    setCopiadoId(id);
  };

  const salvar = () => {
    salvarIntegracoes(config);
    notificar({ titulo: "Integrações salvas", tone: "ok" });
  };

  return (
    <>
      <PageHeader
        breadcrumb="Conta"
        titulo="Integrações"
        descricao="Assinatura eletrônica, remessa ao CENPROT e sessão de WhatsApp — configuração ponta a ponta."
        acoes={
          <Button onClick={salvar}>
            <FloppyDisk size={15} /> Salvar
          </Button>
        }
      />

      <div className="mb-4">
        <Segmented
          value={aba}
          onChange={setAba}
          options={[
            { value: "assinatura" as const, label: "Assinatura eletrônica" },
            { value: "cenprot" as const, label: "CENPROT" },
            { value: "whatsapp" as const, label: "WhatsApp" },
          ]}
        />
      </div>

      {aba === "assinatura" && (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader
              title="Provedor"
              description="Serviço externo que coleta as assinaturas."
              icon={<Certificate size={15} weight="duotone" />}
              actions={
                <Badge tone={config.assinatura.ativa ? "ok" : "neutral"} dot>
                  {config.assinatura.ativa ? "Ativa" : "Inativa"}
                </Badge>
              }
            />
            <div className="space-y-4 p-5">
              <Field label="Provedor">
                <Select
                  value={config.assinatura.provedor}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      assinatura: { ...config.assinatura, provedor: e.target.value },
                    })
                  }
                >
                  <option value="UltraSign">UltraSign</option>
                  <option value="GenInfra Sign">GenInfra Sign</option>
                  <option value="Clicksign">Clicksign</option>
                  <option value="D4Sign">D4Sign</option>
                </Select>
              </Field>

              <Field label="Endpoint de envio" hint="Para onde o PDF do acordo é transmitido.">
                <Input
                  className="font-mono text-[12px]"
                  value={config.assinatura.urlEnvio}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      assinatura: { ...config.assinatura, urlEnvio: e.target.value },
                    })
                  }
                />
              </Field>

              <Field
                label="Segredo do webhook"
                hint="Usado para validar a assinatura HMAC das chamadas de retorno."
              >
                <span className="relative block">
                  <Input
                    type={verSegredo ? "text" : "password"}
                    className="pr-10 font-mono text-[12px]"
                    value={config.assinatura.secret}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        assinatura: { ...config.assinatura, secret: e.target.value },
                      })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setVerSegredo((v) => !v)}
                    aria-label={verSegredo ? "Ocultar segredo" : "Mostrar segredo"}
                    className="absolute top-1/2 right-2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-fg-subtle hover:bg-surface-2 hover:text-fg"
                  >
                    {verSegredo ? <EyeSlash size={14} /> : <Eye size={14} />}
                  </button>
                </span>
              </Field>

              <Switch
                checked={config.assinatura.ativa}
                onChange={(v) =>
                  setConfig({ ...config, assinatura: { ...config.assinatura, ativa: v } })
                }
                label="Integração ativa"
              />
              <Switch
                checked={config.assinatura.dispararWhatsappPosAssinatura}
                onChange={(v) =>
                  setConfig({
                    ...config,
                    assinatura: { ...config.assinatura, dispararWhatsappPosAssinatura: v },
                  })
                }
                label="Confirmar por WhatsApp"
                descricao="Envia mensagem ao devedor assim que o documento é assinado por todos."
              />
            </div>
          </Card>

          <div className="space-y-4 lg:col-span-2">
            <Card>
              <CardHeader
                title="Webhook de retorno"
                description="Endpoint público que recebe o documento assinado."
                icon={<WebhooksLogo size={15} weight="duotone" />}
              />
              <div className="p-5">
                <div className="flex items-center gap-2 rounded-lg border border-line bg-surface-2/60 px-3.5 py-3">
                  <code className="min-w-0 flex-1 font-mono text-[12px] break-all text-fg">
                    {config.assinatura.webhookEntrada}
                  </code>
                  <button
                    onClick={() => copiarTexto(config.assinatura.webhookEntrada, "url")}
                    className="shrink-0 rounded-md p-1.5 text-fg-subtle transition-colors hover:bg-surface hover:text-accent"
                    aria-label="Copiar URL"
                  >
                    {copiado && copiadoId === "url" ? (
                      <Check size={14} weight="bold" className="text-ok" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>

                <div className="mt-4 flex gap-3 rounded-lg border border-warn/30 bg-warn-soft px-4 py-3.5">
                  <Warning size={17} weight="duotone" className="mt-0.5 shrink-0 text-warn" />
                  <div>
                    <p className="text-[12.5px] font-semibold text-warn">
                      Endpoint único e global
                    </p>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-fg-muted">
                      O roteamento multiempresa é feito pelos identificadores no corpo da
                      requisição (<code className="font-mono">empresa_id</code>,{" "}
                      <code className="font-mono">acordo_id</code>), não pela URL. Por isso a
                      validação do cabeçalho <code className="font-mono">X-Signature</code> contra
                      o segredo é obrigatória — sem ela, qualquer origem poderia forjar a
                      confirmação de uma assinatura.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <CardHeader
                title="Exemplos de payload"
                description="Formato exato do envio e do retorno."
              />
              <div className="space-y-4 p-5">
                <BlocoCodigo
                  titulo="Saída — DR PROTESTO envia o acordo"
                  codigo={PAYLOAD_SAIDA}
                  onCopiar={() => copiarTexto(PAYLOAD_SAIDA, "saida")}
                  copiado={copiado && copiadoId === "saida"}
                />
                <BlocoCodigo
                  titulo="Entrada — assinador confirma a assinatura"
                  codigo={PAYLOAD_ENTRADA}
                  onCopiar={() => copiarTexto(PAYLOAD_ENTRADA, "entrada")}
                  copiado={copiado && copiadoId === "entrada"}
                />
                <p className="text-[12.5px] leading-relaxed text-fg-muted">
                  Ao processar o retorno, o sistema registra o evento de auditoria{" "}
                  <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[11.5px] text-accent">
                    RECEBIMENTO_ASSINATURA_DIGITAL
                  </code>
                  , anexa o PDF assinado ao acordo e o move para{" "}
                  <strong className="font-semibold text-fg">Firmado</strong>.
                </p>
              </div>
            </Card>
          </div>
        </div>
      )}

      {aba === "cenprot" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader
              title="Rede CENPROT"
              description="Confederação Nacional de Protesto — remessa eletrônica de títulos."
              icon={<Stamp size={15} weight="duotone" />}
              actions={
                <Badge tone={config.cenprot.ambiente === "PRODUCAO" ? "danger" : "warn"} dot>
                  {config.cenprot.ambiente === "PRODUCAO" ? "Produção" : "Homologação"}
                </Badge>
              }
            />
            <div className="space-y-4 p-5">
              <Field label="Ambiente">
                <Select
                  value={config.cenprot.ambiente}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      cenprot: {
                        ...config.cenprot,
                        ambiente: e.target.value as "HOMOLOGACAO" | "PRODUCAO",
                      },
                    })
                  }
                >
                  <option value="HOMOLOGACAO">Homologação</option>
                  <option value="PRODUCAO" disabled={!config.cenprot.permitirProducao}>
                    Produção
                  </option>
                </Select>
              </Field>

              <Switch
                checked={config.cenprot.permitirProducao}
                onChange={(v) =>
                  setConfig({
                    ...config,
                    cenprot: {
                      ...config.cenprot,
                      permitirProducao: v,
                      ambiente: v ? config.cenprot.ambiente : "HOMOLOGACAO",
                    },
                  })
                }
                label="CENPROT_ALLOW_PRODUCTION"
                descricao="Trava de backend. Desligada, remessas em produção são recusadas mesmo com o ambiente selecionado."
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <InfoBox
                  rotulo="Última remessa"
                  valor={
                    config.cenprot.ultimaRemessa ? date(config.cenprot.ultimaRemessa, "datetime") : "—"
                  }
                />
                <InfoBox
                  rotulo="Na fila agora"
                  valor={`${db.titulos.filter((t) => t.status === "AGUARDANDO_REMESSA").length} títulos`}
                />
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Estados retornados pelo cartório" />
            <div className="divide-y divide-line">
              {[
                { s: "Aguardando remessa", d: "Título na fila local, ainda não transmitido." },
                { s: "Em cartório", d: "Apontamento protocolado; corre o prazo de intimação." },
                { s: "Protestado", d: "Protesto lavrado — instrumento disponível." },
                { s: "Devolvido", d: "Recusado; o motivo informado pelo cartório é registrado." },
                { s: "Retirado", d: "Baixa solicitada pelo apresentante antes da lavratura." },
              ].map((i) => (
                <div key={i.s} className="px-5 py-3">
                  <p className="text-[13px] font-medium text-fg">{i.s}</p>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-fg-muted">{i.d}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {aba === "whatsapp" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader
              title="Sessão do WhatsApp"
              description="Pareamento por QR Code, no modelo do WhatsApp Web."
              icon={<ChatCircleDots size={15} weight="duotone" />}
              actions={
                <Badge tone={config.whatsapp.conectado ? "ok" : "danger"} dot>
                  {config.whatsapp.conectado ? "Conectado" : "Desconectado"}
                </Badge>
              }
            />
            <div className="p-5">
              {config.whatsapp.conectado ? (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <InfoBox
                      rotulo="Número pareado"
                      valor={config.whatsapp.numero ? maskPhone(config.whatsapp.numero) : "—"}
                    />
                    <InfoBox
                      rotulo="Pareado em"
                      valor={config.whatsapp.pareadoEm ? date(config.whatsapp.pareadoEm) : "—"}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() =>
                      setConfig({
                        ...config,
                        whatsapp: { conectado: false, numero: null, pareadoEm: null },
                      })
                    }
                  >
                    <ArrowsClockwise size={14} /> Desconectar sessão
                  </Button>
                </>
              ) : (
                <div className="flex flex-col items-center py-4 text-center">
                  <QrCodePix
                    payload={`https://drprotesto.com.br/pair/${Date.now().toString(36)}`}
                    tamanho={180}
                  />
                  <p className="mt-4 text-[13.5px] font-medium text-fg">
                    Escaneie para conectar
                  </p>
                  <p className="mt-1 max-w-xs text-[12.5px] leading-relaxed text-fg-muted">
                    No celular, abra o WhatsApp → Aparelhos conectados → Conectar um aparelho.
                  </p>
                  <Button
                    size="sm"
                    className="mt-4"
                    onClick={() =>
                      setConfig({
                        ...config,
                        whatsapp: {
                          conectado: true,
                          numero: db.integracoes.whatsapp.numero,
                          pareadoEm: new Date().toISOString(),
                        },
                      })
                    }
                  >
                    Simular pareamento
                  </Button>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title="Sobre este canal" />
            <div className="space-y-3 p-5 text-[12.5px] leading-relaxed text-fg-muted">
              <p>
                A sessão é pareada por QR Code, no mesmo modelo do WhatsApp Web — não é a API
                oficial de negócios (Cloud API). Isso dispensa aprovação de template, mas a sessão
                cai se o celular ficar muito tempo offline.
              </p>
              <p>
                Um número usado para cobrança em massa está sujeito a bloqueio por denúncia. Mantenha
                a janela de disparo, respeite o descadastramento e prefira mensagens que abram
                caminho para resposta — não apenas cobrança unilateral.
              </p>
              <p className="flex items-center gap-1.5 text-accent">
                <ArrowSquareOut size={13} />
                Para volume alto, avalie migrar para a Cloud API oficial com templates aprovados.
              </p>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}

function BlocoCodigo({
  titulo,
  codigo,
  onCopiar,
  copiado,
}: {
  titulo: string;
  codigo: string;
  onCopiar: () => void;
  copiado: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-line">
      <div className="flex items-center justify-between gap-2 border-b border-line bg-surface-2 px-3.5 py-2">
        <p className="text-[11.5px] font-semibold tracking-wide text-fg-muted uppercase">
          {titulo}
        </p>
        <button
          onClick={onCopiar}
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-accent hover:underline"
        >
          {copiado ? <Check size={12} weight="bold" /> : <Copy size={12} />}
          {copiado ? "Copiado" : "Copiar"}
        </button>
      </div>
      <pre className="overflow-x-auto bg-navy-950 px-4 py-3.5 font-mono text-[11.5px] leading-relaxed text-ice-200">
        {codigo}
      </pre>
    </div>
  );
}

function InfoBox({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="rounded-lg border border-line bg-surface-2/60 p-3.5">
      <p className="text-[11px] font-medium tracking-wide text-fg-subtle uppercase">{rotulo}</p>
      <p className="tnum mt-1 text-[13px] font-medium text-fg">{valor}</p>
    </div>
  );
}
