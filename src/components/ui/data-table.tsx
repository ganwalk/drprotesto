"use client";

import * as React from "react";
import {
  ArrowsDownUp,
  CaretDown,
  CaretLeft,
  CaretRight,
  CaretUp,
  Columns,
  DownloadSimple,
} from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import { Button, EmptyState } from "./primitives";
import { Checkbox } from "./form";
import { Dropdown, DropdownLabel } from "./overlay";

export interface Coluna<T> {
  id: string;
  cabecalho: string;
  /** Conteúdo renderizado na célula. */
  celula: (linha: T) => React.ReactNode;
  /** Valor bruto para ordenação e exportação. */
  valor?: (linha: T) => string | number;
  largura?: string;
  alinhamento?: "left" | "right" | "center";
  ordenavel?: boolean;
  /** Colunas secundárias começam ocultas e podem ser ativadas pelo usuário. */
  opcional?: boolean;
}

interface DataTableProps<T> {
  dados: T[];
  colunas: Coluna<T>[];
  chave: (linha: T) => string;
  /** Persiste a escolha de colunas, como o sistema original faz por tela. */
  storageKey?: string;
  aoClicarLinha?: (linha: T) => void;
  selecao?: {
    selecionados: string[];
    onChange: (ids: string[]) => void;
  };
  porPagina?: number;
  vazio?: { titulo: string; descricao?: string; icon?: React.ReactNode; acao?: React.ReactNode };
  acoesBarra?: React.ReactNode;
  exportarNome?: string;
  denso?: boolean;
  className?: string;
}

export function DataTable<T>({
  dados,
  colunas,
  chave,
  storageKey,
  aoClicarLinha,
  selecao,
  porPagina = 20,
  vazio,
  acoesBarra,
  exportarNome,
  denso,
  className,
}: DataTableProps<T>) {
  const [ordem, setOrdem] = React.useState<{ id: string; dir: "asc" | "desc" } | null>(null);
  const [pagina, setPagina] = React.useState(0);
  const [ocultas, setOcultas] = React.useState<string[]>(() =>
    colunas.filter((c) => c.opcional).map((c) => c.id),
  );

  // Preferências de coluna por tela, no padrão "drp:table-cols:*".
  React.useEffect(() => {
    if (!storageKey) return;
    try {
      const raw = localStorage.getItem(`drp:table-cols:${storageKey}`);
      if (raw) setOcultas(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  const salvarOcultas = (next: string[]) => {
    setOcultas(next);
    if (!storageKey) return;
    try {
      localStorage.setItem(`drp:table-cols:${storageKey}`, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  React.useEffect(() => setPagina(0), [dados.length]);

  const visiveis = colunas.filter((c) => !ocultas.includes(c.id));

  const ordenados = React.useMemo(() => {
    if (!ordem) return dados;
    const coluna = colunas.find((c) => c.id === ordem.id);
    if (!coluna?.valor) return dados;
    const fator = ordem.dir === "asc" ? 1 : -1;
    return [...dados].sort((a, b) => {
      const va = coluna.valor!(a);
      const vb = coluna.valor!(b);
      if (typeof va === "number" && typeof vb === "number") return (va - vb) * fator;
      return String(va).localeCompare(String(vb), "pt-BR") * fator;
    });
  }, [dados, ordem, colunas]);

  const totalPaginas = Math.max(1, Math.ceil(ordenados.length / porPagina));
  const paginaAtual = Math.min(pagina, totalPaginas - 1);
  const fatia = ordenados.slice(paginaAtual * porPagina, (paginaAtual + 1) * porPagina);

  const idsPagina = selecao ? fatia.map(chave) : [];
  const todosSelecionados =
    selecao && idsPagina.length > 0 && idsPagina.every((id) => selecao.selecionados.includes(id));
  const algunsSelecionados =
    selecao && idsPagina.some((id) => selecao.selecionados.includes(id));

  const alternarOrdem = (id: string) => {
    setOrdem((atual) =>
      atual?.id === id
        ? atual.dir === "asc"
          ? { id, dir: "desc" }
          : null
        : { id, dir: "asc" },
    );
  };

  const exportarCsv = () => {
    const cabecalho = visiveis.map((c) => c.cabecalho).join(";");
    const linhas = ordenados.map((linha) =>
      visiveis
        .map((c) => {
          const v = c.valor ? c.valor(linha) : "";
          return `"${String(v).replace(/"/g, '""')}"`;
        })
        .join(";"),
    );
    const csv = "﻿" + [cabecalho, ...linhas].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${exportarNome ?? "export"}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const alinhamento = (a?: string) =>
    a === "right" ? "text-right" : a === "center" ? "text-center" : "text-left";

  return (
    <div className={cn("overflow-hidden rounded-xl border border-line bg-surface", className)}>
      {(acoesBarra || exportarNome || colunas.some((c) => c.opcional)) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            {selecao && selecao.selecionados.length > 0 && (
              <span className="tnum rounded-md bg-accent-soft px-2 py-1 text-[12.5px] font-medium text-accent">
                {selecao.selecionados.length} selecionado(s)
              </span>
            )}
            {acoesBarra}
          </div>
          <div className="flex items-center gap-2">
            {colunas.some((c) => c.opcional) && (
              <Dropdown
                largura={240}
                trigger={({ toggle }) => (
                  <Button variant="ghost" size="sm" onClick={toggle}>
                    <Columns size={15} /> Colunas
                  </Button>
                )}
              >
                {() => (
                  <div className="max-h-72 overflow-y-auto">
                    <DropdownLabel>Colunas visíveis</DropdownLabel>
                    {colunas.map((c) => (
                      <div key={c.id} className="px-2.5 py-1.5">
                        <Checkbox
                          checked={!ocultas.includes(c.id)}
                          onChange={(v) =>
                            salvarOcultas(
                              v ? ocultas.filter((x) => x !== c.id) : [...ocultas, c.id],
                            )
                          }
                          label={c.cabecalho}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </Dropdown>
            )}
            {exportarNome && (
              <Button variant="ghost" size="sm" onClick={exportarCsv}>
                <DownloadSimple size={15} /> Exportar
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-max border-collapse">
          <thead>
            <tr className="border-b border-line bg-surface-2/60">
              {selecao && (
                <th className="w-10 px-4 py-2.5">
                  <Checkbox
                    checked={Boolean(todosSelecionados)}
                    indeterminate={Boolean(algunsSelecionados)}
                    onChange={(v) =>
                      selecao.onChange(
                        v
                          ? [...new Set([...selecao.selecionados, ...idsPagina])]
                          : selecao.selecionados.filter((id) => !idsPagina.includes(id)),
                      )
                    }
                  />
                </th>
              )}
              {visiveis.map((c) => (
                <th
                  key={c.id}
                  style={{ width: c.largura }}
                  className={cn(
                    "px-4 py-2.5 text-[11.5px] font-semibold tracking-wider text-fg-muted uppercase",
                    alinhamento(c.alinhamento),
                  )}
                >
                  {c.ordenavel && c.valor ? (
                    <button
                      onClick={() => alternarOrdem(c.id)}
                      className={cn(
                        "inline-flex items-center gap-1 transition-colors hover:text-fg",
                        c.alinhamento === "right" && "flex-row-reverse",
                      )}
                    >
                      {c.cabecalho}
                      {ordem?.id === c.id ? (
                        ordem.dir === "asc" ? (
                          <CaretUp size={11} weight="bold" className="text-accent" />
                        ) : (
                          <CaretDown size={11} weight="bold" className="text-accent" />
                        )
                      ) : (
                        <ArrowsDownUp size={11} className="opacity-35" />
                      )}
                    </button>
                  ) : (
                    c.cabecalho
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fatia.map((linha) => {
              const id = chave(linha);
              const selecionado = selecao?.selecionados.includes(id);
              return (
                <tr
                  key={id}
                  onClick={() => aoClicarLinha?.(linha)}
                  className={cn(
                    "border-b border-line/70 transition-colors last:border-0",
                    aoClicarLinha && "cursor-pointer",
                    selecionado ? "bg-accent-soft/60" : "hover:bg-surface-2/70",
                  )}
                >
                  {selecao && (
                    <td className="px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={Boolean(selecionado)}
                        onChange={(v) =>
                          selecao.onChange(
                            v
                              ? [...selecao.selecionados, id]
                              : selecao.selecionados.filter((x) => x !== id),
                          )
                        }
                      />
                    </td>
                  )}
                  {visiveis.map((c) => (
                    <td
                      key={c.id}
                      className={cn(
                        "px-4 text-[13px] text-fg",
                        denso ? "py-2" : "py-3",
                        alinhamento(c.alinhamento),
                      )}
                    >
                      {c.celula(linha)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {fatia.length === 0 && (
        <EmptyState
          icon={vazio?.icon}
          titulo={vazio?.titulo ?? "Nenhum registro encontrado"}
          descricao={vazio?.descricao ?? "Ajuste os filtros para ampliar a busca."}
          acao={vazio?.acao}
        />
      )}

      {ordenados.length > porPagina && (
        <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3">
          <p className="tnum text-[12.5px] text-fg-muted">
            {paginaAtual * porPagina + 1}–
            {Math.min((paginaAtual + 1) * porPagina, ordenados.length)} de {ordenados.length}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              disabled={paginaAtual === 0}
              onClick={() => setPagina(paginaAtual - 1)}
              aria-label="Página anterior"
            >
              <CaretLeft size={15} />
            </Button>
            <span className="tnum px-2 text-[12.5px] text-fg-muted">
              {paginaAtual + 1} / {totalPaginas}
            </span>
            <Button
              variant="ghost"
              size="icon"
              disabled={paginaAtual >= totalPaginas - 1}
              onClick={() => setPagina(paginaAtual + 1)}
              aria-label="Próxima página"
            >
              <CaretRight size={15} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
