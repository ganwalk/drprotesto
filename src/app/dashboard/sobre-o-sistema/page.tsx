"use client";

import { useState } from "react";
import {
  ArrowCounterClockwise,
  CloudArrowUp,
  Database,
  DownloadSimple,
  Envelope,
  Info,
  ShieldWarning,
  Trash,
  Warning,
} from "@phosphor-icons/react";
import { Badge, Button, Card, CardHeader, PageHeader } from "@/components/ui/primitives";
import { Modal } from "@/components/ui/overlay";
import { Field, Input, Select, Switch } from "@/components/ui/form";
import { useApp } from "@/store/app-store";
import { IS_DEMO } from "@/services/datasource";
import { date, num } from "@/lib/format";

type Base = "TESTE" | "PRODUCAO";

const ROTINAS = [
  {
    id: "titulos",
    nome: "Apagar todos os títulos e devedores",
    descricao: "Remove a carteira inteira da base selecionada, incluindo histórico e avisos.",
  },
  {
    id: "devedores",
    nome: "Apagar somente devedores",
    descricao: "Mantém as empresas e configurações; remove devedores sem título vinculado.",
  },
  {
    id: "empresas",
    nome: "Apagar somente empresas",
    descricao: "Remove os CNPJs cadastrados. Exige carteira vazia.",
  },
  {
    id: "completa",
    nome: "Limpar base de teste completa",
    descricao: "Restaura a base de homologação ao estado inicial de fábrica.",
  },
];

export default function SobreSistemaPage() {
  const { db, restaurarBase, notificar } = useApp();
  const [baseLeitura, setBaseLeitura] = useState<Base>("PRODUCAO");
  const [baseEscrita, setBaseEscrita] = useState<Base>("PRODUCAO");
  const [baseAlvo, setBaseAlvo] = useState<Base>("TESTE");
  const [backupEmail, setBackupEmail] = useState(true);
  const [backupBucket, setBackupBucket] = useState(true);
  const [emailBackup, setEmailBackup] = useState("ti@grupoaurora.com.br");
  const [confirmando, setConfirmando] = useState<(typeof ROTINAS)[number] | null>(null);
  const [textoConfirmacao, setTextoConfirmacao] = useState("");

  const registros = {
    empresas: db.empresas.length,
    devedores: db.devedores.length,
    titulos: db.titulos.length,
    avisos: db.avisos.length,
    acordos: db.acordos.length,
    processos: db.processos.length,
  };
  const total = Object.values(registros).reduce((s, n) => s + n, 0);

  const executar = () => {
    if (!confirmando) return;
    if (textoConfirmacao !== baseAlvo) return;

    if (confirmando.id === "completa" && IS_DEMO) {
      void restaurarBase();
    } else {
      notificar({
        titulo: "Rotina não executada",
        descricao:
          "Ações destrutivas exigem confirmação do backend. Nesta demonstração apenas a restauração da base local está habilitada.",
        tone: "warn",
      });
    }
    setConfirmando(null);
    setTextoConfirmacao("");
  };

  const exportarBase = () => {
    const blob = new Blob([JSON.stringify(db, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `drprotesto-base-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notificar({ titulo: "Base exportada", descricao: "Arquivo JSON salvo localmente.", tone: "ok" });
  };

  return (
    <>
      <PageHeader
        breadcrumb="Conta · Administração"
        titulo="Sobre o sistema"
        descricao="Painel técnico: roteamento entre bases, rotinas de manutenção, backup e restauração."
      />

      <Card className="mb-4 border-danger/30 bg-danger-soft/40 p-5">
        <div className="flex gap-3">
          <ShieldWarning size={20} weight="duotone" className="mt-0.5 shrink-0 text-danger" />
          <div>
            <p className="text-[13.5px] font-semibold text-danger">
              Área restrita a administradores
            </p>
            <p className="mt-1.5 max-w-4xl text-[12.5px] leading-relaxed text-fg-muted">
              As rotinas desta tela afetam dados de produção de forma irreversível. Em produção,
              este painel deve viver em rota separada, exigir perfil de super-administrador validado
              no backend e registrar cada execução na trilha de auditoria com autor, base-alvo e
              contagem de registros afetados — não basta escondê-lo do menu.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Roteamento de bases"
            description="Define qual base responde às leituras e qual recebe as escritas desta sessão."
            icon={<Database size={15} weight="duotone" />}
          />
          <div className="p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Base de leitura">
                <Select
                  value={baseLeitura}
                  onChange={(e) => setBaseLeitura(e.target.value as Base)}
                >
                  <option value="PRODUCAO">Produção</option>
                  <option value="TESTE">Base Teste (homologação)</option>
                </Select>
              </Field>
              <Field label="Base de escrita">
                <Select
                  value={baseEscrita}
                  onChange={(e) => setBaseEscrita(e.target.value as Base)}
                >
                  <option value="PRODUCAO">Produção</option>
                  <option value="TESTE">Base Teste (homologação)</option>
                </Select>
              </Field>
            </div>

            {baseLeitura !== baseEscrita && (
              <div className="mt-4 flex gap-3 rounded-lg border border-warn/30 bg-warn-soft px-4 py-3.5">
                <Warning size={17} weight="duotone" className="mt-0.5 shrink-0 text-warn" />
                <p className="text-[12.5px] leading-relaxed text-fg-muted">
                  <strong className="font-semibold text-warn">Leitura e escrita divergentes.</strong>{" "}
                  A sessão lê de <strong className="font-semibold text-fg">{baseLeitura}</strong> e
                  grava em <strong className="font-semibold text-fg">{baseEscrita}</strong>. Use
                  apenas para migração assistida — em operação normal as duas devem apontar para a
                  mesma base.
                </p>
              </div>
            )}

            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-line pt-5 sm:grid-cols-3">
              {Object.entries(registros).map(([chave, valor]) => (
                <div key={chave} className="rounded-lg bg-surface-2/60 p-3">
                  <p className="text-[11px] tracking-wide text-fg-subtle uppercase">{chave}</p>
                  <p className="tnum mt-1 text-[16px] font-semibold text-fg">{num(valor)}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[12px] text-fg-subtle">
              {num(total)} registros na base atualmente carregada.
            </p>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Backup automático"
            description="Dumps lógicos compactados (.sql.gz)."
            icon={<CloudArrowUp size={15} weight="duotone" />}
          />
          <div className="space-y-4 p-5">
            <div className="rounded-lg bg-surface-2/60 p-3.5">
              <p className="text-[11px] font-medium tracking-wide text-fg-subtle uppercase">
                Rotina diária
              </p>
              <p className="tnum mt-1 text-[13px] font-medium text-fg">
                12:00 e 17:30 · horário de Brasília
              </p>
              <p className="mt-1 text-[11.5px] text-fg-muted">
                Último envio bem-sucedido em {date(new Date(), "datetime")}
              </p>
            </div>

            <Switch
              checked={backupBucket}
              onChange={setBackupBucket}
              label="Enviar para bucket em nuvem"
              descricao="Armazenamento versionado com retenção de 30 dias."
            />
            <Switch
              checked={backupEmail}
              onChange={setBackupEmail}
              label="Enviar cópia por e-mail"
              descricao="Anexo compactado para o endereço abaixo."
            />
            {backupEmail && (
              <Field label="E-mail de destino">
                <Input
                  type="email"
                  value={emailBackup}
                  onChange={(e) => setEmailBackup(e.target.value)}
                />
              </Field>
            )}

            <div className="space-y-2 border-t border-line pt-4">
              <Button variant="outline" size="sm" className="w-full" onClick={exportarBase}>
                <DownloadSimple size={14} /> Baixar snapshot agora
              </Button>
              <Button variant="ghost" size="sm" className="w-full">
                <Envelope size={14} /> Enviar backup por e-mail
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Restauração"
            description="Recarrega uma base a partir de um arquivo de backup."
            icon={<ArrowCounterClockwise size={15} weight="duotone" />}
          />
          <div className="p-5">
            <Field label="Base de destino" hint="A restauração afeta somente a base selecionada.">
              <Select value={baseAlvo} onChange={(e) => setBaseAlvo(e.target.value as Base)}>
                <option value="TESTE">Base Teste (homologação)</option>
                <option value="PRODUCAO">Produção</option>
              </Select>
            </Field>

            <div className="mt-4 rounded-lg border-2 border-dashed border-line-strong px-4 py-8 text-center">
              <p className="text-[13px] font-medium text-fg">Arraste o arquivo .sql.gz</p>
              <p className="mt-1 text-[12px] text-fg-muted">ou clique para selecionar</p>
            </div>

            {IS_DEMO && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full"
                onClick={() => {
                  void restaurarBase();
                }}
              >
                <ArrowCounterClockwise size={14} /> Restaurar base de demonstração
              </Button>
            )}
          </div>
        </Card>

        <Card className="border-danger/25">
          <CardHeader
            title="Rotinas destrutivas"
            description="Sem desfazer. Confirme sempre a base-alvo antes de executar."
            icon={<Trash size={15} weight="duotone" />}
            actions={
              <Badge tone={baseAlvo === "PRODUCAO" ? "danger" : "warn"} dot>
                Alvo: {baseAlvo === "PRODUCAO" ? "Produção" : "Teste"}
              </Badge>
            }
          />
          <div className="divide-y divide-line">
            {ROTINAS.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                <div className="min-w-[200px] flex-1">
                  <p className="text-[13px] font-medium text-fg">{r.nome}</p>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-fg-muted">{r.descricao}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-danger hover:bg-danger-soft"
                  onClick={() => {
                    setConfirmando(r);
                    setTextoConfirmacao("");
                  }}
                >
                  Executar
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-4 p-5">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <Info size={16} weight="duotone" className="text-accent" />
          <Meta rotulo="Versão" valor="2.4.1" />
          <Meta rotulo="Fonte de dados" valor={IS_DEMO ? "Demonstração local" : "API REST"} />
          <Meta rotulo="Ambiente CENPROT" valor={db.integracoes.cenprot.ambiente} />
          <Meta rotulo="Motor de cálculo" valor={db.integracoes.tjdft.motor} />
          <Meta rotulo="Assinador" valor={db.integracoes.assinatura.provedor} />
        </div>
      </Card>

      <Modal
        aberto={Boolean(confirmando)}
        onClose={() => setConfirmando(null)}
        titulo="Confirmar rotina destrutiva"
        descricao={confirmando?.nome}
        largura="sm"
        rodape={
          <>
            <Button variant="ghost" size="sm" onClick={() => setConfirmando(null)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={textoConfirmacao !== baseAlvo}
              onClick={executar}
            >
              <Trash size={14} /> Executar na base {baseAlvo}
            </Button>
          </>
        }
      >
        <div className="rounded-lg border border-danger/30 bg-danger-soft p-4">
          <p className="text-[13px] leading-relaxed text-danger">
            Esta ação apaga dados de forma permanente na base{" "}
            <strong className="font-semibold">{baseAlvo}</strong> e não pode ser desfeita. Verifique
            se existe um backup recente antes de continuar.
          </p>
        </div>

        <Field
          className="mt-4"
          label={`Digite ${baseAlvo} para confirmar`}
          hint="A confirmação por digitação evita execução acidental."
        >
          <Input
            value={textoConfirmacao}
            onChange={(e) => setTextoConfirmacao(e.target.value.toUpperCase())}
            placeholder={baseAlvo}
          />
        </Field>
      </Modal>
    </>
  );
}

function Meta({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div>
      <p className="text-[10.5px] tracking-wide text-fg-subtle uppercase">{rotulo}</p>
      <p className="tnum mt-0.5 text-[12.5px] font-medium text-fg">{valor}</p>
    </div>
  );
}
