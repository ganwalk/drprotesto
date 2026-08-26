"use client";

import { useState } from "react";
import {
  Buildings,
  Info,
  MagnifyingGlass,
  Stamp,
  User,
  WarningCircle,
} from "@phosphor-icons/react";
import { Badge, Button, Card, CardHeader, PageHeader } from "@/components/ui/primitives";
import { StatusPill } from "@/components/ui/status-pill";
import { Field, Input } from "@/components/ui/form";
import { useApp } from "@/store/app-store";
import { consultarDocumento } from "@/lib/consulta";
import { TITULO_STATUS } from "@/lib/status";
import { date, maskDoc, maskPhone, money, num } from "@/lib/format";
import type { ConsultaCadastral } from "@/lib/domain";

export default function ConsultaPage() {
  const { db, notificar } = useApp();
  const [documento, setDocumento] = useState("");
  const [resultado, setResultado] = useState<ConsultaCadastral | null>(null);
  const [carteira, setCarteira] = useState<ReturnType<typeof buscarNaCarteira> | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  function buscarNaCarteira(digitos: string) {
    const devedor = db.devedores.find((d) => d.documento === digitos);
    if (!devedor) return null;
    const titulos = db.titulos.filter((t) => t.devedorId === devedor.id);
    return { devedor, titulos };
  }

  const consultar = async () => {
    const digitos = documento.replace(/\D/g, "");
    if (digitos.length !== 11 && digitos.length !== 14) {
      setErro("Informe um CPF (11 dígitos) ou CNPJ (14 dígitos).");
      setResultado(null);
      return;
    }
    setErro(null);
    setCarregando(true);

    // Simula a latência de um birô externo para que o estado de carga apareça.
    await new Promise((r) => setTimeout(r, 450));

    const dados = consultarDocumento(digitos);
    const naCarteira = buscarNaCarteira(digitos);

    // Quando o documento já existe na carteira, o cadastro real prevalece.
    if (dados && naCarteira) {
      dados.nome = naCarteira.devedor.nome;
      dados.cidade = naCarteira.devedor.cidade;
      dados.uf = naCarteira.devedor.uf;
      dados.email = naCarteira.devedor.email;
      dados.telefone = naCarteira.devedor.telefone;
      dados.tipo = naCarteira.devedor.tipo;
    }

    setResultado(dados);
    setCarteira(naCarteira);
    setCarregando(false);
    if (!dados) notificar({ titulo: "Documento não localizado", tone: "warn" });
  };

  const totalProtestos = resultado?.protestos.reduce((s, p) => s + p.quantidade, 0) ?? 0;
  const valorProtestos = resultado?.protestos.reduce((s, p) => s + p.valorTotal, 0) ?? 0;

  return (
    <>
      <PageHeader
        breadcrumb="Consultas"
        titulo="Consultar dados básicos"
        descricao="Cadastro do documento e apontamentos de protesto em cartórios de todo o país."
      />

      <Card className="mb-4">
        <div className="flex flex-wrap items-end gap-3 p-5">
          <Field label="CPF ou CNPJ" className="min-w-[280px] flex-1" obrigatorio>
            <Input
              className="tnum"
              placeholder="000.000.000-00 ou 00.000.000/0000-00"
              value={documento}
              onChange={(e) => setDocumento(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void consultar()}
            />
          </Field>
          <Button size="lg" loading={carregando} onClick={() => void consultar()}>
            <MagnifyingGlass size={16} weight="bold" /> Consultar
          </Button>
        </div>
        {erro && (
          <p className="border-t border-line bg-danger-soft px-5 py-3 text-[13px] text-danger">
            {erro}
          </p>
        )}
      </Card>

      {!resultado && !carregando && (
        <Card className="p-8">
          <div className="flex flex-col items-center text-center">
            <span className="grid size-12 place-items-center rounded-xl bg-surface-2 text-fg-subtle">
              <MagnifyingGlass size={22} />
            </span>
            <p className="font-display mt-4 text-[15px] font-semibold text-fg">
              Informe um documento para consultar
            </p>
            <p className="mt-1.5 max-w-md text-[13px] leading-relaxed text-fg-muted">
              A consulta retorna dados cadastrais, sócios (para pessoa jurídica) e o resumo de
              protestos por cartório. Se o documento já estiver na carteira, os títulos vinculados
              também aparecem.
            </p>
          </div>
        </Card>
      )}

      {resultado && (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader
              title="Dados cadastrais"
              description={`Consultado em ${date(new Date(), "datetime")}`}
              icon={
                resultado.tipo === "PJ" ? (
                  <Buildings size={15} weight="duotone" />
                ) : (
                  <User size={15} weight="duotone" />
                )
              }
              actions={
                <Badge tone={resultado.situacao.startsWith("Ativa") || resultado.situacao === "Regular" ? "ok" : "warn"} dot>
                  {resultado.situacao}
                </Badge>
              }
            />
            <div className="p-5">
              <p className="font-display text-[18px] font-semibold text-fg">{resultado.nome}</p>
              <p className="tnum mt-1 text-[13px] text-fg-muted">
                {maskDoc(resultado.documento)} ·{" "}
                {resultado.tipo === "PJ" ? "Pessoa jurídica" : "Pessoa física"}
              </p>

              <div className="mt-5 grid gap-x-6 gap-y-3.5 sm:grid-cols-2">
                {resultado.tipo === "PJ" ? (
                  <>
                    <Campo rotulo="Abertura" valor={resultado.dataAbertura ? date(resultado.dataAbertura) : "—"} />
                    <Campo
                      rotulo="Capital social"
                      valor={resultado.capitalSocial ? money(resultado.capitalSocial) : "—"}
                    />
                    <Campo
                      rotulo="Natureza jurídica"
                      valor={resultado.naturezaJuridica ?? "—"}
                      largo
                    />
                    <Campo rotulo="CNAE principal" valor={resultado.cnaePrincipal ?? "—"} largo />
                  </>
                ) : (
                  <Campo
                    rotulo="Nascimento"
                    valor={resultado.nascimento ? date(resultado.nascimento) : "—"}
                  />
                )}
                <Campo rotulo="Endereço" valor={resultado.endereco} largo />
                <Campo rotulo="Município" valor={`${resultado.cidade}/${resultado.uf}`} />
                <Campo
                  rotulo="Telefone"
                  valor={resultado.telefone ? maskPhone(resultado.telefone) : "—"}
                />
                <Campo rotulo="E-mail" valor={resultado.email ?? "—"} largo />
              </div>

              {resultado.socios && resultado.socios.length > 0 && (
                <div className="mt-6 border-t border-line pt-5">
                  <p className="mb-3 text-[11.5px] font-semibold tracking-wider text-fg-subtle uppercase">
                    Quadro societário
                  </p>
                  <div className="space-y-2">
                    {resultado.socios.map((s, i) => (
                      <div
                        key={i}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line px-3.5 py-2.5"
                      >
                        <span className="text-[13px] font-medium text-fg">{s.nome}</span>
                        <span className="text-[12px] text-fg-muted">{s.qualificacao}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader
                title="Apontamentos de protesto"
                description={`${num(totalProtestos)} protesto(s) em ${resultado.protestos.length} cartório(s)`}
                icon={<Stamp size={15} weight="duotone" />}
              />
              <div className="p-5">
                {resultado.protestos.length === 0 ? (
                  <div className="flex flex-col items-center py-6 text-center">
                    <span className="grid size-10 place-items-center rounded-xl bg-ok-soft text-ok">
                      <Stamp size={18} weight="duotone" />
                    </span>
                    <p className="mt-3 text-[13.5px] font-medium text-fg">Nada consta</p>
                    <p className="mt-1 text-[12.5px] text-fg-muted">
                      Nenhum protesto localizado para este documento.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 rounded-lg border border-danger/25 bg-danger-soft p-3.5">
                      <p className="text-[11.5px] font-semibold tracking-wide text-danger uppercase">
                        Valor total protestado
                      </p>
                      <p className="tnum mt-1 text-[18px] font-semibold text-danger">
                        {money(valorProtestos)}
                      </p>
                    </div>
                    <div className="space-y-2">
                      {resultado.protestos.map((p, i) => (
                        <div key={i} className="rounded-lg border border-line p-3">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-[12.5px] font-medium text-fg">{p.cartorio}</p>
                            <Badge tone="neutral">{p.uf}</Badge>
                          </div>
                          <p className="tnum mt-1.5 text-[12px] text-fg-muted">
                            {p.quantidade} título(s) · {money(p.valorTotal)}
                          </p>
                          <p className="mt-0.5 text-[11.5px] text-fg-subtle">
                            Mais antigo: {date(p.dataMaisAntiga)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </Card>

            {carteira && (
              <Card>
                <CardHeader
                  title="Na sua carteira"
                  description={`${carteira.titulos.length} título(s) deste devedor`}
                  icon={<WarningCircle size={15} weight="duotone" />}
                />
                <div className="divide-y divide-line">
                  {carteira.titulos.slice(0, 6).map((t) => (
                    <div key={t.id} className="flex items-center gap-3 px-5 py-2.5">
                      <span className="tnum min-w-0 flex-1 truncate text-[12.5px] text-fg">
                        {t.numero}
                      </span>
                      <StatusPill meta={TITULO_STATUS[t.status]} dot={false} />
                      <span className="tnum text-[12.5px] font-semibold text-fg">
                        {money(t.valorAtualizado)}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <Card className="border-accent/25 bg-accent-soft/40 p-4">
              <p className="flex items-center gap-2 text-[12.5px] font-semibold text-accent">
                <Info size={14} weight="duotone" />
                Sobre esta consulta
              </p>
              <p className="mt-1.5 text-[12px] leading-relaxed text-fg-muted">
                Na demonstração os dados cadastrais são gerados localmente a partir do documento —
                o mesmo número devolve sempre o mesmo resultado. Em produção, esta tela consome o
                birô de crédito contratado e a base nacional do CENPROT.
              </p>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}

function Campo({
  rotulo,
  valor,
  largo,
}: {
  rotulo: string;
  valor: string;
  largo?: boolean;
}) {
  return (
    <div className={largo ? "sm:col-span-2" : ""}>
      <p className="text-[11px] font-medium tracking-wide text-fg-subtle uppercase">{rotulo}</p>
      <p className="tnum mt-0.5 text-[13px] text-fg">{valor}</p>
    </div>
  );
}
