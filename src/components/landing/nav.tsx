"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, List, Moon, Sun, X } from "@phosphor-icons/react";
import { Logo, LogoMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/primitives";
import { useApp } from "@/store/app-store";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "#plataforma", label: "Plataforma" },
  { href: "#fluxo", label: "Como funciona" },
  { href: "#modulos", label: "Módulos" },
  { href: "#planos", label: "Planos" },
  { href: "#depoimentos", label: "Depoimentos" },
];

export function LandingNav() {
  const [rolado, setRolado] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const { tema, alternarTema } = useApp();

  useEffect(() => {
    const onScroll = () => setRolado(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 bg-bg/85 backdrop-blur-xl transition-[border-color,box-shadow] duration-300",
        rolado
          ? "border-b border-line shadow-[0_1px_0_rgba(9,30,44,0.03)]"
          : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-6 px-5 lg:px-8">
        <Link href="/" aria-label="DR PROTESTO — início" className="shrink-0">
          <LogoMark size={30} className="sm:hidden" />
          <Logo size={30} className="hidden sm:inline-flex" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-[13.5px] font-medium text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={alternarTema}
            aria-label="Alternar tema"
            className="hidden size-9 place-items-center rounded-lg text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg sm:grid"
          >
            {tema === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          <Link
            href="/entrar"
            className="hidden rounded-lg px-3 py-2 text-[13.5px] font-medium text-fg transition-colors hover:bg-surface-2 sm:block"
          >
            Entrar
          </Link>

          <Link href="/dashboard">
            <Button size="sm" variant="primary">
              Ver a plataforma
              <ArrowUpRight size={14} weight="bold" />
            </Button>
          </Link>

          <button
            onClick={() => setMenuAberto((v) => !v)}
            aria-label="Menu"
            className="grid size-9 place-items-center rounded-lg text-fg lg:hidden"
          >
            {menuAberto ? <X size={18} /> : <List size={18} />}
          </button>
        </div>
      </div>

      {menuAberto && (
        <div className="animate-fade border-t border-line bg-bg px-5 py-4 lg:hidden">
          <nav className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMenuAberto(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-fg hover:bg-surface-2"
              >
                {l.label}
              </a>
            ))}
            <Link
              href="/entrar"
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-accent hover:bg-surface-2"
            >
              Entrar na conta
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
