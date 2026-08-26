"use client";

import { useState } from "react";
import { Plus, Scales, UserFocus } from "@phosphor-icons/react";
import { Avatar, Badge, Button, PageHeader, Segmented } from "@/components/ui/primitives";
import { DataTable, type Coluna } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/overlay";
import { Field, Input, Select } from "@/components/ui/form";
import { useApp } from "@/store/app-store";
import { maskDoc, maskPhone, num } from "@/lib/format";
import type { Advogado, Testemunha } from "@/lib/domain";

const UFS = ["AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"];

export default function AdvogadosTestemunhasPage() {
  const { db, salvarAdvogado, salvarTestemunha, notificar } = useApp();
  const [aba, setAba] = useState<"advogados" | "testemunhas">("advogados");
  const [modalAberto, setModalAberto] = useState(false);

  const colunasAdvogados: Coluna<Advogado>[] = [
    {
      id: "nome",
      cabecalho: "Advogado",
      largura: "300px",
      ordenavel: true,
      valor: (a) => a.nome,
      celula: (a) => (
        <div className="flex items-center gap-2.5">
          <Avatar nome={a.nome} size={30} />
          <div className="min-w-0">
            <p className="truncate font-medium text-fg">{a.nome}</p>
            <p className="truncate text-[11.5px] text-fg-muted">{a.email}</p>
          </div>
        </div>
      ),
    },
    {
      id: "oab",
      cabecalho: "OAB",
      ordenavel: true,
      valor: (a) => `${a.ufOab}${a.oab}`,
      celula: (a) => (
        <span className="tnum font-medium text-fg">
          {a.ufOab} {a.oab}
        </span>
      ),
    },
    {
      id: "telefone",
      cabecalho: "Telefone",
      valor: (a) => a.telefone,
      celula: (a) => <span className="tnum text-fg-muted">{maskPhone(a.telefone)}</span>,
    },
    {
      id: "processos",
      cabecalho: "Processos",
      alinhamento: "right",
      ordenavel: true,
      valor: (a) => db.processos.filter((p) => p.advogadoId === a.id).length,
      celula: (a) => (
        <span className="tnum">{num(db.processos.filter((p) => p.advogadoId === a.id).length)}</span>
      ),
    },
    {
      id: "ativo",
      cabecalho: "Situação",
      valor: (a) => (a.ativo ? "ativo" : "inativo"),
      celula: (a) => (
        <Badge tone={a.ativo ? "ok" : "neutral"} dot>
          {a.ativo ? "Ativo" : "Inativo"}
        </Badge>
      ),
    },
  ];

  const colunasTestemunhas: Coluna<Testemunha>[] = [
    {
      id: "nome",
      cabecalho: "Testemunha",
      largura: "300px",
      ordenavel: true,
      valor: (t) => t.nome,
      celula: (t) => (
        <div className="flex items-center gap-2.5">
          <Avatar nome={t.nome} size={30} />
          <span className="truncate font-medium text-fg">{t.nome}</span>
        </div>
      ),
    },
    {
      id: "documento",
      cabecalho: "CPF",
      valor: (t) => t.documento,
      celula: (t) => <span className="tnum text-fg-muted">{maskDoc(t.documento)}</span>,
    },
    {
      id: "email",
      cabecalho: "E-mail",
      valor: (t) => t.email ?? "",
      celula: (t) => <span className="truncate text-fg-muted">{t.email ?? "—"}</span>,
    },
    {
      id: "telefone",
      cabecalho: "Telefone",
      valor: (t) => t.telefone ?? "",
      celula: (t) => (
        <span className="tnum text-fg-muted">{t.telefone ? maskPhone(t.telefone) : "—"}</span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        breadcrumb="Jurídico · Cadastro"
        titulo="Advogados e testemunhas"
        descricao="Cadastro usado na geração dos documentos jurídicos — petições, termos de acordo e instrumentos de protesto."
        acoes={
          <Button onClick={() => setModalAberto(true)}>
            <Plus size={15} weight="bold" />
            {aba === "advogados" ? "Novo advogado" : "Nova testemunha"}
          </Button>
        }
      />

      <div className="mb-4">
        <Segmented
          value={aba}
          onChange={setAba}
          options={[
            { value: "advogados" as const, label: "Advogados", count: db.advogados.length },
            { value: "testemunhas" as const, label: "Testemunhas", count: db.testemunhas.length },
          ]}
        />
      </div>

      {aba === "advogados" ? (
        <DataTable
          dados={db.advogados}
          colunas={colunasAdvogados}
          chave={(a) => a.id}
          storageKey="advogados"
          exportarNome="advogados"
          vazio={{ icon: <Scales size={22} />, titulo: "Nenhum advogado cadastrado" }}
        />
      ) : (
        <DataTable
          dados={db.testemunhas}
          colunas={colunasTestemunhas}
          chave={(t) => t.id}
          storageKey="testemunhas"
          exportarNome="testemunhas"
          vazio={{ icon: <UserFocus size={22} />, titulo: "Nenhuma testemunha cadastrada" }}
        />
      )}

      {aba === "advogados" ? (
        <NovoAdvogadoModal
          aberto={modalAberto}
          onClose={() => setModalAberto(false)}
          onSalvar={(a) => {
            salvarAdvogado(a);
            notificar({ titulo: "Advogado cadastrado", descricao: a.nome ?? "", tone: "ok" });
            setModalAberto(false);
          }}
        />
      ) : (
        <NovaTestemunhaModal
          aberto={modalAberto}
          onClose={() => setModalAberto(false)}
          onSalvar={(t) => {
            salvarTestemunha(t);
            notificar({ titulo: "Testemunha cadastrada", descricao: t.nome ?? "", tone: "ok" });
            setModalAberto(false);
          }}
        />
      )}
    </>
  );
}

function NovoAdvogadoModal({
  aberto,
  onClose,
  onSalvar,
}: {
  aberto: boolean;
  onClose: () => void;
  onSalvar: (a: Partial<Advogado>) => void;
}) {
  const [nome, setNome] = useState("");
  const [oab, setOab] = useState("");
  const [ufOab, setUfOab] = useState("SP");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  const salvar = () => {
    if (!nome.trim()) return setErro("Informe o nome do advogado.");
    if (!oab.trim()) return setErro("Informe o número da OAB.");
    onSalvar({
      nome: nome.trim(),
      oab: oab.replace(/\D/g, ""),
      ufOab,
      email: email.trim(),
      telefone: telefone.replace(/\D/g, ""),
    });
    setNome("");
    setOab("");
    setEmail("");
    setTelefone("");
    setErro(null);
  };

  return (
    <Modal
      aberto={aberto}
      onClose={onClose}
      titulo="Novo advogado"
      descricao="Aparece como responsável nos processos e assina as peças geradas."
      rodape={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button size="sm" onClick={salvar}>
            Cadastrar
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome completo" obrigatorio className="sm:col-span-2">
          <Input value={nome} onChange={(e) => setNome(e.target.value)} />
        </Field>
        <Field label="Número da OAB" obrigatorio>
          <Input className="tnum" value={oab} onChange={(e) => setOab(e.target.value)} />
        </Field>
        <Field label="Seccional (UF)">
          <Select value={ufOab} onChange={(e) => setUfOab(e.target.value)}>
            {UFS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="E-mail">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Telefone">
          <Input className="tnum" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
        </Field>
      </div>
      {erro && (
        <p className="mt-4 rounded-lg bg-danger-soft px-3 py-2.5 text-[13px] text-danger">{erro}</p>
      )}
    </Modal>
  );
}

function NovaTestemunhaModal({
  aberto,
  onClose,
  onSalvar,
}: {
  aberto: boolean;
  onClose: () => void;
  onSalvar: (t: Partial<Testemunha>) => void;
}) {
  const [nome, setNome] = useState("");
  const [documento, setDocumento] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  const salvar = () => {
    if (!nome.trim()) return setErro("Informe o nome da testemunha.");
    if (documento.replace(/\D/g, "").length !== 11) return setErro("O CPF deve ter 11 dígitos.");
    onSalvar({
      nome: nome.trim(),
      documento: documento.replace(/\D/g, ""),
      email: email.trim() || null,
      telefone: telefone.replace(/\D/g, "") || null,
    });
    setNome("");
    setDocumento("");
    setEmail("");
    setTelefone("");
    setErro(null);
  };

  return (
    <Modal
      aberto={aberto}
      onClose={onClose}
      titulo="Nova testemunha"
      descricao="Consta na qualificação dos termos de acordo assinados eletronicamente."
      rodape={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button size="sm" onClick={salvar}>
            Cadastrar
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome completo" obrigatorio className="sm:col-span-2">
          <Input value={nome} onChange={(e) => setNome(e.target.value)} />
        </Field>
        <Field label="CPF" obrigatorio className="sm:col-span-2">
          <Input
            className="tnum"
            placeholder="000.000.000-00"
            value={documento}
            onChange={(e) => setDocumento(e.target.value)}
          />
        </Field>
        <Field label="E-mail">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Telefone">
          <Input className="tnum" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
        </Field>
      </div>
      {erro && (
        <p className="mt-4 rounded-lg bg-danger-soft px-3 py-2.5 text-[13px] text-danger">{erro}</p>
      )}
    </Modal>
  );
}
