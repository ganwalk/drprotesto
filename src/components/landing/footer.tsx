import Link from "next/link";
import { Logo } from "@/components/brand/logo";

const COLUNAS = [
  {
    titulo: "Plataforma",
    links: [
      { label: "Dashboard de títulos", href: "/dashboard" },
      { label: "Carteira de devedores", href: "/dashboard/carteira-devedores" },
      { label: "Régua de cobrança", href: "/dashboard/regua" },
      { label: "Gestão de acordos", href: "/dashboard/gestao-acordos" },
      { label: "Área PIX", href: "/dashboard/pix" },
    ],
  },
  {
    titulo: "Jurídico",
    links: [
      { label: "Processos", href: "/dashboard/juridico-processos" },
      { label: "Calculadora monetária", href: "/dashboard/calculadora-atualizacao-monetaria" },
      { label: "Advogados e testemunhas", href: "/dashboard/gestao-advogados-testemunhas" },
      { label: "Consulta de protesto", href: "/dashboard/consult-cpf-cnpj" },
    ],
  },
  {
    titulo: "Conta",
    links: [
      { label: "Entrar", href: "/entrar" },
      { label: "Empresas", href: "/dashboard/empresas" },
      { label: "Configurações", href: "/dashboard/configuracoes" },
      { label: "Integrações", href: "/dashboard/integracoes" },
      { label: "Sobre o sistema", href: "/dashboard/sobre-o-sistema" },
    ],
  },
];

export function LandingFooter() {
  return (
    <footer className="border-t border-line bg-surface px-5 pt-16 pb-8 lg:px-8">
      <div className="mx-auto max-w-[1240px]">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo size={34} />
            <p className="mt-5 max-w-xs text-[13.5px] leading-relaxed text-fg-muted">
              Recuperação de crédito ponta a ponta: régua de cobrança, protesto extrajudicial,
              acordos digitais e liquidação por PIX.
            </p>
            <div className="mt-6 space-y-1 text-[13px] text-fg-muted">
              <p>contato@drprotesto.com.br</p>
              <p>0800 000 0000</p>
            </div>
          </div>

          {COLUNAS.map((col) => (
            <div key={col.titulo} className="lg:col-span-2 lg:col-start-auto">
              <p className="mb-4 text-[11.5px] font-semibold tracking-wider text-fg-subtle uppercase">
                {col.titulo}
              </p>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-[13.5px] text-fg-muted transition-colors hover:text-accent"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="lg:col-span-2">
            <p className="mb-4 text-[11.5px] font-semibold tracking-wider text-fg-subtle uppercase">
              Base legal
            </p>
            <ul className="space-y-2.5 text-[13.5px] leading-relaxed text-fg-muted">
              <li>Lei 9.492/97 — Protesto</li>
              <li>Lei 14.905/2024 — Juros legais</li>
              <li>Lei 13.709/18 — LGPD</li>
              <li>CPC — Execução de título</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
          <p className="text-[12.5px] text-fg-subtle">
            © {new Date().getFullYear()} DR PROTESTO. Interface de demonstração — dados fictícios
            gerados no navegador.
          </p>
          <div className="flex gap-5 text-[12.5px] text-fg-subtle">
            <span>Política de privacidade</span>
            <span>Termos de uso</span>
            <span>Suporte</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
