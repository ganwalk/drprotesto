import { CheckCircle, Clock, Prohibit } from "@phosphor-icons/react/dist/ssr";
import { Secao, TituloSecao } from "./secao";

const FASES = [
  { fase: "Emissão", quando: "D-30", canais: "E-mail", cor: "bg-line-strong" },
  { fase: "Antes do vencimento", quando: "D-3", canais: "E-mail · WhatsApp", cor: "bg-steel-300" },
  { fase: "No dia do vencimento", quando: "D0", canais: "WhatsApp", cor: "bg-steel-400" },
  { fase: "Depois do vencimento", quando: "D+5", canais: "E-mail · WhatsApp", cor: "bg-steel-500" },
  { fase: "Pré-protesto", quando: "D+20", canais: "E-mail · WhatsApp", cor: "bg-warn" },
  { fase: "Protestado", quando: "D+60", canais: "E-mail", cor: "bg-danger" },
  { fase: "Jurídico", quando: "D+100", canais: "E-mail", cor: "bg-navy-800" },
];

const REGRAS = [
  { icon: Clock, texto: "Janela de disparo das 08:00 às 18:00" },
  { icon: Prohibit, texto: "Domingos e feriados bloqueados automaticamente" },
  { icon: CheckCircle, texto: "Uma régua independente por empresa" },
];

export function SecaoRegua() {
  return (
    <Secao fundo="surface">
      <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <TituloSecao
            eyebrow="Motor de automação"
            titulo="A régua trabalha a carteira enquanto o time cuida das exceções."
            descricao="Monte a linha do tempo de cobrança por empresa: qual mensagem sai em cada fase, por qual canal e em que dia. O disparo respeita a janela configurada e não incomoda ninguém fora do horário."
          />

          <ul className="mt-8 space-y-4">
            {REGRAS.map(({ icon: Icone, texto }) => (
              <li key={texto} className="flex items-center gap-3 text-[14px] text-fg">
                <Icone size={18} weight="duotone" className="shrink-0 text-accent" />
                {texto}
              </li>
            ))}
          </ul>

          <div className="mt-8 rounded-xl border border-line bg-bg p-5">
            <p className="mb-3 text-[11.5px] font-semibold tracking-wider text-fg-subtle uppercase">
              Variáveis disponíveis nos templates
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[
                "{{nome}}", "{{primeiro_nome}}", "{{numero_titulo}}", "{{valor_cobranca}}",
                "{{vencimento}}", "{{dias_atraso}}", "{{fase}}", "{{link_pagamento}}",
              ].map((v) => (
                <code
                  key={v}
                  className="rounded-md bg-surface-2 px-2 py-1 font-mono text-[11.5px] text-accent"
                >
                  {v}
                </code>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="overflow-hidden rounded-2xl border border-line bg-bg shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
              <p className="font-display text-[14px] font-semibold text-fg">
                Régua padrão — Aurora Colchões
              </p>
              <span className="rounded-md bg-ok-soft px-2 py-1 text-[11px] font-semibold text-ok">
                Ativa
              </span>
            </div>

            <div className="divide-y divide-line">
              {FASES.map((f, i) => (
                <div key={f.fase} className="flex items-center gap-4 px-5 py-3.5">
                  <span className={`h-9 w-1 shrink-0 rounded-full ${f.cor}`} />
                  <span className="tnum w-12 shrink-0 font-mono text-[12px] text-fg-subtle">
                    {f.quando}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-medium text-fg">{f.fase}</p>
                    <p className="mt-0.5 text-[12px] text-fg-muted">{f.canais}</p>
                  </div>
                  <span
                    className={`h-5 w-9 shrink-0 rounded-full ${
                      i === FASES.length - 1 ? "bg-line-strong" : "bg-accent"
                    } relative`}
                  >
                    <span
                      className={`absolute top-0.5 size-4 rounded-full bg-white shadow-sm ${
                        i === FASES.length - 1 ? "left-0.5" : "left-[18px]"
                      }`}
                    />
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line bg-surface-2/60 px-5 py-3.5 text-[12px] text-fg-muted">
              <span>Seg · Ter · Qua · Qui · Sex</span>
              <span>08:00 – 18:00</span>
              <span>Domingos e feriados bloqueados</span>
            </div>
          </div>
        </div>
      </div>
    </Secao>
  );
}
