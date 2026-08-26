"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  ChatCircleDots,
  Envelope,
  Phone,
  Stamp,
  Question,
} from "@phosphor-icons/react";
import { Card, CardHeader, PageHeader } from "@/components/ui/primitives";

const MANUAIS = [
  {
    icon: BookOpen,
    titulo: "Utilização do sistema",
    texto: "Do cadastro da empresa ao acompanhamento do protesto — passo a passo de cada módulo.",
  },
  {
    icon: ChatCircleDots,
    titulo: "Boas práticas de cobrança",
    texto: "Como escrever mensagens que geram resposta sem expor a empresa a risco jurídico.",
  },
  {
    icon: Stamp,
    titulo: "Protesto extrajudicial",
    texto: "Requisitos do título, prazos, custos e como funciona a baixa após a quitação.",
  },
];

const ATALHOS = [
  { rotulo: "Régua de cobrança", href: "/dashboard/regua" },
  { rotulo: "Importar devedores", href: "/dashboard/importar-devedores-juridicos" },
  { rotulo: "Integrações", href: "/dashboard/integracoes" },
  { rotulo: "Configurações", href: "/dashboard/configuracoes" },
];

export default function AjudaPage() {
  return (
    <>
      <PageHeader
        breadcrumb="Conta"
        titulo="Ajuda e manuais"
        descricao="Material de apoio para a operação e canais de atendimento."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {MANUAIS.map(({ icon: Icone, titulo, texto }) => (
          <Card key={titulo} className="group p-6 transition-colors hover:border-accent">
            <div className="flex items-start justify-between">
              <span className="grid size-11 place-items-center rounded-xl bg-accent-soft text-accent">
                <Icone size={20} weight="duotone" />
              </span>
              <ArrowUpRight
                size={15}
                weight="bold"
                className="mt-1 text-fg-subtle opacity-0 transition-opacity group-hover:opacity-100"
              />
            </div>
            <h3 className="font-display mt-4 text-[15px] font-semibold text-fg">{titulo}</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-fg-muted">{texto}</p>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Canais de suporte"
            description="Atendimento em dias úteis, das 08:00 às 18:00."
            icon={<Question size={15} weight="duotone" />}
          />
          <div className="divide-y divide-line">
            <div className="flex items-center gap-3 px-5 py-4">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-2 text-accent">
                <Phone size={16} weight="duotone" />
              </span>
              <div>
                <p className="text-[13px] font-medium text-fg">0800 000 0000</p>
                <p className="text-[12px] text-fg-muted">Suporte técnico e operacional</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-4">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-2 text-accent">
                <Envelope size={16} weight="duotone" />
              </span>
              <div>
                <p className="text-[13px] font-medium text-fg">suporte@drprotesto.com.br</p>
                <p className="text-[12px] text-fg-muted">Resposta em até 1 dia útil</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-4">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-2 text-accent">
                <ChatCircleDots size={16} weight="duotone" />
              </span>
              <div>
                <p className="text-[13px] font-medium text-fg">Chat na plataforma</p>
                <p className="text-[12px] text-fg-muted">Disponível para planos Protesto e Corporativo</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Ir direto para" description="Telas mais consultadas junto ao suporte." />
          <div className="grid gap-2 p-5 sm:grid-cols-2">
            {ATALHOS.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="flex items-center justify-between gap-2 rounded-lg border border-line px-3.5 py-3 text-[13px] font-medium text-fg transition-colors hover:border-accent hover:bg-accent-soft"
              >
                {a.rotulo}
                <ArrowUpRight size={13} weight="bold" className="text-fg-subtle" />
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
