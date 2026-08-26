"use client";

import { useMemo, useState } from "react";
import { Plus, Trash, UsersThree } from "@phosphor-icons/react";
import { Avatar, Badge, Button, Divider, PageHeader } from "@/components/ui/primitives";
import { DataTable, type Coluna } from "@/components/ui/data-table";
import { Drawer, Modal } from "@/components/ui/overlay";
import { Checkbox, Field, Input, SearchInput, Select, Switch } from "@/components/ui/form";
import { useApp } from "@/store/app-store";
import { date } from "@/lib/format";
import { PERMISSOES_LABELS, type Perfil, type PermissoesCredor, type Usuario } from "@/lib/domain";

const PERFIS: Record<Perfil, { label: string; descricao: string }> = {
  MASTER: { label: "Master", descricao: "Acesso total, inclusive painéis administrativos." },
  SUPERVISOR: { label: "Supervisor", descricao: "Gerencia empresas, réguas e o time." },
  OPERADOR: { label: "Operador", descricao: "Opera a carteira no dia a dia." },
  LEITURA: { label: "Somente leitura", descricao: "Consulta sem alterar registros." },
};

const CHAVES_PERMISSAO = Object.keys(PERMISSOES_LABELS) as (keyof PermissoesCredor)[];

export default function UsuariosCredoresPage() {
  const { db, salvarUsuario, removerUsuario, notificar } = useApp();
  const [busca, setBusca] = useState("");
  const [perfil, setPerfil] = useState<Perfil | "">("");
  const [editando, setEditando] = useState<Usuario | null>(null);
  const [novoAberto, setNovoAberto] = useState(false);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return db.usuarios.filter((u) => {
      if (perfil && u.perfil !== perfil) return false;
      if (!termo) return true;
      return (
        u.nome.toLowerCase().includes(termo) ||
        u.email.toLowerCase().includes(termo) ||
        u.cargo.toLowerCase().includes(termo)
      );
    });
  }, [db.usuarios, busca, perfil]);

  const colunas: Coluna<Usuario>[] = [
    {
      id: "nome",
      cabecalho: "Usuário",
      largura: "300px",
      ordenavel: true,
      valor: (u) => u.nome,
      celula: (u) => (
        <div className="flex items-center gap-2.5">
          <Avatar nome={u.nome} size={30} />
          <div className="min-w-0">
            <p className="truncate font-medium text-fg">{u.nome}</p>
            <p className="truncate text-[11.5px] text-fg-muted">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      id: "cargo",
      cabecalho: "Cargo",
      valor: (u) => u.cargo,
      celula: (u) => <span className="text-fg-muted">{u.cargo}</span>,
    },
    {
      id: "perfil",
      cabecalho: "Perfil",
      ordenavel: true,
      valor: (u) => u.perfil,
      celula: (u) => (
        <Badge tone={u.perfil === "MASTER" ? "accent" : u.perfil === "LEITURA" ? "neutral" : "info"}>
          {PERFIS[u.perfil].label}
        </Badge>
      ),
    },
    {
      id: "empresas",
      cabecalho: "Empresas",
      valor: (u) => u.empresasIds.length,
      celula: (u) => (
        <span className="text-fg-muted">
          {u.empresasIds.length === db.empresas.length
            ? "Todas"
            : `${u.empresasIds.length} de ${db.empresas.length}`}
        </span>
      ),
    },
    {
      id: "permissoes",
      cabecalho: "Permissões ativas",
      opcional: true,
      valor: (u) => CHAVES_PERMISSAO.filter((k) => u.permissoes[k]).length,
      celula: (u) => (
        <span className="tnum text-fg-muted">
          {CHAVES_PERMISSAO.filter((k) => u.permissoes[k]).length} de {CHAVES_PERMISSAO.length}
        </span>
      ),
    },
    {
      id: "acesso",
      cabecalho: "Último acesso",
      ordenavel: true,
      valor: (u) => new Date(u.ultimoAcesso).getTime(),
      celula: (u) => <span className="tnum text-fg-muted">{date(u.ultimoAcesso)}</span>,
    },
    {
      id: "ativo",
      cabecalho: "Situação",
      valor: (u) => (u.ativo ? "ativo" : "inativo"),
      celula: (u) => (
        <Badge tone={u.ativo ? "ok" : "neutral"} dot>
          {u.ativo ? "Ativo" : "Inativo"}
        </Badge>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        breadcrumb="Credor · Cadastro"
        titulo="Usuários credores"
        descricao="Quem acessa a plataforma, em quais empresas e com quais permissões por módulo."
        acoes={
          <Button onClick={() => setNovoAberto(true)}>
            <Plus size={15} weight="bold" /> Novo usuário
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <SearchInput
          className="max-w-xs"
          placeholder="Buscar por nome, e-mail ou cargo"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <Select
          className="max-w-[200px]"
          value={perfil}
          onChange={(e) => setPerfil(e.target.value as Perfil)}
        >
          <option value="">Todos os perfis</option>
          {(Object.keys(PERFIS) as Perfil[]).map((p) => (
            <option key={p} value={p}>
              {PERFIS[p].label}
            </option>
          ))}
        </Select>
      </div>

      <DataTable
        dados={filtrados}
        colunas={colunas}
        chave={(u) => u.id}
        storageKey="usuarios-credores"
        aoClicarLinha={setEditando}
        exportarNome="usuarios-credores"
        vazio={{ icon: <UsersThree size={22} />, titulo: "Nenhum usuário encontrado" }}
      />

      {editando && (
        <EditorUsuario
          usuario={editando}
          onClose={() => setEditando(null)}
          onSalvar={(u) => {
            salvarUsuario(u);
            notificar({ titulo: "Usuário atualizado", descricao: u.nome, tone: "ok" });
            setEditando(null);
          }}
          onRemover={(id, nome) => {
            removerUsuario(id);
            notificar({ titulo: "Usuário removido", descricao: nome, tone: "warn" });
            setEditando(null);
          }}
        />
      )}

      <NovoUsuarioModal aberto={novoAberto} onClose={() => setNovoAberto(false)} />
    </>
  );
}

function EditorUsuario({
  usuario,
  onClose,
  onSalvar,
  onRemover,
}: {
  usuario: Usuario;
  onClose: () => void;
  onSalvar: (u: Usuario) => void;
  onRemover: (id: string, nome: string) => void;
}) {
  const { db } = useApp();
  const [rascunho, setRascunho] = useState<Usuario>(usuario);

  const alternarEmpresa = (id: string) =>
    setRascunho((r) => ({
      ...r,
      empresasIds: r.empresasIds.includes(id)
        ? r.empresasIds.filter((x) => x !== id)
        : [...r.empresasIds, id],
    }));

  return (
    <Drawer
      aberto
      onClose={onClose}
      titulo={rascunho.nome}
      subtitulo={rascunho.email}
      largura={560}
      rodape={
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemover(usuario.id, usuario.nome)}
            className="mr-auto text-danger hover:bg-danger-soft"
            disabled={usuario.id === db.usuarioAtual.id}
          >
            <Trash size={14} /> Remover
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
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome completo">
          <Input
            value={rascunho.nome}
            onChange={(e) => setRascunho({ ...rascunho, nome: e.target.value })}
          />
        </Field>
        <Field label="Cargo">
          <Input
            value={rascunho.cargo}
            onChange={(e) => setRascunho({ ...rascunho, cargo: e.target.value })}
          />
        </Field>
        <Field label="E-mail" className="sm:col-span-2">
          <Input
            type="email"
            value={rascunho.email}
            onChange={(e) => setRascunho({ ...rascunho, email: e.target.value })}
          />
        </Field>
        <Field label="Perfil de acesso" hint={PERFIS[rascunho.perfil].descricao} className="sm:col-span-2">
          <Select
            value={rascunho.perfil}
            onChange={(e) => setRascunho({ ...rascunho, perfil: e.target.value as Perfil })}
          >
            {(Object.keys(PERFIS) as Perfil[]).map((p) => (
              <option key={p} value={p}>
                {PERFIS[p].label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="mt-5">
        <Switch
          checked={rascunho.ativo}
          onChange={(v) => setRascunho({ ...rascunho, ativo: v })}
          label="Usuário ativo"
          descricao="Usuários inativos não conseguem autenticar na plataforma."
        />
      </div>

      <Divider className="my-6" label="Empresas com acesso" />
      <div className="space-y-2">
        {db.empresas.map((e) => (
          <div
            key={e.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-line px-3 py-2.5"
          >
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium text-fg">{e.nomeFantasia}</p>
              <p className="text-[11.5px] text-fg-muted">
                {e.cidade}/{e.uf}
              </p>
            </div>
            <Switch
              checked={rascunho.empresasIds.includes(e.id)}
              onChange={() => alternarEmpresa(e.id)}
            />
          </div>
        ))}
      </div>

      <Divider className="my-6" label="Permissões por módulo" />
      <div className="space-y-3">
        {CHAVES_PERMISSAO.map((chave) => (
          <Switch
            key={chave}
            checked={rascunho.permissoes[chave]}
            onChange={(v) =>
              setRascunho({
                ...rascunho,
                permissoes: { ...rascunho.permissoes, [chave]: v },
              })
            }
            label={PERMISSOES_LABELS[chave]}
          />
        ))}
      </div>
    </Drawer>
  );
}

function NovoUsuarioModal({ aberto, onClose }: { aberto: boolean; onClose: () => void }) {
  const { db, salvarUsuario, notificar } = useApp();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cargo, setCargo] = useState("");
  const [perfil, setPerfil] = useState<Perfil>("OPERADOR");
  const [empresas, setEmpresas] = useState<string[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  const salvar = () => {
    if (!nome.trim()) return setErro("Informe o nome do usuário.");
    if (!email.includes("@")) return setErro("Informe um e-mail válido.");
    if (empresas.length === 0) return setErro("Selecione ao menos uma empresa.");

    salvarUsuario({ nome: nome.trim(), email: email.trim(), cargo, perfil, empresasIds: empresas });
    notificar({
      titulo: "Usuário criado",
      descricao: `${nome} receberá um convite por e-mail.`,
      tone: "ok",
    });
    setNome("");
    setEmail("");
    setCargo("");
    setEmpresas([]);
    setErro(null);
    onClose();
  };

  return (
    <Modal
      aberto={aberto}
      onClose={onClose}
      titulo="Novo usuário credor"
      descricao="O usuário recebe um convite e define a própria senha no primeiro acesso."
      rodape={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button size="sm" onClick={salvar}>
            Criar usuário
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome completo" obrigatorio>
          <Input value={nome} onChange={(e) => setNome(e.target.value)} />
        </Field>
        <Field label="Cargo">
          <Input value={cargo} onChange={(e) => setCargo(e.target.value)} />
        </Field>
        <Field label="E-mail corporativo" obrigatorio className="sm:col-span-2">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Perfil" hint={PERFIS[perfil].descricao} className="sm:col-span-2">
          <Select value={perfil} onChange={(e) => setPerfil(e.target.value as Perfil)}>
            {(Object.keys(PERFIS) as Perfil[]).map((p) => (
              <option key={p} value={p}>
                {PERFIS[p].label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-[12.5px] font-medium text-fg">Empresas com acesso</p>
        <div className="space-y-2">
          {db.empresas.map((e) => (
            <Checkbox
              key={e.id}
              checked={empresas.includes(e.id)}
              onChange={(v) =>
                setEmpresas(v ? [...empresas, e.id] : empresas.filter((x) => x !== e.id))
              }
              label={e.nomeFantasia}
            />
          ))}
        </div>
      </div>

      {erro && (
        <p className="mt-4 rounded-lg bg-danger-soft px-3 py-2.5 text-[13px] text-danger">{erro}</p>
      )}
    </Modal>
  );
}
