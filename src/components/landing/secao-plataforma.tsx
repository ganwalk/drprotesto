import { Buildings, Scales, TrendUp, UsersThree } from "@phosphor-icons/react/dist/ssr";
import { Secao, TituloSecao } from "./secao";

const SEGMENTOS = [
  "Indústria", "Distribuição", "Atacado", "Condomínios", "Educação", "Saúde",
  "Serviços B2B", "Locação", "Agronegócio", "Construção civil", "Cooperativas", "Franquias",
];

const PILARES = [
  {
    icon: TrendUp,
    titulo: "Recupere antes do cartório",
    texto:
      "A régua trabalha o título desde a emissão. A maior parte da carteira se resolve na fase amigável — o protesto passa a ser a exceção, não a regra.",
  },
  {
    icon: Scales,
    titulo: "Protesto com respaldo legal",
    texto:
      "Remessa eletrônica ao tabelionato competente pela rede CENPROT, com acompanhamento de protocolo, devolução e lavratura título a título.",
  },
  {
    icon: Buildings,
    titulo: "Multiempresa de verdade",
    texto:
      "Cada CNPJ tem carteira, régua, índices e permissões próprios. Uma conta matriz enxerga o consolidado sem misturar as operações.",
  },
  {
    icon: UsersThree,
    titulo: "Time com acesso na medida",
    texto:
      "Perfis granulares por módulo: quem insere título, quem envia a protesto, quem movimenta o financeiro e quem apenas consulta.",
  },
];

export function SecaoPlataforma() {
  return (
    <Secao id="plataforma">
      {/* Faixa de segmentos atendidos */}
      <div className="mb-20 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
        <p className="mb-5 text-center text-[11.5px] font-medium tracking-[0.18em] text-fg-subtle uppercase">
          Carteiras administradas em
        </p>
        <div className="flex w-max animate-marquee gap-3">
          {[...SEGMENTOS, ...SEGMENTOS].map((s, i) => (
            <span
              key={`${s}-${i}`}
              className="rounded-full border border-line bg-surface px-5 py-2 text-[13px] font-medium text-fg-muted"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <TituloSecao
            eyebrow="A plataforma"
            titulo={
              <>
                Crédito vencido é processo,
                <span className="text-fg-subtle"> não planilha.</span>
              </>
            }
            descricao="Cada título percorre um caminho previsível — aviso, pré-protesto, cartório, acordo, jurídico. A plataforma torna esse caminho explícito, automatizado e auditável, do lançamento à baixa."
          />
        </div>

        <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:col-span-7">
          {PILARES.map(({ icon: Icone, titulo, texto }) => (
            <div key={titulo} className="bg-surface p-6">
              <span className="grid size-10 place-items-center rounded-xl bg-accent-soft text-accent">
                <Icone size={19} weight="duotone" />
              </span>
              <h3 className="font-display mt-4 text-[15px] font-semibold text-fg">{titulo}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-fg-muted">{texto}</p>
            </div>
          ))}
        </div>
      </div>
    </Secao>
  );
}
