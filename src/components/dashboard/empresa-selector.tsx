"use client";

import { useState } from "react";
import Link from "next/link";
import { Buildings, CaretUpDown, Check, Plus, Stack } from "@phosphor-icons/react";
import { Modal } from "@/components/ui/overlay";
import { SearchInput } from "@/components/ui/form";
import { Button } from "@/components/ui/primitives";
import { useApp } from "@/store/app-store";
import { maskDoc, money } from "@/lib/format";
import { cn } from "@/lib/cn";

export function EmpresaSelector() {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const { db, empresaAtivaId, setEmpresaAtiva } = useApp();

  const ativa = db.empresas.find((e) => e.id === empresaAtivaId);
  const termo = busca.trim().toLowerCase();
  const filtradas = db.empresas.filter(
    (e) =>
      !termo ||
      e.nomeFantasia.toLowerCase().includes(termo) ||
      e.razaoSocial.toLowerCase().includes(termo) ||
      e.cnpj.includes(termo.replace(/\D/g, "")),
  );

  const totalPorEmpresa = (empresaId: string) =>
    db.titulos
      .filter((t) => t.empresaId === empresaId && t.status !== "LIQUIDADO")
      .reduce((s, t) => s + t.valorAtualizado, 0);

  const selecionar = (id: string | "TODAS") => {
    setEmpresaAtiva(id);
    setAberto(false);
    setBusca("");
  };

  return (
    <>
      <button
        onClick={() => setAberto(true)}
        className="flex h-9 max-w-[240px] min-w-0 items-center gap-2.5 rounded-lg border border-line bg-surface px-3 transition-colors hover:border-line-strong hover:bg-surface-2"
      >
        <span className="grid size-5 shrink-0 place-items-center rounded bg-accent-soft text-accent">
          {ativa ? <Buildings size={12} weight="fill" /> : <Stack size={12} weight="fill" />}
        </span>
        <span className="min-w-0 flex-1 truncate text-left text-[13px] font-medium text-fg">
          {ativa ? ativa.nomeFantasia : "Todas as empresas"}
        </span>
        <CaretUpDown size={13} className="shrink-0 text-fg-subtle" />
      </button>

      <Modal
        aberto={aberto}
        onClose={() => setAberto(false)}
        titulo="Selecionar empresa"
        descricao="A empresa escolhida define o escopo de todas as telas do sistema."
        largura="md"
        rodape={
          <>
            <Link href="/dashboard/empresas" onClick={() => setAberto(false)}>
              <Button variant="ghost" size="sm">
                Ver todas as empresas
              </Button>
            </Link>
            <Link href="/dashboard/empresas?novo=1" onClick={() => setAberto(false)}>
              <Button size="sm">
                <Plus size={14} weight="bold" /> Nova empresa
              </Button>
            </Link>
          </>
        }
      >
        <SearchInput
          autoFocus
          placeholder="Buscar por nome fantasia, razão social ou CNPJ"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />

        <div className="mt-4 space-y-1">
          <button
            onClick={() => selecionar("TODAS")}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors",
              empresaAtivaId === "TODAS"
                ? "border-accent bg-accent-soft"
                : "border-line hover:bg-surface-2",
            )}
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-navy-900 text-white dark:bg-ice-100 dark:text-navy-900">
              <Stack size={17} weight="duotone" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13.5px] font-semibold text-fg">Todas as empresas</span>
              <span className="block text-[12px] text-fg-muted">
                Consolidado da conta matriz · {db.empresas.length} CNPJs
              </span>
            </span>
            {empresaAtivaId === "TODAS" && (
              <Check size={16} weight="bold" className="shrink-0 text-accent" />
            )}
          </button>

          {filtradas.map((e) => (
            <button
              key={e.id}
              onClick={() => selecionar(e.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors",
                empresaAtivaId === e.id
                  ? "border-accent bg-accent-soft"
                  : "border-line hover:bg-surface-2",
              )}
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent">
                <Buildings size={17} weight="duotone" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] font-semibold text-fg">
                  {e.nomeFantasia}
                </span>
                <span className="tnum block text-[12px] text-fg-muted">
                  {maskDoc(e.cnpj)} · {e.cidade}/{e.uf}
                </span>
              </span>
              <span className="shrink-0 text-right">
                <span className="tnum block text-[12.5px] font-semibold text-fg">
                  {money(totalPorEmpresa(e.id))}
                </span>
                <span className="block text-[11px] text-fg-subtle">em aberto</span>
              </span>
              {empresaAtivaId === e.id && (
                <Check size={16} weight="bold" className="shrink-0 text-accent" />
              )}
            </button>
          ))}
        </div>
      </Modal>
    </>
  );
}
