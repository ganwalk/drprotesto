"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, List, Moon, Sun, X } from "@phosphor-icons/react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/primitives";
import { useApp } from "@/store/app-store";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "#plataforma", label: "Plataforma" },
  { href: "#fluxo", label: "Como funciona" },
  { href: "#modulos", label: "Módulos" },
  { href: "#integracoes", label: "Integrações" },
  { href: "#planos", label: "Planos" },
];

export function LandingNav() {
  const [solido, setSolido] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const { tema, alternarTema } = useApp();

  useEffect(() => {
    const onScroll = () => setSolido(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300",
        solido
          ? "border-b border-line bg-bg/85 backdrop-blur-xl"
          : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-6 px-5 lg:px-8">
        <Link href="/" aria-label="DR PROTESTO — início">
          <Logo size={30} variante={solido ? "auto" : "claro"} />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors",
                solido
                  ? "text-fg-muted hover:bg-surface-2 hover:text-fg"
                  : "text-white/70 hover:bg-white/10 hover:text-white",
              )}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={alternarTema}
            aria-label="Alternar tema"
            className={cn(
              "hidden size-9 place-items-center rounded-lg transition-colors sm:grid",
              solido
                ? "text-fg-muted hover:bg-surface-2 hover:text-fg"
                : "text-white/70 hover:bg-white/10 hover:text-white",
            )}
          >
            {tema === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          <Link
            href="/entrar"
            className={cn(
              "hidden rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors sm:block",
              solido
                ? "text-fg hover:bg-surface-2"
                : "text-white hover:bg-white/10",
            )}
          >
            Entrar
          </Link>

          <Link href="/dashboard">
            <Button
              size="sm"
              variant={solido ? "primary" : "dark"}
              className={cn(!solido && "bg-white text-navy-900 hover:bg-ice-100")}
            >
              Ver a plataforma
              <ArrowUpRight size={14} weight="bold" />
            </Button>
          </Link>

          <button
            onClick={() => setMenuAberto((v) => !v)}
            aria-label="Menu"
            className={cn(
              "grid size-9 place-items-center rounded-lg lg:hidden",
              solido ? "text-fg" : "text-white",
            )}
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
