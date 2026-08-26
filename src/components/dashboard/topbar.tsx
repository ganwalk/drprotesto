"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Bell,
  Calculator,
  Certificate,
  GearSix,
  Info,
  Key,
  List,
  MagnifyingGlass,
  Moon,
  Scales,
  ShieldCheck,
  SignOut,
  Stamp,
  Sun,
} from "@phosphor-icons/react";
import { Avatar, Badge, Button } from "@/components/ui/primitives";
import { Dropdown, DropdownItem, DropdownLabel } from "@/components/ui/overlay";
import { EmpresaSelector } from "./empresa-selector";
import { BuscaGlobal } from "./busca-global";
import { ConsultarProtesto } from "./consultar-protesto";
import { useApp } from "@/store/app-store";
import { useEscopo } from "@/store/selectors";
import { date, relativeDate } from "@/lib/format";

export function Topbar({ onAbrirMenu }: { onAbrirMenu: () => void }) {
  const { db, sessao, tema, alternarTema, sair } = useApp();
  const [buscaAberta, setBuscaAberta] = useState(false);
  const [protestoAberto, setProtestoAberto] = useState(false);

  const usuario = db.usuarios.find((u) => u.id === sessao?.usuarioId) ?? db.usuarioAtual;
  const titulos = useEscopo(db.titulos);
  const avisos = useEscopo(db.avisos);

  // Ctrl/Cmd+K abre a busca global de qualquer tela.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setBuscaAberta(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const notificacoes = [
    {
      id: "n1",
      titulo: `${titulos.filter((t) => t.status === "AGUARDANDO_REMESSA").length} títulos na fila de remessa`,
      texto: "Serão transmitidos ao CENPROT na próxima janela.",
      quando: relativeDate(new Date()),
    },
    {
      id: "n2",
      titulo: `${avisos.filter((a) => a.status === "FALHA").length} avisos falharam`,
      texto: "Verifique contatos sem e-mail ou WhatsApp na carteira.",
      quando: relativeDate(new Date(Date.now() - 3 * 3600_000)),
    },
    {
      id: "n3",
      titulo: "Backup automático concluído",
      texto: `Dump enviado ao bucket às 17:30 · ${date(new Date())}`,
      quando: "hoje",
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-3 border-b border-line bg-bg/85 px-4 backdrop-blur-xl lg:px-6">
        <button
          onClick={onAbrirMenu}
          aria-label="Abrir menu"
          className="grid size-9 shrink-0 place-items-center rounded-lg text-fg-muted hover:bg-surface-2 hover:text-fg lg:hidden"
        >
          <List size={18} />
        </button>

        <EmpresaSelector />

        <button
          onClick={() => setBuscaAberta(true)}
          className="hidden h-9 max-w-sm min-w-0 flex-1 items-center gap-2.5 rounded-lg border border-line bg-surface px-3 text-left transition-colors hover:border-line-strong md:flex"
        >
          <MagnifyingGlass size={15} className="shrink-0 text-fg-subtle" />
          <span className="min-w-0 flex-1 truncate text-[13px] text-fg-subtle">
            Buscar devedor, título, acordo…
          </span>
          <kbd className="shrink-0 rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[10.5px] text-fg-subtle">
            ⌘K
          </kbd>
        </button>

        <div className="ml-auto flex items-center gap-1.5">
          <Button variant="outline" size="sm" onClick={() => setProtestoAberto(true)}>
            <Stamp size={14} />
            <span className="hidden sm:inline">Consultar protesto</span>
          </Button>

          <button
            onClick={() => setBuscaAberta(true)}
            aria-label="Buscar"
            className="grid size-9 place-items-center rounded-lg text-fg-muted hover:bg-surface-2 hover:text-fg md:hidden"
          >
            <MagnifyingGlass size={17} />
          </button>

          <button
            onClick={alternarTema}
            aria-label="Alternar tema"
            className="grid size-9 place-items-center rounded-lg text-fg-muted hover:bg-surface-2 hover:text-fg"
          >
            {tema === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          <Dropdown
            largura={320}
            trigger={({ toggle }) => (
              <button
                onClick={toggle}
                aria-label="Notificações"
                className="relative grid size-9 place-items-center rounded-lg text-fg-muted hover:bg-surface-2 hover:text-fg"
              >
                <Bell size={17} />
                <span className="absolute top-2 right-2 size-1.5 rounded-full bg-danger" />
              </button>
            )}
          >
            {() => (
              <>
                <DropdownLabel>Notificações</DropdownLabel>
                {notificacoes.map((n) => (
                  <div
                    key={n.id}
                    className="rounded-lg px-2.5 py-2.5 transition-colors hover:bg-surface-2"
                  >
                    <p className="text-[13px] font-medium text-fg">{n.titulo}</p>
                    <p className="mt-0.5 text-[12px] leading-relaxed text-fg-muted">{n.texto}</p>
                    <p className="mt-1 text-[11px] text-fg-subtle">{n.quando}</p>
                  </div>
                ))}
              </>
            )}
          </Dropdown>

          <Dropdown
            largura={264}
            trigger={({ toggle }) => (
              <button
                onClick={toggle}
                className="ml-1 flex items-center gap-2 rounded-lg p-0.5 transition-colors hover:bg-surface-2"
                aria-label="Menu da conta"
              >
                <Avatar nome={usuario.nome} size={32} />
              </button>
            )}
          >
            {({ fechar }) => (
              <>
                <div className="border-b border-line px-2.5 pt-1.5 pb-3">
                  <p className="truncate text-[13px] font-semibold text-fg">{usuario.nome}</p>
                  <p className="truncate text-[12px] text-fg-muted">{usuario.email}</p>
                  <Badge tone="accent" className="mt-2">
                    Plano {db.contaSupervisora.plano}
                  </Badge>
                </div>

                <div className="pt-1.5">
                  <Link href="/dashboard/supervisors" onClick={fechar}>
                    <DropdownItem icon={<ShieldCheck size={15} />}>Supervisor</DropdownItem>
                  </Link>
                  <Link href="/dashboard/gestao-advogados-testemunhas" onClick={fechar}>
                    <DropdownItem icon={<Scales size={15} />}>Advogados e testemunhas</DropdownItem>
                  </Link>
                  <Link href="/dashboard/calculadora-atualizacao-monetaria" onClick={fechar}>
                    <DropdownItem icon={<Calculator size={15} />}>Calculadora monetária</DropdownItem>
                  </Link>
                  <Link href="/dashboard/integracoes" onClick={fechar}>
                    <DropdownItem icon={<Certificate size={15} />}>Integrações</DropdownItem>
                  </Link>
                  <Link href="/dashboard/configuracoes" onClick={fechar}>
                    <DropdownItem icon={<GearSix size={15} />}>Configurações</DropdownItem>
                  </Link>
                  <Link href="/dashboard/sobre-o-sistema" onClick={fechar}>
                    <DropdownItem icon={<Info size={15} />}>Sobre o sistema</DropdownItem>
                  </Link>
                  <Link href="/dashboard/alterar-senha" onClick={fechar}>
                    <DropdownItem icon={<Key size={15} />}>Alterar senha</DropdownItem>
                  </Link>
                </div>

                <div className="mt-1.5 border-t border-line pt-1.5">
                  <DropdownItem icon={<SignOut size={15} />} tone="danger" onClick={sair}>
                    Sair da conta
                  </DropdownItem>
                </div>
              </>
            )}
          </Dropdown>
        </div>
      </header>

      <BuscaGlobal aberto={buscaAberta} onClose={() => setBuscaAberta(false)} />
      <ConsultarProtesto aberto={protestoAberto} onClose={() => setProtestoAberto(false)} />
    </>
  );
}
