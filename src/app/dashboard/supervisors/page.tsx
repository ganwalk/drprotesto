"use client";

import { Buildings, CheckCircle, ShieldCheck, UsersThree, XCircle } from "@phosphor-icons/react";
import { Avatar, Badge, Card, CardHeader, KpiCard, PageHeader } from "@/components/ui/primitives";
import { useApp } from "@/store/app-store";
import { date, maskDoc, num } from "@/lib/format";
import { PERMISSOES_LABELS, type PermissoesCredor } from "@/lib/domain";

/** Funcionalidades do plano de acesso, como listadas no painel do supervisor. */
const FUNCIONALIDADES = [
  { nome: "Acesso PIX", ativa: true },
  { nome: "Escanear boleto", ativa: true },
  { nome: "Senha eletrônica", ativa: true },
  { nome: "PIN de transação", ativa: true },
  { nome: "Gestão de dispositivos", ativa: true },
  { nome: "Remessa ao CENPROT", ativa: true },
  { nome: "Assinatura eletrônica de acordos", ativa: true },
  { nome: "Módulo jurídico", ativa: true },
  { nome: "Importação em massa", ativa: true },
  { nome: "Consultas cadastrais", ativa: true },
  { nome: "Calculadora TJDFT", ativa: true },
  { nome: "Exportação de relatórios", ativa: true },
  { nome: "Gestão de empresas", ativa: true },
  { nome: "Gestão de usuários credores", ativa: true },
  { nome: "Painel administrativo do sistema", ativa: true },
  { nome: "API pública de integração", ativa: false },
  { nome: "Conector de ERP dedicado", ativa: false },
];

export default function SupervisorPage() {
  const { db, sessao } = useApp();
  const usuario = db.usuarios.find((u) => u.id === sessao?.usuarioId) ?? db.usuarioAtual;
  const chaves = Object.keys(PERMISSOES_LABELS) as (keyof PermissoesCredor)[];
  const ativas = FUNCIONALIDADES.filter((f) => f.ativa).length;

  return (
    <>
      <PageHeader
        breadcrumb="Conta"
        titulo="Supervisor"
        descricao="Dados da conta matriz, da conta supervisora em uso e o plano de acesso vigente."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Plano de acesso"
          valor={db.contaSupervisora.plano}
          sub={`${ativas} funcionalidades ativas`}
          icon={<ShieldCheck size={17} weight="duotone" />}
          tone="accent"
        />
        <KpiCard
          label="Empresas vinculadas"
          valor={num(db.empresas.length)}
          icon={<Buildings size={17} weight="duotone" />}
        />
        <KpiCard
          label="Usuários credores"
          valor={num(db.usuarios.length)}
          icon={<UsersThree size={17} weight="duotone" />}
        />
        <KpiCard
          label="Conta criada em"
          valor={date(db.contaSupervisora.criadaEm)}
          sub={`matriz desde ${date(db.contaMatriz.criadaEm)}`}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Conta matriz"
            description="Titular do contrato e responsável pelas contas supervisoras."
            icon={<Buildings size={15} weight="duotone" />}
          />
          <div className="grid gap-x-6 gap-y-3.5 p-5 sm:grid-cols-2">
            <Campo rotulo="Razão social" valor={db.contaMatriz.nome} largo />
            <Campo rotulo="CNPJ" valor={maskDoc(db.contaMatriz.documento)} />
            <Campo rotulo="Plano" valor={db.contaMatriz.plano} />
            <Campo rotulo="Criada em" valor={date(db.contaMatriz.criadaEm, "long")} largo />
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Conta supervisora em uso"
            description="Escopo operacional desta sessão."
            icon={<ShieldCheck size={15} weight="duotone" />}
            actions={<Badge tone="accent">{db.contaSupervisora.plano}</Badge>}
          />
          <div className="grid gap-x-6 gap-y-3.5 p-5 sm:grid-cols-2">
            <Campo rotulo="Nome" valor={db.contaSupervisora.nome} largo />
            <Campo rotulo="CNPJ" valor={maskDoc(db.contaSupervisora.documento)} />
            <Campo rotulo="Vinculada a" valor={db.contaMatriz.nome} />
            <Campo rotulo="Criada em" valor={date(db.contaSupervisora.criadaEm, "long")} largo />
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader title="Usuário da sessão" />
          <div className="p-5">
            <div className="flex items-center gap-3">
              <Avatar nome={usuario.nome} size={48} />
              <div className="min-w-0">
                <p className="truncate font-display text-[15px] font-semibold text-fg">
                  {usuario.nome}
                </p>
                <p className="truncate text-[12.5px] text-fg-muted">{usuario.cargo}</p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              <Campo rotulo="E-mail" valor={usuario.email} />
              <Campo rotulo="Perfil" valor={usuario.perfil} />
              <Campo rotulo="Último acesso" valor={date(usuario.ultimoAcesso, "datetime")} />
            </div>

            <div className="mt-5 border-t border-line pt-4">
              <p className="mb-3 text-[11.5px] font-semibold tracking-wider text-fg-subtle uppercase">
                Permissões do usuário
              </p>
              <div className="space-y-2">
                {chaves.map((chave) => (
                  <div key={chave} className="flex items-center gap-2">
                    {usuario.permissoes[chave] ? (
                      <CheckCircle size={14} weight="fill" className="shrink-0 text-ok" />
                    ) : (
                      <XCircle size={14} weight="fill" className="shrink-0 text-fg-subtle" />
                    )}
                    <span
                      className={`text-[12.5px] ${usuario.permissoes[chave] ? "text-fg" : "text-fg-subtle"}`}
                    >
                      {PERMISSOES_LABELS[chave]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            title="Funcionalidades do plano"
            description={`${ativas} de ${FUNCIONALIDADES.length} liberadas no plano ${db.contaSupervisora.plano}.`}
          />
          <div className="grid gap-x-6 gap-y-2.5 p-5 sm:grid-cols-2">
            {FUNCIONALIDADES.map((f) => (
              <div key={f.nome} className="flex items-center gap-2">
                {f.ativa ? (
                  <CheckCircle size={15} weight="fill" className="shrink-0 text-ok" />
                ) : (
                  <XCircle size={15} weight="fill" className="shrink-0 text-fg-subtle" />
                )}
                <span
                  className={`text-[13px] ${f.ativa ? "text-fg" : "text-fg-subtle line-through"}`}
                >
                  {f.nome}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-line bg-surface-2/60 px-5 py-4">
            <p className="text-[12.5px] leading-relaxed text-fg-muted">
              Funcionalidades bancárias (PIX, senha eletrônica, PIN e dispositivos) são fornecidas
              pelo provedor de Banking-as-a-Service vinculado ao módulo de contas. Alterações de
              plano são feitas pelo titular da conta matriz junto ao time comercial.
            </p>
          </div>
        </Card>
      </div>
    </>
  );
}

function Campo({
  rotulo,
  valor,
  largo,
}: {
  rotulo: string;
  valor: string;
  largo?: boolean;
}) {
  return (
    <div className={largo ? "sm:col-span-2" : ""}>
      <p className="text-[11px] font-medium tracking-wide text-fg-subtle uppercase">{rotulo}</p>
      <p className="tnum mt-0.5 text-[13px] text-fg">{valor}</p>
    </div>
  );
}
