import Link from "next/link";
import {
  ArrowUpRight,
  Bank,
  Buildings,
  ChartLineUp,
  ChatCircleDots,
  Envelope,
  Gavel,
  Handshake,
  Calculator,
  MagnifyingGlass,
  Receipt,
  Stamp,
  UploadSimple,
  UsersThree,
} from "@phosphor-icons/react/dist/ssr";
import { Secao, TituloSecao } from "./secao";

const MODULOS = [
  {
    icon: ChartLineUp,
    titulo: "Dashboard de títulos",
    texto: "Indicadores por status, aging da carteira e curva de recuperação, filtráveis por empresa e período.",
    href: "/dashboard",
  },
  {
    icon: Buildings,
    titulo: "Carteira de devedores",
    texto: "Visão consolidada por devedor, com status junto ao CENPROT, faixa de valor e dias em débito.",
    href: "/dashboard/carteira-devedores",
  },
  {
    icon: Stamp,
    titulo: "Controle de títulos",
    texto: "CRUD completo do título, histórico de eventos e envio a protesto em lote.",
    href: "/dashboard/controle-titulo",
  },
  {
    icon: Envelope,
    titulo: "Régua de cobrança",
    texto: "Sete fases, templates por canal, janela de horário e bloqueio de domingos e feriados.",
    href: "/dashboard/regua",
  },
  {
    icon: Handshake,
    titulo: "Gestão de acordos",
    texto: "Funil de negociação com assinatura digital, parcelamento e baixa de protesto.",
    href: "/dashboard/gestao-acordos",
  },
  {
    icon: Gavel,
    titulo: "Processos judiciais",
    texto: "Número CNJ, comarca, vara, custas, prioridade, movimentações e anexos.",
    href: "/dashboard/juridico-processos",
  },
  {
    icon: Bank,
    titulo: "Área PIX",
    texto: "Cobrança por QR Code, copia-e-cola, chaves cadastradas, favoritos e agendamento.",
    href: "/dashboard/pix",
  },
  {
    icon: Receipt,
    titulo: "Extrato e despesas",
    texto: "Lançamentos por período com exportação, e controle de custas e emolumentos por empresa.",
    href: "/dashboard/extract",
  },
  {
    icon: ChatCircleDots,
    titulo: "WhatsApp integrado",
    texto: "Caixa de conversas com triagem por engajamento e resposta humana quando necessário.",
    href: "/dashboard/whatsapp-web/conversas",
  },
  {
    icon: MagnifyingGlass,
    titulo: "Consultas",
    texto: "Dados cadastrais por CPF/CNPJ e pesquisa de protestos por documento, título ou protocolo.",
    href: "/dashboard/consult-cpf-cnpj",
  },
  {
    icon: Calculator,
    titulo: "Calculadora monetária",
    texto: "Correção, juros legais da Lei 14.905/2024, multas, honorários e custas via API do TJDFT.",
    href: "/dashboard/calculadora-atualizacao-monetaria",
  },
  {
    icon: UploadSimple,
    titulo: "Importação em massa",
    texto: "Planilha de 23 colunas, vínculo automático de processo por CNJ e desfazer por lote.",
    href: "/dashboard/importar-devedores-juridicos",
  },
  {
    icon: UsersThree,
    titulo: "Usuários e permissões",
    texto: "Perfis granulares por módulo e por empresa, com trilha de último acesso.",
    href: "/dashboard/usuarios-credores",
  },
  {
    icon: Envelope,
    titulo: "Relatório de avisos",
    texto: "Taxa de entrega e leitura por canal, com o motivo exato de cada falha.",
    href: "/dashboard/relatorio-avisos",
  },
];

export function SecaoModulos() {
  return (
    <Secao id="modulos">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <TituloSecao
          eyebrow="Módulos"
          titulo="Tudo o que a operação de crédito precisa, no mesmo lugar."
          descricao="Cada módulo abaixo está funcional na demonstração. Clique para abrir."
        />
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-lg border border-line-strong px-4 py-2.5 text-[13.5px] font-medium text-fg transition-colors hover:border-accent hover:bg-surface-2"
        >
          Abrir a plataforma
          <ArrowUpRight size={14} weight="bold" />
        </Link>
      </div>

      <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {MODULOS.map(({ icon: Icone, titulo, texto, href }) => (
          <Link
            key={titulo}
            href={href}
            className="group relative bg-surface p-6 transition-colors hover:bg-surface-2"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-accent-soft text-accent transition-colors group-hover:bg-accent group-hover:text-accent-fg">
                <Icone size={19} weight="duotone" />
              </span>
              <ArrowUpRight
                size={15}
                weight="bold"
                className="mt-1 text-fg-subtle opacity-0 transition-opacity group-hover:opacity-100"
              />
            </div>
            <h3 className="font-display mt-4 text-[15px] font-semibold text-fg">{titulo}</h3>
            <p className="mt-2 text-[13.5px] leading-relaxed text-fg-muted">{texto}</p>
          </Link>
        ))}
      </div>
    </Secao>
  );
}
