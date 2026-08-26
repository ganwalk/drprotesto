"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Buildings,
  Gavel,
  Handshake,
  MagnifyingGlass,
  Stamp,
} from "@phosphor-icons/react";
import { Modal } from "@/components/ui/overlay";
import { SearchInput } from "@/components/ui/form";
import { EmptyState } from "@/components/ui/primitives";
import { useApp } from "@/store/app-store";
import { maskCNJ, maskDoc, money } from "@/lib/format";

interface Resultado {
  id: string;
  grupo: string;
  titulo: string;
  sub: string;
  href: string;
  icon: React.ReactNode;
}

export function BuscaGlobal({ aberto, onClose }: { aberto: boolean; onClose: () => void }) {
  const { db } = useApp();
  const router = useRouter();
  const [termo, setTermo] = useState("");

  useEffect(() => {
    if (!aberto) setTermo("");
  }, [aberto]);

  const resultados = useMemo<Resultado[]>(() => {
    const t = termo.trim().toLowerCase();
    if (t.length < 2) return [];
    const digitos = t.replace(/\D/g, "");
    const out: Resultado[] = [];

    for (const d of db.devedores) {
      if (
        d.nome.toLowerCase().includes(t) ||
        (digitos.length > 2 && d.documento.includes(digitos))
      ) {
        out.push({
          id: `dev-${d.id}`,
          grupo: "Devedores",
          titulo: d.nome,
          sub: `${maskDoc(d.documento)} · ${d.cidade}/${d.uf}`,
          href: `/dashboard/carteira-devedores?devedor=${d.id}`,
          icon: <Buildings size={15} weight="duotone" />,
        });
      }
      if (out.length >= 24) break;
    }

    for (const titulo of db.titulos) {
      if (titulo.numero.toLowerCase().includes(t) || titulo.protocoloCartorio?.includes(t)) {
        const devedor = db.devedores.find((d) => d.id === titulo.devedorId);
        out.push({
          id: `tit-${titulo.id}`,
          grupo: "Títulos",
          titulo: `Título ${titulo.numero}`,
          sub: `${devedor?.nome ?? "—"} · ${money(titulo.valorAtualizado)}`,
          href: `/dashboard/controle-titulo?titulo=${titulo.id}`,
          icon: <Stamp size={15} weight="duotone" />,
        });
      }
      if (out.length >= 34) break;
    }

    for (const a of db.acordos) {
      if (a.codigo.toLowerCase().includes(t)) {
        const devedor = db.devedores.find((d) => d.id === a.devedorId);
        out.push({
          id: `acr-${a.id}`,
          grupo: "Acordos",
          titulo: a.codigo,
          sub: `${devedor?.nome ?? "—"} · ${money(a.valorAcordo)}`,
          href: `/dashboard/gestao-acordos?acordo=${a.id}`,
          icon: <Handshake size={15} weight="duotone" />,
        });
      }
    }

    for (const p of db.processos) {
      if (p.numeroCNJ.includes(digitos) && digitos.length > 4) {
        const devedor = db.devedores.find((d) => d.id === p.devedorId);
        out.push({
          id: `prc-${p.id}`,
          grupo: "Processos",
          titulo: maskCNJ(p.numeroCNJ),
          sub: `${devedor?.nome ?? "—"} · ${p.comarca}`,
          href: `/dashboard/juridico-processos?processo=${p.id}`,
          icon: <Gavel size={15} weight="duotone" />,
        });
      }
    }

    return out.slice(0, 40);
  }, [termo, db]);

  const grupos = useMemo(() => {
    const mapa = new Map<string, Resultado[]>();
    for (const r of resultados) {
      mapa.set(r.grupo, [...(mapa.get(r.grupo) ?? []), r]);
    }
    return [...mapa.entries()];
  }, [resultados]);

  const abrir = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <Modal
      aberto={aberto}
      onClose={onClose}
      titulo="Busca global"
      descricao="Devedores, títulos, acordos e processos da conta."
      largura="md"
    >
      <SearchInput
        autoFocus
        placeholder="Nome, CPF/CNPJ, número do título, código do acordo ou CNJ"
        value={termo}
        onChange={(e) => setTermo(e.target.value)}
      />

      <div className="mt-4">
        {termo.trim().length < 2 ? (
          <p className="py-8 text-center text-[13px] text-fg-subtle">
            Digite pelo menos 2 caracteres para buscar.
          </p>
        ) : grupos.length === 0 ? (
          <EmptyState
            icon={<MagnifyingGlass size={20} />}
            titulo="Nada encontrado"
            descricao="Verifique o termo digitado ou troque o escopo de empresa."
          />
        ) : (
          grupos.map(([grupo, itens]) => (
            <div key={grupo} className="mb-4 last:mb-0">
              <p className="mb-1.5 text-[11px] font-semibold tracking-wider text-fg-subtle uppercase">
                {grupo}
              </p>
              <div className="space-y-0.5">
                {itens.slice(0, 6).map((r) => (
                  <button
                    key={r.id}
                    onClick={() => abrir(r.href)}
                    className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-surface-2"
                  >
                    <span className="grid size-7 shrink-0 place-items-center rounded-md bg-accent-soft text-accent">
                      {r.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium text-fg">
                        {r.titulo}
                      </span>
                      <span className="tnum block truncate text-[12px] text-fg-muted">{r.sub}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
}
