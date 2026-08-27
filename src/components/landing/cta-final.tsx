import Link from "next/link";
import { ArrowRight, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";

export function CtaFinal() {
  return (
    <section className="px-5 pb-20 lg:px-8 lg:pb-28">
      <div className="relative mx-auto max-w-[1240px] overflow-hidden rounded-[28px] bg-navy-900 px-8 py-16 lg:px-16 lg:py-20">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(90% 130% at 88% 8%, rgba(90,48,56,0.32) 0%, transparent 58%)",
          }}
          aria-hidden
        />
        <div className="relative max-w-2xl">
          <p className="text-[11.5px] font-semibold tracking-[0.18em] text-steel-300 uppercase">
            Comece pela demonstração
          </p>
          <h2 className="font-display mt-4 text-[clamp(1.9rem,4vw,2.9rem)] leading-[1.1] font-semibold text-white">
            Abra a plataforma com uma carteira inteira já carregada.
          </h2>
          <p className="mt-5 text-[15.5px] leading-relaxed text-white/60">
            Quatro empresas, cento e quarenta devedores, centenas de títulos em todos os estágios do
            protesto, acordos em negociação e processos em andamento. Tudo navegável, editável e
            rodando no seu navegador — sem cadastro.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex h-12 items-center gap-2.5 rounded-lg bg-white px-6 text-[15px] font-semibold text-navy-900 transition-colors hover:bg-ice-100"
            >
              Entrar na demonstração
              <ArrowRight size={16} weight="bold" />
            </Link>
            <Link
              href="/entrar"
              className="inline-flex h-12 items-center rounded-lg border border-white/25 px-6 text-[15px] font-medium text-white transition-colors hover:bg-white/10"
            >
              Já tenho conta
            </Link>
          </div>

          <a
            href="https://wa.me/5562983362468"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 text-[13.5px] font-medium text-white/60 transition-colors hover:text-white"
          >
            <WhatsappLogo size={16} weight="fill" />
            Prefere conversar antes? Fale no WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
