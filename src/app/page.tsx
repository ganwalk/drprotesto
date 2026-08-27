import { LandingNav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { SecaoHumana } from "@/components/landing/secao-humana";
import { SecaoPlataforma } from "@/components/landing/secao-plataforma";
import { SecaoFluxo } from "@/components/landing/secao-fluxo";
import { SecaoModulos } from "@/components/landing/secao-modulos";
import { SecaoRegua } from "@/components/landing/secao-regua";
import { SecaoIntegracoes } from "@/components/landing/secao-integracoes";
import { SecaoSeguranca } from "@/components/landing/secao-seguranca";
import { SecaoPlanos } from "@/components/landing/secao-planos";
import { SecaoFaq } from "@/components/landing/secao-faq";
import { SecaoDepoimentos } from "@/components/landing/secao-depoimentos";
import { CtaFinal } from "@/components/landing/cta-final";
import { LandingFooter } from "@/components/landing/footer";

export default function Home() {
  return (
    <>
      <LandingNav />
      <main>
        <Hero />
        <SecaoHumana />
        <SecaoPlataforma />
        <SecaoFluxo />
        <SecaoModulos />
        <SecaoRegua />
        <SecaoIntegracoes />
        <SecaoSeguranca />
        <SecaoPlanos />
        <SecaoFaq />
        <SecaoDepoimentos />
        <CtaFinal />
      </main>
      <LandingFooter />
    </>
  );
}
