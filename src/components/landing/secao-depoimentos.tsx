import { Star } from "@phosphor-icons/react/dist/ssr";
import { Secao, TituloSecao } from "./secao";

const DEPOIMENTOS = [
  {
    texto:
      "Recuperamos mais de 90% dos créditos que estavam em atraso há meses. A régua automática e o acompanhamento do protesto tiraram um peso enorme da nossa equipe financeira.",
    nome: "Marina Salgado",
    cargo: "Diretora financeira · Indústria de espumas",
  },
  {
    texto:
      "Como escritório, usamos a plataforma para acompanhar dezenas de processos ao mesmo tempo. A calculadora com os juros da nova lei sozinha já justifica a assinatura.",
    nome: "Ricardo Bittencourt",
    cargo: "Advogado · Escritório de cobrança",
  },
  {
    texto:
      "Transparência total do início ao fim. Cada título mostra exatamente em que fase está, e os acordos com assinatura digital reduziram nosso prazo de negociação pela metade.",
    nome: "Camila Andrade",
    cargo: "Controller · Rede de varejo",
  },
];

const NUMEROS = [
  { valor: "85%+", label: "de êxito na recuperação de créditos" },
  { valor: "500+", label: "empresas e escritórios atendidos" },
  { valor: "5 anos", label: "de experiência no mercado jurídico" },
  { valor: "24h", label: "para o início do primeiro disparo" },
];

export function SecaoDepoimentos() {
  return (
    <Secao id="depoimentos" fundo="surface">
      <TituloSecao
        eyebrow="Depoimentos"
        titulo="O que dizem quem já confia na recuperação de crédito com a gente."
        alinhamento="center"
      />

      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {DEPOIMENTOS.map((d) => (
          <div key={d.nome} className="rounded-[28px] border border-line bg-bg p-6">
            <div className="flex gap-0.5 text-accent">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} weight="fill" />
              ))}
            </div>
            <p className="mt-4 text-[13.5px] leading-relaxed text-fg">"{d.texto}"</p>
            <div className="mt-5 border-t border-line pt-4">
              <p className="text-[13px] font-semibold text-fg">{d.nome}</p>
              <p className="mt-0.5 text-[12px] text-fg-muted">{d.cargo}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {NUMEROS.map((n) => (
          <div key={n.label} className="rounded-[28px] border border-line bg-bg p-6 text-center">
            <p className="tnum font-display text-[28px] leading-none font-bold text-fg">
              {n.valor}
            </p>
            <p className="mt-2.5 text-[12.5px] leading-snug text-fg-muted">{n.label}</p>
          </div>
        ))}
      </div>
    </Secao>
  );
}
