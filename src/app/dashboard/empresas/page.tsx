"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Buildings, Plus, UsersThree } from "@phosphor-icons/react";
import { Badge, Button, KpiCard, PageHeader } from "@/components/ui/primitives";
import { DataTable, type Coluna } from "@/components/ui/data-table";
import { Drawer, Modal } from "@/components/ui/overlay";
import { Field, Input, SearchInput, Select, Switch } from "@/components/ui/form";
import { Carregando } from "@/components/ui/loading";
import { useApp } from "@/store/app-store";
import { date, maskDoc, maskPhone, money, num } from "@/lib/format";
import { INDICES, type Empresa, type IndiceFinanceiro } from "@/lib/domain";

const UFS = ["AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"];

function Conteudo() {
  const params = useSearchParams();
  const { db, salvarEmpresa, setEmpresaAtiva, notificar } = useApp();
  const [busca, setBusca] = useState("");
  const [editando, setEditando] = useState<Empresa | null>(null);
  const [novaAberta, setNovaAberta] = useState(params.get("novo") === "1");

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return db.empresas;
    return db.empresas.filter(
      (e) =>
        e.nomeFantasia.toLowerCase().includes(termo) ||
        e.razaoSocial.toLowerCase().includes(termo) ||
        e.cnpj.includes(termo.replace(/\D/g, "")),
    );
  }, [db.empresas, busca]);

  const resumo = (empresaId: string) => {
    const titulos = db.titulos.filter((t) => t.empresaId === empresaId);
    const abertos = titulos.filter((t) => t.status !== "LIQUIDADO");
    return {
      titulos: titulos.length,
      devedores: new Set(titulos.map((t) => t.devedorId)).size,
      aberto: abertos.reduce((s, t) => s + t.valorAtualizado, 0),
      usuarios: db.usuarios.filter((u) => u.empresasIds.includes(empresaId)).length,
    };
  };

  const totalAberto = db.titulos
    .filter((t) => t.status !== "LIQUIDADO")
    .reduce((s, t) => s + t.valorAtualizado, 0);

  const colunas: Coluna<Empresa>[] = [
    {
      id: "nome",
      cabecalho: "Empresa",
      largura: "300px",
      ordenavel: true,
      valor: (e) => e.nomeFantasia,
      celula: (e) => (
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent">
            <Buildings size={15} weight="duotone" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-fg">{e.nomeFantasia}</p>
            <p className="truncate text-[11.5px] text-fg-muted">{e.razaoSocial}</p>
          </div>
        </div>
      ),
    },
    {
      id: "cnpj",
      cabecalho: "CNPJ",
      valor: (e) => e.cnpj,
      celula: (e) => <span className="tnum text-fg-muted">{maskDoc(e.cnpj)}</span>,
    },
    {
      id: "segmento",
      cabecalho: "Segmento",
      opcional: true,
      valor: (e) => e.segmento,
      celula: (e) => <span className="text-fg-muted">{e.segmento}</span>,
    },
    {
      id: "local",
      cabecalho: "Município",
      valor: (e) => `${e.cidade}/${e.uf}`,
      celula: (e) => (
        <span className="text-fg-muted">
          {e.cidade}/{e.uf}
        </span>
      ),
    },
    {
      id: "devedores",
      cabecalho: "Devedores",
      alinhamento: "right",
      ordenavel: true,
      valor: (e) => resumo(e.id).devedores,
      celula: (e) => <span className="tnum">{num(resumo(e.id).devedores)}</span>,
    },
    {
      id: "aberto",
      cabecalho: "Em aberto",
      alinhamento: "right",
      ordenavel: true,
      valor: (e) => resumo(e.id).aberto,
      celula: (e) => (
        <span className="tnum font-semibold text-fg">{money(resumo(e.id).aberto)}</span>
      ),
    },
    {
      id: "indice",
      cabecalho: "Índice",
      opcional: true,
      valor: (e) => INDICES[e.indiceFinanceiro].label,
      celula: (e) => <Badge tone="neutral">{INDICES[e.indiceFinanceiro].label}</Badge>,
    },
    {
      id: "protesto",
      cabecalho: "Protesto auto.",
      opcional: true,
      valor: (e) => (e.protestoAutomatico ? "sim" : "não"),
      celula: (e) =>
        e.protestoAutomatico ? (
          <Badge tone="accent">{e.diasParaProtesto} dias</Badge>
        ) : (
          <span className="text-fg-subtle">Manual</span>
        ),
    },
    {
      id: "ativa",
      cabecalho: "Situação",
      valor: (e) => (e.ativa ? "ativa" : "inativa"),
      celula: (e) => (
        <Badge tone={e.ativa ? "ok" : "neutral"} dot>
          {e.ativa ? "Ativa" : "Inativa"}
        </Badge>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        breadcrumb="Conta"
        titulo="Empresas"
        descricao="CNPJs vinculados à conta matriz, cada um com carteira, régua e parâmetros próprios."
        acoes={
          <Button onClick={() => setNovaAberta(true)}>
            <Plus size={15} weight="bold" /> Nova empresa
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Empresas"
          valor={num(db.empresas.length)}
          sub={`${num(db.empresas.filter((e) => e.ativa).length)} ativas`}
          icon={<Buildings size={17} weight="duotone" />}
        />
        <KpiCard label="Carteira consolidada" valor={money(totalAberto)} tone="accent" />
        <KpiCard label="Devedores" valor={num(db.devedores.length)} />
        <KpiCard
          label="Usuários credores"
          valor={num(db.usuarios.length)}
          icon={<UsersThree size={17} weight="duotone" />}
        />
      </div>

      <div className="mt-4 mb-4">
        <SearchInput
          className="max-w-sm"
          placeholder="Nome fantasia, razão social ou CNPJ"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <DataTable
        dados={filtradas}
        colunas={colunas}
        chave={(e) => e.id}
        storageKey="empresas"
        aoClicarLinha={setEditando}
        exportarNome="empresas"
        vazio={{ icon: <Buildings size={22} />, titulo: "Nenhuma empresa encontrada" }}
      />

      {editando && (
        <EditorEmpresa
          empresa={editando}
          onClose={() => setEditando(null)}
          onSalvar={(e) => {
            salvarEmpresa(e);
            notificar({ titulo: "Empresa atualizada", descricao: e.nomeFantasia, tone: "ok" });
            setEditando(null);
          }}
          onSelecionar={(id) => {
            setEmpresaAtiva(id);
            notificar({ titulo: "Escopo alterado", descricao: editando.nomeFantasia, tone: "info" });
            setEditando(null);
          }}
        />
      )}

      <NovaEmpresaModal aberta={novaAberta} onClose={() => setNovaAberta(false)} />
    </>
  );
}

function EditorEmpresa({
  empresa,
  onClose,
  onSalvar,
  onSelecionar,
}: {
  empresa: Empresa;
  onClose: () => void;
  onSalvar: (e: Empresa) => void;
  onSelecionar: (id: string) => void;
}) {
  const { db } = useApp();
  const [rascunho, setRascunho] = useState<Empresa>(empresa);

  const titulos = db.titulos.filter((t) => t.empresaId === empresa.id);
  const usuarios = db.usuarios.filter((u) => u.empresasIds.includes(empresa.id));

  return (
    <Drawer
      aberto
      onClose={onClose}
      titulo={rascunho.nomeFantasia}
      subtitulo={<span className="tnum">{maskDoc(rascunho.cnpj)}</span>}
      largura={600}
      rodape={
        <>
          <Button
            variant="ghost"
            size="sm"
            className="mr-auto"
            onClick={() => onSelecionar(empresa.id)}
          >
            Usar como escopo ativo
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button size="sm" onClick={() => onSalvar(rascunho)}>
            Salvar alterações
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-3 gap-3">
        <Metrica rotulo="Títulos" valor={num(titulos.length)} />
        <Metrica
          rotulo="Devedores"
          valor={num(new Set(titulos.map((t) => t.devedorId)).size)}
        />
        <Metrica rotulo="Usuários" valor={num(usuarios.length)} />
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Nome fantasia" className="sm:col-span-2">
          <Input
            value={rascunho.nomeFantasia}
            onChange={(e) => setRascunho({ ...rascunho, nomeFantasia: e.target.value })}
          />
        </Field>
        <Field label="Razão social" className="sm:col-span-2">
          <Input
            value={rascunho.razaoSocial}
            onChange={(e) => setRascunho({ ...rascunho, razaoSocial: e.target.value })}
          />
        </Field>
        <Field label="Segmento">
          <Input
            value={rascunho.segmento}
            onChange={(e) => setRascunho({ ...rascunho, segmento: e.target.value })}
          />
        </Field>
        <Field label="E-mail financeiro">
          <Input
            type="email"
            value={rascunho.email}
            onChange={(e) => setRascunho({ ...rascunho, email: e.target.value })}
          />
        </Field>
        <Field label="Cidade">
          <Input
            value={rascunho.cidade}
            onChange={(e) => setRascunho({ ...rascunho, cidade: e.target.value })}
          />
        </Field>
        <Field label="UF">
          <Select
            value={rascunho.uf}
            onChange={(e) => setRascunho({ ...rascunho, uf: e.target.value })}
          >
            {UFS.map((uf) => (
              <option key={uf} value={uf}>
                {uf}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Telefone" className="sm:col-span-2">
          <Input
            className="tnum"
            value={maskPhone(rascunho.telefone)}
            onChange={(e) =>
              setRascunho({ ...rascunho, telefone: e.target.value.replace(/\D/g, "") })
            }
          />
        </Field>
      </div>

      <div className="mt-6 border-t border-line pt-5">
        <p className="mb-4 text-[11.5px] font-semibold tracking-wider text-fg-subtle uppercase">
          Parâmetros de cobrança
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Índice de correção">
            <Select
              value={rascunho.indiceFinanceiro}
              onChange={(e) =>
                setRascunho({ ...rascunho, indiceFinanceiro: e.target.value as IndiceFinanceiro })
              }
            >
              {(Object.keys(INDICES) as IndiceFinanceiro[]).map((i) => (
                <option key={i} value={i}>
                  {INDICES[i].label} — {INDICES[i].fonte}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Multa (%)">
            <Input
              type="number"
              step="0.5"
              className="tnum"
              value={rascunho.multaPercentual}
              onChange={(e) =>
                setRascunho({ ...rascunho, multaPercentual: Number(e.target.value) })
              }
            />
          </Field>
          <Field label="Juros ao mês (%)">
            <Input
              type="number"
              step="0.1"
              className="tnum"
              value={rascunho.jurosMensalPercentual}
              onChange={(e) =>
                setRascunho({ ...rascunho, jurosMensalPercentual: Number(e.target.value) })
              }
            />
          </Field>
        </div>

        <div className="mt-5 space-y-4">
          <Switch
            checked={rascunho.protestoAutomatico}
            onChange={(v) => setRascunho({ ...rascunho, protestoAutomatico: v })}
            label="Protesto automático"
            descricao="Títulos elegíveis entram na fila de remessa sem aprovação manual."
          />
          {rascunho.protestoAutomatico && (
            <Field label="Dias de atraso até a remessa" className="max-w-[240px]">
              <Input
                type="number"
                className="tnum"
                value={rascunho.diasParaProtesto}
                onChange={(e) =>
                  setRascunho({ ...rascunho, diasParaProtesto: Number(e.target.value) })
                }
              />
            </Field>
          )}
          <Switch
            checked={rascunho.ativa}
            onChange={(v) => setRascunho({ ...rascunho, ativa: v })}
            label="Empresa ativa"
            descricao="Empresas inativas não recebem disparos nem novas remessas."
          />
        </div>
      </div>

      <p className="mt-6 text-[12px] text-fg-subtle">
        Cadastrada em {date(empresa.criadaEm, "long")}
      </p>
    </Drawer>
  );
}

function Metrica({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="rounded-lg border border-line bg-surface-2/60 p-3.5 text-center">
      <p className="tnum text-[18px] font-semibold text-fg">{valor}</p>
      <p className="mt-0.5 text-[11px] tracking-wide text-fg-subtle uppercase">{rotulo}</p>
    </div>
  );
}

function NovaEmpresaModal({ aberta, onClose }: { aberta: boolean; onClose: () => void }) {
  const { salvarEmpresa, notificar } = useApp();
  const [razaoSocial, setRazaoSocial] = useState("");
  const [nomeFantasia, setNomeFantasia] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("SP");
  const [erro, setErro] = useState<string | null>(null);

  const salvar = () => {
    const digitos = cnpj.replace(/\D/g, "");
    if (!razaoSocial.trim()) return setErro("Informe a razão social.");
    if (digitos.length !== 14) return setErro("O CNPJ deve ter 14 dígitos.");

    salvarEmpresa({
      razaoSocial: razaoSocial.trim(),
      nomeFantasia: nomeFantasia.trim() || razaoSocial.trim(),
      cnpj: digitos,
      cidade: cidade.trim(),
      uf,
    });
    notificar({ titulo: "Empresa cadastrada", descricao: nomeFantasia || razaoSocial, tone: "ok" });
    setRazaoSocial("");
    setNomeFantasia("");
    setCnpj("");
    setCidade("");
    setErro(null);
    onClose();
  };

  return (
    <Modal
      aberto={aberta}
      onClose={onClose}
      titulo="Nova empresa"
      descricao="Cada CNPJ recebe carteira, régua e parâmetros de cobrança independentes."
      rodape={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button size="sm" onClick={salvar}>
            Cadastrar empresa
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Razão social" obrigatorio className="sm:col-span-2">
          <Input value={razaoSocial} onChange={(e) => setRazaoSocial(e.target.value)} />
        </Field>
        <Field label="Nome fantasia" className="sm:col-span-2">
          <Input value={nomeFantasia} onChange={(e) => setNomeFantasia(e.target.value)} />
        </Field>
        <Field label="CNPJ" obrigatorio className="sm:col-span-2">
          <Input
            className="tnum"
            placeholder="00.000.000/0000-00"
            value={cnpj}
            onChange={(e) => setCnpj(e.target.value)}
          />
        </Field>
        <Field label="Cidade">
          <Input value={cidade} onChange={(e) => setCidade(e.target.value)} />
        </Field>
        <Field label="UF">
          <Select value={uf} onChange={(e) => setUf(e.target.value)}>
            {UFS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {erro && (
        <p className="mt-4 rounded-lg bg-danger-soft px-3 py-2.5 text-[13px] text-danger">{erro}</p>
      )}
    </Modal>
  );
}

export default function EmpresasPage() {
  return (
    <Suspense fallback={<Carregando />}>
      <Conteudo />
    </Suspense>
  );
}
