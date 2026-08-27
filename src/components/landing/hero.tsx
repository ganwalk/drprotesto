import Link from "next/link";
import {
  ArrowRight,
  Buildings,
  MagnifyingGlass,
  ShieldCheck,
  Stamp,
} from "@phosphor-icons/react/dist/ssr";
import { HeroCanvas } from "./hero-canvas";
import { PreviewApp } from "./preview-app";

const TEASERS = [
  {
    icon: Stamp,
    titulo: "Protesto de títulos",
    texto: "Remessa e acompanhamento junto ao CENPROT, do apontamento à baixa, título a título.",
    href: "#fluxo",
  },
  {
    icon: ShieldCheck,
    titulo: "Cobrança judicial",
    texto: "Execução direta de títulos protestados quando a via amigável se esgota.",
    href: "#modulos",
  },
  {
    icon: Buildings,
    titulo: "Recuperação de créditos",
    texto: "Régua automatizada, acordos com desconto e liquidação por PIX numa só rotina.",
    href: "#plataforma",
  },
];

const AVATARES = ["AC", "MB", "SR", "JP"];

export function Hero() {
  return (
    <section className="bg-bg px-5 pt-28 pb-16 lg:px-8 lg:pt-36 lg:pb-20">
      <div className="mx-auto max-w-[1240px]">
        {/* Grid principal: cartão escuro do produto + coluna de screenshot e estatística */}
        <div className="grid gap-4 lg:grid-cols-12 lg:items-stretch">
          {/* Cartão escuro — shader WebGL com elementos flutuantes em vidro */}
          <div className="animate-fade-up relative isolate overflow-hidden rounded-[28px] bg-navy-950 shadow-[0_30px_70px_-30px_rgba(6,18,26,0.45)] lg:col-span-7">
            <HeroCanvas className="absolute inset-0 h-full w-full" />
            <div
              className="absolute inset-0 bg-gradient-to-t from-navy-950/88 via-navy-950/20 to-navy-950/45"
              aria-hidden
            />

            <div className="relative flex min-h-[560px] flex-col justify-between p-6 sm:p-8 lg:p-10">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3.5 py-1.5 text-[11.5px] font-medium tracking-wide text-white/85 backdrop-blur-md">
                  <span className="size-1.5 rounded-full bg-steel-300" />
                  Protesto nos termos da Lei 9.492/97
                </span>

                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 py-1.5 pr-3.5 pl-1.5 backdrop-blur-md">
                  <span className="flex -space-x-2">
                    {AVATARES.map((sigla) => (
                      <span
                        key={sigla}
                        className="grid size-6 place-items-center rounded-full border-2 border-navy-950 bg-steel-500 text-[9px] font-semibold text-white"
                      >
                        {sigla}
                      </span>
                    ))}
                  </span>
                  <span className="text-[11.5px] font-medium whitespace-nowrap text-white/85">
                    148 devedores · 4 empresas
                  </span>
                </span>
              </div>

              <div className="animate-fade-up" style={{ animationDelay: "80ms" }}>
                <h1 className="font-display max-w-lg text-[clamp(2.1rem,4.6vw,3.35rem)] font-bold leading-[1.03] text-white">
                  Recupere créditos com eficiência e segurança jurídica.
                </h1>
                <p className="mt-4 max-w-sm text-[14.5px] leading-relaxed text-white/70">
                  Do aviso ao protesto em cartório, da negociação ao acordo assinado: uma
                  plataforma que une agilidade e expertise jurídica, pensada para empresas,
                  escritórios de advocacia e profissionais liberais em todo o Brasil.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/dashboard"
                    className="inline-flex h-11 items-center gap-2.5 rounded-full bg-white px-5 text-[14px] font-semibold text-navy-900 transition-colors hover:bg-ice-100"
                  >
                    Explorar a plataforma
                    <ArrowRight size={15} weight="bold" />
                  </Link>
                  <Link
                    href="#fluxo"
                    className="inline-flex h-11 items-center gap-2.5 rounded-full border border-white/25 px-5 text-[14px] font-medium text-white transition-colors hover:bg-white/10"
                  >
                    Entender o fluxo
                  </Link>
                </div>
              </div>

              {/* Barra flutuante — evoca a busca global real da plataforma */}
              <Link
                href="/dashboard/carteira-devedores"
                className="group mt-8 flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md transition-colors hover:bg-white/15"
              >
                <MagnifyingGlass size={16} className="shrink-0 text-white/60" />
                <span className="flex-1 truncate text-[13px] text-white/55">
                  Buscar devedor, título, número do processo…
                </span>
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white text-navy-900 transition-transform group-hover:translate-x-0.5">
                  <ArrowRight size={14} weight="bold" />
                </span>
              </Link>
            </div>
          </div>

          {/* Coluna direita — screenshot do produto + estatísticas */}
          <div className="flex flex-col gap-4 lg:col-span-5">
            <div
              className="animate-fade-up flex-1"
              style={{ animationDelay: "120ms" }}
            >
              <PreviewApp />
            </div>

            <div
              className="animate-fade-up grid grid-cols-2 gap-4"
              style={{ animationDelay: "180ms" }}
            >
              <div className="rounded-[28px] border border-white/10 bg-navy-900 p-5">
                <p className="tnum font-display text-[30px] leading-none font-bold text-white">
                  38%
                </p>
                <p className="mt-2 text-[12px] leading-snug text-white/60">
                  recuperado antes do cartório
                </p>
              </div>
              <div className="rounded-[28px] border border-line bg-surface p-5">
                <p className="tnum font-display text-[30px] leading-none font-bold text-fg">
                  11 dias
                </p>
                <p className="mt-2 text-[12px] leading-snug text-fg-muted">
                  prazo médio até o acordo
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Segunda fileira — teasers de módulo, mesmo raio e espírito bento */}
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {TEASERS.map(({ icon: Icone, titulo, texto, href }, i) => (
            <Link
              key={titulo}
              href={href}
              className="animate-fade-up group rounded-[28px] border border-line bg-surface p-6 transition-colors hover:border-accent hover:bg-accent-soft/40"
              style={{ animationDelay: `${220 + i * 60}ms` }}
            >
              <div className="flex items-start justify-between">
                <span className="grid size-10 place-items-center rounded-xl bg-accent-soft text-accent transition-colors group-hover:bg-accent group-hover:text-accent-fg">
                  <Icone size={19} weight="duotone" />
                </span>
                <ArrowRight
                  size={14}
                  weight="bold"
                  className="mt-1 -translate-x-1 text-fg-subtle opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
                />
              </div>
              <h3 className="font-display mt-4 text-[15px] font-semibold text-fg">{titulo}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-fg-muted">{texto}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
