import {
  ChartBar,
  ChatCircleDots,
  Certificate,
  Calculator,
  QrCode,
  Stamp,
} from "@phosphor-icons/react/dist/ssr";
import { Secao, TituloSecao } from "./secao";

const INTEGRACOES = [
  {
    icon: Stamp,
    nome: "CENPROT",
    sub: "Confederação Nacional de Protesto",
    texto:
      "Remessa eletrônica ao tabelionato competente, com ambiente de homologação e produção separados e trava para o envio definitivo.",
  },
  {
    icon: Certificate,
    nome: "Assinatura eletrônica",
    sub: "UltraSign · GenInfra",
    texto:
      "O PDF do acordo sobe por multipart com os metadados do caso e volta assinado por webhook, roteado por identificadores no corpo da requisição.",
  },
  {
    icon: ChatCircleDots,
    nome: "WhatsApp",
    sub: "Sessão pareada por QR Code",
    texto:
      "Disparos da régua e caixa de conversas integrada, com triagem entre atendimento automático e humano.",
  },
  {
    icon: QrCode,
    nome: "PIX",
    sub: "Banco Central",
    texto:
      "Cobranças com QR Code e copia-e-cola, chaves cadastradas, favoritos, agendamento e extrato conciliado.",
  },
  {
    icon: Calculator,
    nome: "TJDFT — JurisCalc",
    sub: "Cálculo oficial",
    texto:
      "Correção monetária e juros legais conforme a Lei 14.905/2024, com multas, honorários e custas no mesmo demonstrativo.",
  },
  {
    icon: ChartBar,
    nome: "Índices financeiros",
    sub: "FGV · IBGE",
    texto:
      "IGP-M e INCC-DI pela FGV; IPCA e INPC pelo IBGE — escolhidos por empresa como índice padrão da carteira.",
  },
];

export function SecaoIntegracoes() {
  return (
    <Secao id="integracoes">
      <TituloSecao
        eyebrow="Integrações"
        titulo="Conectado a quem realmente movimenta o crédito."
        descricao="Cartório, assinador digital, mensageria, meio de pagamento e índices oficiais — cada um no ponto exato do fluxo em que faz diferença."
        alinhamento="center"
      />

      <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-2 lg:grid-cols-3">
        {INTEGRACOES.map(({ icon: Icone, nome, sub, texto }) => (
          <div key={nome} className="bg-surface p-7">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-navy-900 text-white dark:bg-ice-100 dark:text-navy-900">
                <Icone size={20} weight="duotone" />
              </span>
              <div className="min-w-0">
                <p className="font-display text-[15px] font-semibold text-fg">{nome}</p>
                <p className="text-[11.5px] tracking-wide text-fg-subtle uppercase">{sub}</p>
              </div>
            </div>
            <p className="mt-4 text-[13.5px] leading-relaxed text-fg-muted">{texto}</p>
          </div>
        ))}
      </div>
    </Secao>
  );
}
