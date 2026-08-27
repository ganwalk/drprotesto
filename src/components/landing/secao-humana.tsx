import { Handshake, PenNib, UsersThree } from "@phosphor-icons/react/dist/ssr";
import { Secao, TituloSecao } from "./secao";

export function SecaoHumana() {
  return (
    <Secao>
      <TituloSecao
        eyebrow="Sobre a plataforma"
        titulo="Tecnologia que carrega gente do outro lado da tela."
        descricao="DR PROTESTO nasceu para dar agilidade e segurança jurídica à recuperação de crédito. Nossa equipe de especialistas desenhou cada módulo com a experiência de quem já viveu o processo manual — a régua automatiza o repetitivo, mas cada acordo continua sendo uma negociação conduzida por gente."
      />

      <div className="mt-12 grid gap-4 lg:grid-cols-12 lg:items-stretch">
        <figure className="group relative min-h-[320px] overflow-hidden rounded-[28px] lg:col-span-7">
          <img
            src="/images/handshake.jpg"
            alt="Duas pessoas fechando um acordo com um aperto de mãos em ambiente corporativo"
            width={1600}
            height={900}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/10 to-transparent"
            aria-hidden
          />
          <figcaption className="absolute inset-x-0 bottom-0 flex items-center gap-2.5 p-6">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/15 text-white backdrop-blur-md">
              <Handshake size={17} weight="duotone" />
            </span>
            <span className="text-[14px] font-medium text-white">
              Acordo fechado é protesto evitado — a régua só chega até aqui.
            </span>
          </figcaption>
        </figure>

        <div className="flex flex-col gap-4 lg:col-span-5">
          <figure className="group relative min-h-[150px] flex-1 overflow-hidden rounded-[28px]">
            <img
              src="/images/assinatura.jpg"
              alt="Profissionais assinando um contrato de acordo à mesa"
              width={1400}
              height={788}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-950/5 to-transparent"
              aria-hidden
            />
            <figcaption className="absolute inset-x-0 bottom-0 flex items-center gap-2 p-5">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/15 text-white backdrop-blur-md">
                <PenNib size={15} weight="duotone" />
              </span>
              <span className="text-[13px] font-medium text-white">
                Assinatura eletrônica, testemunhada e auditável.
              </span>
            </figcaption>
          </figure>

          <figure className="group relative min-h-[150px] flex-1 overflow-hidden rounded-[28px]">
            <img
              src="/images/equipe.jpg"
              alt="Equipe de crédito reunida discutindo a carteira de devedores"
              width={1400}
              height={788}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-950/5 to-transparent"
              aria-hidden
            />
            <figcaption className="absolute inset-x-0 bottom-0 flex items-center gap-2 p-5">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/15 text-white backdrop-blur-md">
                <UsersThree size={15} weight="duotone" />
              </span>
              <span className="text-[13px] font-medium text-white">
                Um time de crédito, não só um painel de números.
              </span>
            </figcaption>
          </figure>
        </div>
      </div>
    </Secao>
  );
}
