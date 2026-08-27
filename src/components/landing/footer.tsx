import Link from "next/link";
import { Envelope, MapPin, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
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
              Especialistas em recuperação de crédito e protesto extrajudicial: régua de
              cobrança, acordos digitais e liquidação por PIX, com segurança jurídica do início
              ao fim.
            </p>
            <div className="mt-6 space-y-3 text-[13px] text-fg-muted">
              <p className="flex items-start gap-2.5">
                <MapPin size={16} className="mt-0.5 shrink-0 text-fg-subtle" />
                <span>
                  Avenida Goiás, 310 — Edifício Vila Boa, 8º andar, sala 803
                  <br />
                  Setor Central, Goiânia/GO · CEP 74010-010
                </span>
              </p>
              <a
                href="https://wa.me/5562983362468"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 transition-colors hover:text-accent"
              >
                <WhatsappLogo size={16} className="shrink-0 text-fg-subtle" />
                +55 62 98336-2468 · seg. a sex., 8h às 18h
              </a>
              <a
                href="mailto:contato@drprotesto.com.br"
                className="flex items-center gap-2.5 transition-colors hover:text-accent"
              >
                <Envelope size={16} className="shrink-0 text-fg-subtle" />
                contato@drprotesto.com.br
              </a>
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
