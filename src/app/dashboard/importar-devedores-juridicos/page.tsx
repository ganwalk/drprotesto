"use client";

import { useRef, useState } from "react";
import {
  ArrowCounterClockwise,
  CheckCircle,
  DownloadSimple,
  FileCsv,
  UploadSimple,
  WarningCircle,
  X,
} from "@phosphor-icons/react";
import { Badge, Button, Card, CardHeader, PageHeader } from "@/components/ui/primitives";
import { DataTable, type Coluna } from "@/components/ui/data-table";
import { Select } from "@/components/ui/form";
import { useApp } from "@/store/app-store";
import { date, maskDoc, money, num } from "@/lib/format";
import { hoje, iso, type EspecieTitulo, type Importacao } from "@/lib/domain";
import { cn } from "@/lib/cn";

/** Layout da planilha padrão — 23 colunas, como no sistema original. */
const COLUNAS_TEMPLATE = [
  "empresa_cnpj",
  "devedor_nome",
  "devedor_documento",
  "devedor_tipo",
  "devedor_email",
  "devedor_telefone",
  "devedor_whatsapp",
  "devedor_cidade",
  "devedor_uf",
  "titulo_numero",
  "titulo_especie",
  "titulo_valor",
  "titulo_emissao",
  "titulo_vencimento",
  "numero_processo_cnj",
  "comarca",
  "vara",
  "advogado_oab",
  "prioridade",
  "valor_causa",
  "indice_financeiro",
  "protesto_automatico",
  "observacao",
] as const;

interface LinhaPreview {
  numero: number;
  dados: Record<string, string>;
  erros: string[];
}

/** Divisor de CSV que respeita aspas e aceita ; ou , como separador. */
function parseCsv(texto: string): string[][] {
  const separador = (texto.split("\n")[0].match(/;/g) ?? []).length >= 3 ? ";" : ",";
  const linhas: string[][] = [];
  let campo = "";
  let linha: string[] = [];
  let dentroDeAspas = false;

  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (dentroDeAspas) {
      if (c === '"') {
        if (texto[i + 1] === '"') {
          campo += '"';
          i++;
        } else dentroDeAspas = false;
      } else campo += c;
      continue;
    }
    if (c === '"') dentroDeAspas = true;
    else if (c === separador) {
      linha.push(campo.trim());
      campo = "";
    } else if (c === "\n") {
      linha.push(campo.trim());
      if (linha.some((v) => v !== "")) linhas.push(linha);
      linha = [];
      campo = "";
    } else if (c !== "\r") campo += c;
  }
  linha.push(campo.trim());
  if (linha.some((v) => v !== "")) linhas.push(linha);
  return linhas;
}

function validarLinha(dados: Record<string, string>, cnpjsValidos: Set<string>): string[] {
  const erros: string[] = [];
  const cnpj = (dados.empresa_cnpj ?? "").replace(/\D/g, "");
  if (!cnpj) erros.push("CNPJ da empresa ausente");
  else if (!cnpjsValidos.has(cnpj)) erros.push("CNPJ não corresponde a nenhuma empresa da conta");

  if (!dados.devedor_nome?.trim()) erros.push("Nome do devedor ausente");

  const doc = (dados.devedor_documento ?? "").replace(/\D/g, "");
  if (doc.length !== 11 && doc.length !== 14) erros.push("CPF/CNPJ do devedor inválido");

  if (!dados.titulo_numero?.trim()) erros.push("Número do título ausente");

  const valor = Number((dados.titulo_valor ?? "").replace(/\./g, "").replace(",", "."));
  if (!valor || valor <= 0) erros.push("Valor do título inválido");

  if (!dados.titulo_vencimento?.trim()) erros.push("Vencimento ausente");

  const cnj = (dados.numero_processo_cnj ?? "").replace(/\D/g, "");
  if (cnj && cnj.length !== 20) erros.push("Número CNJ deve ter 20 dígitos");

  return erros;
}

/** Aceita dd/mm/aaaa e aaaa-mm-dd. */
function parseData(valor: string): Date | null {
  if (!valor) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(valor)) return new Date(valor);
  const m = valor.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) return new Date(`${m[3]}-${m[2]}-${m[1]}T12:00:00`);
  return null;
}

export default function ImportarDevedoresPage() {
  const { db, salvarDevedor, salvarTitulo, registrarImportacao, desfazerImportacao, notificar } =
    useApp();
  const inputRef = useRef<HTMLInputElement>(null);

  const [arrastando, setArrastando] = useState(false);
  const [arquivo, setArquivo] = useState<string | null>(null);
  const [preview, setPreview] = useState<LinhaPreview[] | null>(null);
  const [empresaPadrao, setEmpresaPadrao] = useState(db.empresas[0].id);
  const [processando, setProcessando] = useState(false);

  const cnpjsValidos = new Set(db.empresas.map((e) => e.cnpj));

  const lerArquivo = async (file: File) => {
    const texto = await file.text();
    const linhas = parseCsv(texto);
    if (linhas.length < 2) {
      notificar({
        titulo: "Arquivo vazio",
        descricao: "A planilha precisa ter cabeçalho e ao menos uma linha.",
        tone: "danger",
      });
      return;
    }

    const cabecalho = linhas[0].map((c) => c.toLowerCase().replace(/\s+/g, "_"));
    const registros: LinhaPreview[] = linhas.slice(1).map((linha, i) => {
      const dados: Record<string, string> = {};
      cabecalho.forEach((coluna, k) => {
        dados[coluna] = linha[k] ?? "";
      });
      return { numero: i + 2, dados, erros: validarLinha(dados, cnpjsValidos) };
    });

    setArquivo(file.name);
    setPreview(registros);
  };

  const baixarTemplate = () => {
    const exemplo = db.empresas[0];
    const linhaExemplo = [
      exemplo.cnpj,
      "Comercial Exemplo Ltda",
      "12345678000199",
      "PJ",
      "financeiro@exemplo.com.br",
      "11987654321",
      "11987654321",
      "São Paulo",
      "SP",
      "10001/01",
      "DMI",
      "1500,00",
      "01/07/2026",
      "31/07/2026",
      "",
      "",
      "",
      "",
      "MEDIA",
      "",
      "IGPM",
      "SIM",
      "Importação de exemplo",
    ];
    const csv =
      "﻿" + [COLUNAS_TEMPLATE.join(";"), linhaExemplo.join(";")].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "template-importacao-devedores.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const confirmar = () => {
    if (!preview) return;
    setProcessando(true);

    const validas = preview.filter((l) => l.erros.length === 0);
    for (const linha of validas) {
      const { dados } = linha;
      const cnpj = dados.empresa_cnpj.replace(/\D/g, "");
      const empresa = db.empresas.find((e) => e.cnpj === cnpj) ?? db.empresas[0];
      const documento = dados.devedor_documento.replace(/\D/g, "");

      const existente = db.devedores.find(
        (d) => d.documento === documento && d.empresaId === empresa.id,
      );
      const devedor =
        existente ??
        salvarDevedor({
          nome: dados.devedor_nome.trim(),
          documento,
          tipo: documento.length === 14 ? "PJ" : "PF",
          email: dados.devedor_email || null,
          telefone: dados.devedor_telefone || null,
          whatsapp: dados.devedor_whatsapp || dados.devedor_telefone || null,
          cidade: dados.devedor_cidade || "",
          uf: (dados.devedor_uf || "").toUpperCase().slice(0, 2),
          empresaId: empresa.id,
        });

      const valor = Number(dados.titulo_valor.replace(/\./g, "").replace(",", "."));
      const vencimento = parseData(dados.titulo_vencimento) ?? hoje();
      const emissao = parseData(dados.titulo_emissao) ?? vencimento;

      salvarTitulo({
        empresaId: empresa.id,
        devedorId: devedor.id,
        numero: dados.titulo_numero.trim(),
        especie: ((dados.titulo_especie || "DMI").toUpperCase() as EspecieTitulo) ?? "DMI",
        valorOriginal: valor,
        valorAtualizado: valor,
        emissao: iso(emissao),
        vencimento: iso(vencimento),
        status: vencimento < hoje() ? "PRE_PROTESTO" : "NO_PRAZO",
      });
    }

    registrarImportacao({
      arquivo: arquivo ?? "importacao.csv",
      linhas: preview.length,
      sucesso: validas.length,
      erros: preview.length - validas.length,
      importadoEm: iso(new Date()),
      autor: db.usuarioAtual.nome,
      desfeita: false,
      empresaId: empresaPadrao,
    });

    notificar({
      titulo: `${validas.length} registro(s) importado(s)`,
      descricao:
        preview.length - validas.length > 0
          ? `${preview.length - validas.length} linha(s) ignorada(s) por erro de validação.`
          : "Todos os registros foram processados sem erro.",
      tone: "ok",
    });

    setPreview(null);
    setArquivo(null);
    setProcessando(false);
  };

  const colunasHistorico: Coluna<Importacao>[] = [
    {
      id: "arquivo",
      cabecalho: "Arquivo",
      valor: (i) => i.arquivo,
      celula: (i) => (
        <span className="flex items-center gap-2 font-medium text-fg">
          <FileCsv size={15} className="text-fg-subtle" />
          {i.arquivo}
        </span>
      ),
    },
    {
      id: "data",
      cabecalho: "Importado em",
      ordenavel: true,
      valor: (i) => new Date(i.importadoEm).getTime(),
      celula: (i) => <span className="tnum text-fg-muted">{date(i.importadoEm, "datetime")}</span>,
    },
    {
      id: "autor",
      cabecalho: "Autor",
      valor: (i) => i.autor,
      celula: (i) => <span className="text-fg-muted">{i.autor}</span>,
    },
    {
      id: "linhas",
      cabecalho: "Linhas",
      alinhamento: "right",
      valor: (i) => i.linhas,
      celula: (i) => <span className="tnum">{num(i.linhas)}</span>,
    },
    {
      id: "sucesso",
      cabecalho: "Sucesso",
      alinhamento: "right",
      valor: (i) => i.sucesso,
      celula: (i) => <span className="tnum text-ok">{num(i.sucesso)}</span>,
    },
    {
      id: "erros",
      cabecalho: "Erros",
      alinhamento: "right",
      valor: (i) => i.erros,
      celula: (i) => (
        <span className={cn("tnum", i.erros > 0 ? "text-danger" : "text-fg-subtle")}>
          {num(i.erros)}
        </span>
      ),
    },
    {
      id: "situacao",
      cabecalho: "Situação",
      valor: (i) => (i.desfeita ? "desfeita" : "ativa"),
      celula: (i) =>
        i.desfeita ? (
          <Badge tone="neutral">Desfeita</Badge>
        ) : (
          <Badge tone="ok" dot>
            Ativa
          </Badge>
        ),
    },
    {
      id: "acoes",
      cabecalho: "",
      celula: (i) =>
        i.desfeita ? null : (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              desfazerImportacao(i.id);
              notificar({
                titulo: "Importação desfeita",
                descricao: `${i.arquivo} · ${i.sucesso} registros revertidos.`,
                tone: "warn",
              });
            }}
          >
            <ArrowCounterClockwise size={13} /> Desfazer
          </Button>
        ),
    },
  ];

  const validas = preview?.filter((l) => l.erros.length === 0).length ?? 0;

  return (
    <>
      <PageHeader
        breadcrumb="Credor · Cadastro"
        titulo="Importar devedores em massa"
        descricao="Planilha de 23 colunas em CSV. Um número de processo no padrão CNJ cria e vincula automaticamente o processo jurídico."
        acoes={
          <Button variant="outline" onClick={baixarTemplate}>
            <DownloadSimple size={15} /> Baixar template
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Enviar planilha"
            description="Arraste o arquivo ou selecione do computador. O processamento acontece no seu navegador."
            icon={<UploadSimple size={15} weight="duotone" />}
          />
          <div className="p-5">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setArrastando(true);
              }}
              onDragLeave={() => setArrastando(false)}
              onDrop={(e) => {
                e.preventDefault();
                setArrastando(false);
                const file = e.dataTransfer.files[0];
                if (file) void lerArquivo(file);
              }}
              onClick={() => inputRef.current?.click()}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors",
                arrastando
                  ? "border-accent bg-accent-soft"
                  : "border-line-strong hover:border-accent hover:bg-surface-2/60",
              )}
            >
              <span className="grid size-12 place-items-center rounded-xl bg-accent-soft text-accent">
                <UploadSimple size={22} weight="duotone" />
              </span>
              <p className="mt-4 text-[14px] font-medium text-fg">
                Arraste o arquivo .csv aqui
              </p>
              <p className="mt-1 text-[12.5px] text-fg-muted">
                ou clique para selecionar · até 5.000 linhas por lote
              </p>
              <input
                ref={inputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void lerArquivo(file);
                  e.target.value = "";
                }}
              />
            </div>

            {preview && (
              <div className="mt-5">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-surface-2/60 px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <FileCsv size={18} className="text-accent" />
                    <div>
                      <p className="text-[13px] font-medium text-fg">{arquivo}</p>
                      <p className="tnum text-[12px] text-fg-muted">
                        {num(preview.length)} linhas · {num(validas)} válidas ·{" "}
                        {num(preview.length - validas)} com erro
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setPreview(null);
                        setArquivo(null);
                      }}
                    >
                      <X size={13} weight="bold" /> Descartar
                    </Button>
                    <Button
                      size="sm"
                      loading={processando}
                      disabled={validas === 0}
                      onClick={confirmar}
                    >
                      <CheckCircle size={14} /> Importar {num(validas)} registro(s)
                    </Button>
                  </div>
                </div>

                <div className="mt-3 max-h-80 overflow-auto rounded-lg border border-line">
                  <table className="w-full min-w-max">
                    <thead className="sticky top-0 bg-surface-2">
                      <tr>
                        <th className="px-3 py-2 text-left text-[11px] font-semibold tracking-wider text-fg-muted uppercase">
                          Linha
                        </th>
                        <th className="px-3 py-2 text-left text-[11px] font-semibold tracking-wider text-fg-muted uppercase">
                          Devedor
                        </th>
                        <th className="px-3 py-2 text-left text-[11px] font-semibold tracking-wider text-fg-muted uppercase">
                          Documento
                        </th>
                        <th className="px-3 py-2 text-left text-[11px] font-semibold tracking-wider text-fg-muted uppercase">
                          Título
                        </th>
                        <th className="px-3 py-2 text-right text-[11px] font-semibold tracking-wider text-fg-muted uppercase">
                          Valor
                        </th>
                        <th className="px-3 py-2 text-left text-[11px] font-semibold tracking-wider text-fg-muted uppercase">
                          Validação
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.slice(0, 60).map((l) => (
                        <tr key={l.numero} className="border-t border-line">
                          <td className="tnum px-3 py-2 text-[12.5px] text-fg-subtle">{l.numero}</td>
                          <td className="px-3 py-2 text-[12.5px] text-fg">
                            {l.dados.devedor_nome || "—"}
                          </td>
                          <td className="tnum px-3 py-2 text-[12.5px] text-fg-muted">
                            {l.dados.devedor_documento
                              ? maskDoc(l.dados.devedor_documento)
                              : "—"}
                          </td>
                          <td className="tnum px-3 py-2 text-[12.5px] text-fg-muted">
                            {l.dados.titulo_numero || "—"}
                          </td>
                          <td className="tnum px-3 py-2 text-right text-[12.5px] text-fg">
                            {l.dados.titulo_valor
                              ? money(
                                  Number(
                                    l.dados.titulo_valor.replace(/\./g, "").replace(",", "."),
                                  ) || 0,
                                )
                              : "—"}
                          </td>
                          <td className="px-3 py-2">
                            {l.erros.length === 0 ? (
                              <Badge tone="ok" dot>
                                Válida
                              </Badge>
                            ) : (
                              <span
                                className="text-[12px] text-danger"
                                title={l.erros.join(" · ")}
                              >
                                {l.erros[0]}
                                {l.erros.length > 1 && ` (+${l.erros.length - 1})`}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {preview.length > 60 && (
                  <p className="mt-2 text-[12px] text-fg-subtle">
                    Exibindo as 60 primeiras linhas de {num(preview.length)}.
                  </p>
                )}
              </div>
            )}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="font-display text-[15px] font-semibold text-fg">Empresa de destino</h3>
            <p className="mt-0.5 text-[12.5px] text-fg-muted">
              Usada quando a linha não trouxer o CNPJ do credor.
            </p>
            <Select
              className="mt-3"
              value={empresaPadrao}
              onChange={(e) => setEmpresaPadrao(e.target.value)}
            >
              {db.empresas.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nomeFantasia}
                </option>
              ))}
            </Select>
          </Card>

          <Card className="p-5">
            <h3 className="font-display text-[15px] font-semibold text-fg">Colunas esperadas</h3>
            <p className="mt-0.5 text-[12.5px] text-fg-muted">
              {COLUNAS_TEMPLATE.length} colunas, na ordem do template.
            </p>
            <div className="mt-3 flex flex-wrap gap-1">
              {COLUNAS_TEMPLATE.map((c) => (
                <code
                  key={c}
                  className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[10.5px] text-fg-muted"
                >
                  {c}
                </code>
              ))}
            </div>
          </Card>

          <Card className="border-warn/25 bg-warn-soft/40 p-5">
            <p className="flex items-center gap-2 text-[13px] font-semibold text-warn">
              <WarningCircle size={15} weight="duotone" />
              Conectores em desenvolvimento
            </p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-fg-muted">
              As importações diretas de CSW e Condomob estão previstas para as próximas versões.
              Por ora, exporte a carteira desses sistemas em CSV e use o template acima.
            </p>
          </Card>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="font-display mb-3 text-[16px] font-semibold text-fg">
          Histórico de importações
        </h2>
        <DataTable
          dados={db.importacoes}
          colunas={colunasHistorico}
          chave={(i) => i.id}
          storageKey="importacoes"
          exportarNome="importacoes"
          porPagina={10}
          vazio={{ icon: <FileCsv size={22} />, titulo: "Nenhuma importação registrada" }}
        />
      </div>
    </>
  );
}
