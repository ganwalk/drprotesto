import {
  CheckCircle,
  ChatCircleDots,
  PaperPlaneRight,
  Signature,
  UsersThree,
} from "@phosphor-icons/react/dist/ssr";
import { Secao, TituloSecao } from "./secao";

/** Barra de janela reutilizada nos três mockups — mesmo padrão do PreviewApp. */
function BarraJanela({ rotulo }: { rotulo: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-line bg-surface-2 px-4 py-2.5">
      <span className="flex gap-1.5">
        <span className="size-2 rounded-full bg-line-strong" />
        <span className="size-2 rounded-full bg-line-strong" />
        <span className="size-2 rounded-full bg-line-strong" />
      </span>
      <span className="ml-2 truncate text-[10.5px] font-medium text-fg-subtle">{rotulo}</span>
    </div>
  );
}

export function SecaoHumana() {
  return (
    <Secao>
      <TituloSecao
        eyebrow="Sobre a plataforma"
        titulo="Tecnologia que carrega gente do outro lado da tela."
        descricao="DR PROTESTO nasceu para dar agilidade e segurança jurídica à recuperação de crédito. Nossa equipe de especialistas desenhou cada módulo com a experiência de quem já viveu o processo manual — a régua automatiza o repetitivo, mas cada acordo continua sendo uma negociação conduzida por gente."
      />

      <div className="mt-12 grid gap-4 lg:grid-cols-12 lg:items-stretch">
        {/* Conversa de WhatsApp — humaniza pelo diálogo real, não pela foto */}
        <div className="overflow-hidden rounded-[28px] border border-line bg-surface lg:col-span-7">
          <BarraJanela rotulo="drprotesto.com.br/dashboard/whatsapp-web/conversas" />
          <div className="flex items-center gap-3 border-b border-line px-5 py-3.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
              <ChatCircleDots size={17} weight="duotone" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-fg">
                Comercial Vértice Distribuidora
              </p>
              <p className="text-[11.5px] text-fg-muted">Título 24801/03 · pré-protesto</p>
            </div>
          </div>
          <div className="space-y-3 bg-surface-2/40 p-5">
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-xl rounded-tl-sm border border-line bg-surface px-3.5 py-2.5">
                <p className="text-[12.5px] leading-relaxed text-fg">
                  Boa tarde, recebi a notificação. Consigo pagar só na semana que vem, dá pra
                  segurar?
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-xl rounded-tr-sm bg-accent px-3.5 py-2.5 text-accent-fg">
                <p className="mb-1 flex items-center gap-1 text-[10px] opacity-70">
                  <UsersThree size={10} /> Operador
                </p>
                <p className="text-[12.5px] leading-relaxed">
                  Consigo sim parcelar em até 3x com entrada de 20%. Posso já te enviar a
                  proposta?
                </p>
              </div>
            </div>
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-xl rounded-tl-sm border border-line bg-surface px-3.5 py-2.5">
                <p className="text-[12.5px] leading-relaxed text-fg">
                  Perfeito, pode mandar! Assim evitamos o protesto.
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 border-t border-line px-4 py-3">
            <span className="flex-1 truncate rounded-lg bg-surface-2 px-3 py-2 text-[12px] text-fg-subtle">
              Escreva uma mensagem…
            </span>
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent text-accent-fg">
              <PaperPlaneRight size={14} weight="fill" />
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:col-span-5">
          {/* Assinatura de acordo */}
          <div className="flex-1 overflow-hidden rounded-[28px] border border-line bg-surface">
            <BarraJanela rotulo="Acordo ACD-02431" />
            <div className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-[12.5px] font-semibold text-fg">Assinatura eletrônica</p>
                <span className="rounded-md bg-ok-soft px-2 py-1 text-[10.5px] font-semibold text-ok">
                  Concluída
                </span>
              </div>
              <div className="mt-4 space-y-2.5">
                {["Comercial Vértice Distribuidora", "Aurora Colchões"].map((nome) => (
                  <div
                    key={nome}
                    className="flex items-center gap-2.5 rounded-lg bg-surface-2/60 px-3 py-2"
                  >
                    <CheckCircle size={16} weight="fill" className="shrink-0 text-ok" />
                    <span className="min-w-0 flex-1 truncate text-[12px] text-fg">{nome}</span>
                    <Signature size={13} className="shrink-0 text-fg-subtle" />
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[11px] text-fg-subtle">
                Assinado por ambas as partes · testemunhado e auditável
              </p>
            </div>
          </div>

          {/* Equipe */}
          <div className="flex-1 overflow-hidden rounded-[28px] border border-line bg-surface">
            <BarraJanela rotulo="Usuários credores" />
            <div className="divide-y divide-line">
              {[
                { nome: "Helena Drummond", cargo: "Supervisora de recuperação" },
                { nome: "Marcelo Bittencourt", cargo: "Analista de cobrança" },
                { nome: "Sofia Rezende", cargo: "Advogada" },
              ].map((p) => (
                <div key={p.nome} className="flex items-center gap-3 px-5 py-3">
                  <span className="relative grid size-8 shrink-0 place-items-center rounded-full bg-accent-soft text-[10.5px] font-semibold text-accent">
                    {p.nome
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                    <span className="absolute right-0 bottom-0 size-2 rounded-full border-2 border-surface bg-ok" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[12.5px] font-medium text-fg">{p.nome}</p>
                    <p className="truncate text-[11px] text-fg-muted">{p.cargo}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Secao>
  );
}
