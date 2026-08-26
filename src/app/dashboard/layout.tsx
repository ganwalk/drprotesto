"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "@phosphor-icons/react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { useApp } from "@/store/app-store";
import { IS_DEMO } from "@/services/datasource";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { pronto, sessao, db, entrar } = useApp();
  const [menuMobile, setMenuMobile] = useState(false);
  const pathname = usePathname();

  // No modo de demonstração o acesso é livre: se não houver sessão, uma é
  // aberta com o usuário supervisor do seed. Com backend real o adaptador
  // HTTP recusa o login e a tela /entrar assume.
  useEffect(() => {
    if (pronto && !sessao && IS_DEMO) {
      void entrar(db.usuarioAtual.email, "demonstracao");
    }
  }, [pronto, sessao, db.usuarioAtual.email, entrar]);

  useEffect(() => setMenuMobile(false), [pathname]);

  if (!pronto) {
    return (
      <div className="grid min-h-dvh place-items-center bg-bg">
        <div className="flex flex-col items-center gap-3">
          <span className="size-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <p className="text-[13px] text-fg-muted">Carregando a base…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-bg">
      <div className="hidden shrink-0 lg:block">
        <Sidebar />
      </div>

      {menuMobile && (
        <div className="fixed inset-0 z-90 lg:hidden">
          <div
            className="animate-fade absolute inset-0 bg-navy-950/45"
            onClick={() => setMenuMobile(false)}
          />
          <div className="absolute inset-y-0 left-0 flex">
            <Sidebar onNavegar={() => setMenuMobile(false)} />
            <button
              onClick={() => setMenuMobile(false)}
              aria-label="Fechar menu"
              className="m-3 grid size-9 self-start place-items-center rounded-lg bg-surface text-fg shadow-[var(--shadow-pop)]"
            >
              <X size={16} weight="bold" />
            </button>
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onAbrirMenu={() => setMenuMobile(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1400px] px-4 py-6 lg:px-8 lg:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
