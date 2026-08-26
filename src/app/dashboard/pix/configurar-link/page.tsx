"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowClockwise,
  Check,
  ChatCircleDots,
  Copy,
  Envelope,
  QrCode,
  DownloadSimple,
} from "@phosphor-icons/react";
import { Badge, Button, Card, CardHeader, PageHeader } from "@/components/ui/primitives";
import { Field, Input, MoneyInput, Select, Textarea } from "@/components/ui/form";
import { QrCodePix, useCopiar } from "@/components/dashboard/qrcode-pix";
import { Carregando } from "@/components/ui/loading";
import { useApp } from "@/store/app-store";
import { date, maskDoc, money } from "@/lib/format";
import { addDays, hoje, type CobrancaPix } from "@/lib/domain";

function Conteudo() {
  const params = useSearchParams();
  const { db, empresaAtivaId, criarCobranca, notificar } = useApp();
  const { copiado, copiar } = useCopiar();

  const [empresaId, setEmpresaId] = useState(
    empresaAtivaId === "TODAS" ? db.empresas[0].id : empresaAtivaId,
  );
  const [devedorId, setDevedorId] = useState("");
  const [tituloId, setTituloId] = useState(params.get("titulo") ?? "");
  const [valor, setValor] = useState(0);
  const [descricao, setDescricao] = useState("");
  const [chaveId, setChaveId] = useState("");
  const [validade, setValidade] = useState(3);
  const [gerada, setGerada] = useState<CobrancaPix | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const chaves = useMemo(
    () => db.chavesPix.filter((c) => c.empresaId === empresaId),
    [db.chavesPix, empresaId],
  );
  const chaveSelecionada =
    chaves.find((c) => c.id === chaveId) ?? chaves.find((c) => c.principal) ?? chaves[0];

  const devedores = useMemo(
    () => db.devedores.filter((d) => d.empresaId === empresaId),
    [db.devedores, empresaId],
  );

  const titulosDoDevedor = useMemo(
    () => db.titulos.filter((t) => t.devedorId === devedorId && t.status !== "LIQUIDADO"),
    [db.titulos, devedorId],
  );

  // Selecionar um título preenche valor e descrição automaticamente.
  const escolherTitulo = (id: string) => {
    setTituloId(id);
    const titulo = db.titulos.find((t) => t.id === id);
    if (titulo) {
      setValor(titulo.valorAtualizado);
      const empresa = db.empresas.find((e) => e.id === titulo.empresaId);
      setDescricao(`Título ${titulo.numero} — ${empresa?.nomeFantasia ?? ""}`);
    }
  };

  const gerar = () => {
    if (!chaveSelecionada) return setErro("Cadastre uma chave PIX para esta empresa.");
    if (valor <= 0) return setErro("Informe um valor maior que zero.");
    if (!descricao.trim()) return setErro("Informe a descrição da cobrança.");

    const cobranca = criarCobranca({
      empresaId,
      devedorId: devedorId || null,
      tituloId: tituloId || null,
      descricao: descricao.trim(),
      valor,
      chave: chaveSelecionada.valor,
      validadeDias: validade,
    });

    setGerada(cobranca);
    setErro(null);
    notificar({
      titulo: "Cobrança gerada",
      descricao: `${cobranca.codigo} · ${money(cobranca.valor)}`,
      tone: "ok",
    });
  };

  const devedor = db.devedores.find((d) => d.id === devedorId);
  const mensagemWhats = gerada
    ? `Olá! Segue o PIX para quitar ${gerada.descricao}. Valor: ${money(gerada.valor)}. Código copia e cola:\n\n${gerada.copiaECola}`
    : "";

  const baixarQr = () => {
    const canvas = document.querySelector("canvas");
    if (!canvas || !gerada) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `qrcode-${gerada.codigo}.png`;
    a.click();
  };

  return (
    <>
      <PageHeader
        breadcrumb="Financeiro · PIX"
        titulo="Gerar cobrança"
        descricao="Crie um QR Code dinâmico ou um código copia-e-cola vinculado a um título da carteira."
      />

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader
            title="Dados da cobrança"
            description="Vincule a um título para preencher valor e descrição automaticamente."
            icon={<QrCode size={15} weight="duotone" />}
          />
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <Field label="Empresa recebedora" obrigatorio className="sm:col-span-2">
              <Select
                value={empresaId}
                onChange={(e) => {
                  setEmpresaId(e.target.value);
                  setDevedorId("");
                  setTituloId("");
                  setChaveId("");
                }}
              >
                {db.empresas.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nomeFantasia} — {maskDoc(e.cnpj)}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Chave PIX de recebimento" obrigatorio className="sm:col-span-2">
              <Select value={chaveSelecionada?.id ?? ""} onChange={(e) => setChaveId(e.target.value)}>
                {chaves.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.tipo} — {c.tipo === "CNPJ" ? maskDoc(c.valor) : c.valor}
                    {c.principal ? " (principal)" : ""}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Devedor" hint="Opcional — permite envio direto por WhatsApp">
              <Select
                value={devedorId}
                onChange={(e) => {
                  setDevedorId(e.target.value);
                  setTituloId("");
                }}
              >
                <option value="">Cobrança avulsa</option>
                {devedores.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nome}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Título vinculado" hint={`${titulosDoDevedor.length} em aberto`}>
              <Select
                value={tituloId}
                onChange={(e) => escolherTitulo(e.target.value)}
                disabled={!devedorId}
              >
                <option value="">Sem vínculo</option>
                {titulosDoDevedor.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.numero} — {money(t.valorAtualizado)}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Valor" obrigatorio>
              <MoneyInput value={valor} onChange={setValor} />
            </Field>

            <Field label="Validade do link">
              <Select value={validade} onChange={(e) => setValidade(Number(e.target.value))}>
                {[1, 3, 7, 15, 30].map((d) => (
                  <option key={d} value={d}>
                    {d} {d === 1 ? "dia" : "dias"}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Descrição" obrigatorio className="sm:col-span-2">
              <Textarea
                className="min-h-20"
                placeholder="Ex.: Título 24801/03 — Aurora Colchões"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </Field>

            {erro && (
              <p className="rounded-lg bg-danger-soft px-3 py-2.5 text-[13px] text-danger sm:col-span-2">
                {erro}
              </p>
            )}

            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <Button onClick={gerar}>
                <QrCode size={15} /> Gerar cobrança
              </Button>
              {gerada && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setGerada(null);
                    setValor(0);
                    setDescricao("");
                    setTituloId("");
                  }}
                >
                  <ArrowClockwise size={15} /> Nova cobrança
                </Button>
              )}
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Cobrança gerada" description="QR Code e código copia-e-cola." />
          <div className="p-5">
            {!gerada ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="grid size-12 place-items-center rounded-xl bg-surface-2 text-fg-subtle">
                  <QrCode size={22} />
                </span>
                <p className="mt-4 text-[13.5px] font-medium text-fg">
                  Nenhuma cobrança gerada
                </p>
                <p className="mt-1 max-w-[220px] text-[12.5px] leading-relaxed text-fg-muted">
                  Preencha os dados ao lado para criar o QR Code.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <QrCodePix payload={gerada.copiaECola} tamanho={208} />

                <p className="tnum font-display mt-4 text-[22px] font-semibold text-fg">
                  {money(gerada.valor)}
                </p>
                <p className="mt-1 text-center text-[12.5px] text-fg-muted">{gerada.descricao}</p>

                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                  <Badge tone="warn" dot>
                    Expira em {date(gerada.expiraEm)}
                  </Badge>
                  <Badge tone="neutral">{gerada.codigo}</Badge>
                </div>

                <div className="mt-5 w-full rounded-lg border border-line bg-surface-2/60 p-3">
                  <p className="mb-1.5 text-[11px] font-semibold tracking-wide text-fg-subtle uppercase">
                    Copia e cola
                  </p>
                  <p className="max-h-16 overflow-y-auto font-mono text-[10.5px] leading-relaxed break-all text-fg-muted">
                    {gerada.copiaECola}
                  </p>
                </div>

                <div className="mt-3 grid w-full grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void copiar(gerada.copiaECola)}
                  >
                    {copiado ? (
                      <>
                        <Check size={14} weight="bold" /> Copiado
                      </>
                    ) : (
                      <>
                        <Copy size={14} /> Copiar código
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="sm" onClick={baixarQr}>
                    <DownloadSimple size={14} /> Baixar QR
                  </Button>
                </div>

                {devedor?.whatsapp && (
                  <a
                    className="mt-2 w-full"
                    href={`https://wa.me/55${devedor.whatsapp}?text=${encodeURIComponent(mensagemWhats)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="sm" className="w-full">
                      <ChatCircleDots size={14} /> Enviar por WhatsApp
                    </Button>
                  </a>
                )}
                {devedor?.email && (
                  <a
                    className="mt-2 w-full"
                    href={`mailto:${devedor.email}?subject=${encodeURIComponent(`Cobrança ${gerada.codigo}`)}&body=${encodeURIComponent(mensagemWhats)}`}
                  >
                    <Button variant="ghost" size="sm" className="w-full">
                      <Envelope size={14} /> Enviar por e-mail
                    </Button>
                  </a>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card className="mt-4 p-5">
        <p className="text-[13px] font-semibold text-fg">Conciliação automática</p>
        <p className="mt-1.5 max-w-3xl text-[12.5px] leading-relaxed text-fg-muted">
          Quando a cobrança vinculada a um título é paga, o crédito entra no extrato, o título é
          liquidado e — havendo protesto lavrado — o acordo correspondente é movido para{" "}
          <strong className="font-semibold text-fg">Protesto baixado</strong>, habilitando a emissão
          da carta de anuência. Cobranças avulsas apenas creditam o extrato.
        </p>
        <p className="mt-3 text-[12px] text-fg-subtle">
          Validade padrão de {validade} dias · a partir de {date(hoje())} até{" "}
          {date(addDays(hoje(), validade))}.
        </p>
      </Card>
    </>
  );
}

export default function ConfigurarLinkPage() {
  return (
    <Suspense fallback={<Carregando />}>
      <Conteudo />
    </Suspense>
  );
}
