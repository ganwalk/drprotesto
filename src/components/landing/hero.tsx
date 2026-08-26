import Link from "next/link";
import { ArrowDown, ArrowRight, QrCode, ShieldCheck, Stamp } from "@phosphor-icons/react/dist/ssr";
import { HeroCanvas } from "./hero-canvas";
import { PreviewApp } from "./preview-app";

const DESTAQUES = [
  { icon: Stamp, texto: "Remessa oficial ao CENPROT" },
  { icon: ShieldCheck, texto: "Acordos com assinatura digital" },
  { icon: QrCode, texto: "Liquidação por PIX conciliada" },
];

const NUMEROS = [
  { valor: "R$ 1,3 bi", label: "em títulos administrados" },
  { valor: "38%", label: "de recuperação antes do cartório" },
  { valor: "4.200", label: "protestos por mês via CENPROT" },
  { valor: "11 dias", label: "de prazo médio até o acordo" },
];

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-navy-950">
      <HeroCanvas className="absolute inset-0 h-full w-full" />

      {/* Véu que garante contraste do texto sobre o shader */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-navy-950/92 via-navy-950/55 to-navy-950/15"
        aria-hidden
      />
      <div
        className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-bg to-transparent"
        aria-hidden
      />

      <div className="relative mx-auto max-w-[1240px] px-5 pt-32 pb-16 lg:px-8 lg:pt-40 lg:pb-24">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <p className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3.5 py-1.5 text-[11.5px] font-medium tracking-wide text-white/85 backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-steel-300" />
              Protesto extrajudicial nos termos da Lei 9.492/97
            </p>

            <h1
              className="font-display animate-fade-up mt-6 text-[clamp(2.4rem,6.4vw,4.35rem)] leading-[1.03] font-semibold text-white"
              style={{ animationDelay: "60ms" }}
            >
              Do primeiro aviso
              <br />
              ao protesto em cartório.
            </h1>

            <p
              className="animate-fade-up mt-6 max-w-xl text-[16.5px] leading-relaxed text-white/70"
              style={{ animationDelay: "120ms" }}
            >
              DR PROTESTO reúne régua de cobrança automatizada, remessa oficial ao CENPROT,
              negociação de acordos com assinatura digital e liquidação por PIX — em uma única
              plataforma multiempresa, com trilha de auditoria em cada etapa.
            </p>

            <div
              className="animate-fade-up mt-8 flex flex-wrap items-center gap-3"
              style={{ animationDelay: "180ms" }}
            >
              <Link
                href="/dashboard"
                className="inline-flex h-12 items-center gap-2.5 rounded-lg bg-white px-6 text-[15px] font-semibold text-navy-900 transition-colors hover:bg-ice-100"
              >
                Explorar a plataforma
                <ArrowRight size={16} weight="bold" />
              </Link>
              <Link
                href="#fluxo"
                className="inline-flex h-12 items-center gap-2.5 rounded-lg border border-white/25 px-6 text-[15px] font-medium text-white transition-colors hover:bg-white/10"
              >
                Entender o fluxo
              </Link>
            </div>

            <ul
              className="animate-fade-up mt-10 flex flex-wrap gap-x-7 gap-y-3"
              style={{ animationDelay: "240ms" }}
            >
              {DESTAQUES.map(({ icon: Icone, texto }) => (
                <li key={texto} className="flex items-center gap-2 text-[13px] text-white/65">
                  <Icone size={16} weight="duotone" className="text-steel-300" />
                  {texto}
                </li>
              ))}
            </ul>
          </div>

          <div
            className="animate-fade-up lg:col-span-5"
            style={{ animationDelay: "300ms" }}
          >
            <div className="relative">
              <div
                className="absolute -inset-6 rounded-3xl bg-steel-400/12 blur-2xl"
                aria-hidden
              />
              <div className="relative lg:rotate-[0.7deg] lg:transition-transform lg:duration-500 lg:hover:rotate-0">
                <PreviewApp />
              </div>
            </div>
          </div>
        </div>

        {/* Faixa de números sobre o shader */}
        <div
          className="animate-fade-up mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/12 bg-white/10 backdrop-blur-md lg:mt-24 lg:grid-cols-4"
          style={{ animationDelay: "360ms" }}
        >
          {NUMEROS.map((n) => (
            <div key={n.label} className="min-w-0 bg-navy-950/45 px-5 py-6">
              <p className="tnum font-display text-[26px] leading-none font-semibold text-white">
                {n.valor}
              </p>
              <p className="mt-2 text-[12.5px] leading-snug text-white/55">{n.label}</p>
            </div>
          ))}
        </div>

        <a
          href="#plataforma"
          className="mt-12 inline-flex items-center gap-2 text-[12px] tracking-wider text-white/45 uppercase transition-colors hover:text-white/80"
        >
          <ArrowDown size={13} weight="bold" />
          Continuar
        </a>
      </div>
    </section>
  );
}
