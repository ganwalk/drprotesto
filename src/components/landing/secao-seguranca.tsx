import {
  Archive,
  ClockCounterClockwise,
  Database,
  Fingerprint,
  Lock,
  UsersFour,
} from "@phosphor-icons/react/dist/ssr";
import { Secao, TituloSecao } from "./secao";

const ITENS = [
  {
    icon: UsersFour,
    titulo: "Hierarquia de contas",
    texto: "Conta matriz, contas supervisoras com plano de acesso e usuários credores por empresa.",
  },
  {
    icon: Fingerprint,
    titulo: "Permissões por módulo",
    texto: "Réguas, inserção de título, gestão de empresas, consultas, financeiro e jurídico, um a um.",
  },
  {
    icon: ClockCounterClockwise,
    titulo: "Trilha de auditoria",
    texto: "Cada evento nomeado e datado no histórico do título, do aviso enviado ao retorno de assinatura.",
  },
  {
    icon: Database,
    titulo: "Ambientes separados",
    texto: "Homologação e produção com seleção explícita, para testar remessa sem risco de envio real.",
  },
  {
    icon: Archive,
    titulo: "Backup automático",
    texto: "Dumps diários compactados enviados a bucket em nuvem, com restauração por arquivo.",
  },
  {
    icon: Lock,
    titulo: "Ações destrutivas isoladas",
    texto: "Rotinas de limpeza exigem base-alvo explícita e ficam fora do menu de uso cotidiano.",
  },
];

export function SecaoSeguranca() {
  return (
    <Secao fundo="escuro" className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #d6d3d1 1px, transparent 1px), linear-gradient(to bottom, #d6d3d1 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent)",
        }}
        aria-hidden
      />
      <div className="relative">
        <TituloSecao
          claro
          eyebrow="Governança"
          titulo="Dado de crédito é dado sensível. Tratamos como tal."
          descricao="Recuperação de crédito envolve documento, endereço, dívida e conversa privada. A plataforma foi desenhada para que cada pessoa veja apenas o que precisa — e para que toda ação deixe rastro."
        />

        <div className="mt-12 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
          {ITENS.map(({ icon: Icone, titulo, texto }) => (
            <div key={titulo}>
              <span className="grid size-10 place-items-center rounded-xl border border-white/12 bg-white/8 text-steel-300">
                <Icone size={19} weight="duotone" />
              </span>
              <h3 className="font-display mt-4 text-[15px] font-semibold text-white">{titulo}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-white/55">{texto}</p>
            </div>
          ))}
        </div>
      </div>
    </Secao>
  );
}
