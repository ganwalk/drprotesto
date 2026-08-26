import type { Icon } from "@phosphor-icons/react";
import {
  Bank,
  Buildings,
  Calculator,
  ChartLineUp,
  ChatCircleDots,
  Certificate,
  CurrencyCircleDollar,
  Envelope,
  Gavel,
  GearSix,
  Handshake,
  Info,
  Link as LinkIcon,
  MagnifyingGlass,
  Receipt,
  Scales,
  ShieldCheck,
  Stamp,
  UploadSimple,
  UsersThree,
} from "@phosphor-icons/react";

export interface ItemNav {
  href: string;
  label: string;
  icon: Icon;
  /** Exibido como contador quando a tela tem pendências. */
  badge?: "titulosProtesto" | "conversasNaoLidas" | "acordosAssinatura";
}

export interface GrupoNav {
  titulo: string;
  itens: ItemNav[];
}

export const NAV: GrupoNav[] = [
  {
    titulo: "Credor",
    itens: [
      { href: "/dashboard", label: "Dashboard de títulos", icon: ChartLineUp },
      { href: "/dashboard/carteira-devedores", label: "Carteira de devedores", icon: Buildings },
      {
        href: "/dashboard/controle-titulo",
        label: "Controle de títulos",
        icon: Stamp,
        badge: "titulosProtesto",
      },
      { href: "/dashboard/regua", label: "Régua de cobrança", icon: Envelope },
      { href: "/dashboard/usuarios-credores", label: "Usuários credores", icon: UsersThree },
    ],
  },
  {
    titulo: "Relatórios e cadastro",
    itens: [
      { href: "/dashboard/relatorio-avisos", label: "Relatório de avisos", icon: Receipt },
      {
        href: "/dashboard/importar-devedores-juridicos",
        label: "Importar devedores",
        icon: UploadSimple,
      },
    ],
  },
  {
    titulo: "Jurídico",
    itens: [
      {
        href: "/dashboard/gestao-acordos",
        label: "Gestão de acordos",
        icon: Handshake,
        badge: "acordosAssinatura",
      },
      { href: "/dashboard/juridico-processos", label: "Gestão de processos", icon: Gavel },
      {
        href: "/dashboard/gestao-advogados-testemunhas",
        label: "Advogados e testemunhas",
        icon: Scales,
      },
    ],
  },
  {
    titulo: "Financeiro",
    itens: [
      { href: "/dashboard/pix", label: "Área PIX", icon: Bank },
      { href: "/dashboard/pix/configurar-link", label: "Gerar cobrança", icon: CurrencyCircleDollar },
      { href: "/dashboard/pix/links-cobranca", label: "Links de cobrança", icon: LinkIcon },
      { href: "/dashboard/extract", label: "Extrato bancário", icon: Receipt },
      { href: "/dashboard/financeiro-credor/despesas", label: "Despesas", icon: Receipt },
    ],
  },
  {
    titulo: "Consultas",
    itens: [
      { href: "/dashboard/consult-cpf-cnpj", label: "Dados básicos", icon: MagnifyingGlass },
      {
        href: "/dashboard/calculadora-atualizacao-monetaria",
        label: "Calculadora monetária",
        icon: Calculator,
      },
    ],
  },
  {
    titulo: "Conta",
    itens: [
      { href: "/dashboard/empresas", label: "Empresas", icon: Buildings },
      {
        href: "/dashboard/whatsapp-web/conversas",
        label: "WhatsApp",
        icon: ChatCircleDots,
        badge: "conversasNaoLidas",
      },
      { href: "/dashboard/integracoes", label: "Integrações", icon: Certificate },
      { href: "/dashboard/configuracoes", label: "Configurações", icon: GearSix },
      { href: "/dashboard/supervisors", label: "Supervisor", icon: ShieldCheck },
      { href: "/dashboard/sobre-o-sistema", label: "Sobre o sistema", icon: Info },
    ],
  },
];
