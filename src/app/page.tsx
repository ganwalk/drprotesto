import { LandingNav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { SecaoPlataforma } from "@/components/landing/secao-plataforma";
import { SecaoFluxo } from "@/components/landing/secao-fluxo";
import { SecaoModulos } from "@/components/landing/secao-modulos";
import { SecaoRegua } from "@/components/landing/secao-regua";
import { SecaoIntegracoes } from "@/components/landing/secao-integracoes";
import { SecaoSeguranca } from "@/components/landing/secao-seguranca";
import { SecaoPlanos } from "@/components/landing/secao-planos";
import { SecaoFaq } from "@/components/landing/secao-faq";
import { CtaFinal } from "@/components/landing/cta-final";
import { LandingFooter } from "@/components/landing/footer";

export default function Home() {
  return (
    <>
      <LandingNav />
      <main>
        <Hero />
        <SecaoPlataforma />
        <SecaoFluxo />
        <SecaoModulos />
        <SecaoRegua />
        <SecaoIntegracoes />
        <SecaoSeguranca />
        <SecaoPlanos />
        <SecaoFaq />
        <CtaFinal />
      </main>
      <LandingFooter />
    </>
  );
}
