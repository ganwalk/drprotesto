"use client";

import { useMemo, useState } from "react";
import { Modal } from "@/components/ui/overlay";
import { Button } from "@/components/ui/primitives";
import { Field, Input, MoneyInput, Select } from "@/components/ui/form";
import { useApp } from "@/store/app-store";
import { addDays, ESPECIES, hoje, iso, type EspecieTitulo } from "@/lib/domain";
import { maskDoc } from "@/lib/format";

export function NovoTituloModal({
  aberto,
  onClose,
}: {
  aberto: boolean;
  onClose: () => void;
}) {
  const { db, empresaAtivaId, salvarTitulo, notificar } = useApp();

  const [empresaId, setEmpresaId] = useState(
    empresaAtivaId === "TODAS" ? db.empresas[0].id : empresaAtivaId,
  );
  const [devedorId, setDevedorId] = useState("");
  const [numero, setNumero] = useState("");
  const [especie, setEspecie] = useState<EspecieTitulo>("DMI");
  const [valor, setValor] = useState(0);
  const [emissao, setEmissao] = useState(iso(hoje()).slice(0, 10));
  const [vencimento, setVencimento] = useState(iso(addDays(hoje(), 30)).slice(0, 10));
  const [erro, setErro] = useState<string | null>(null);

  const devedores = useMemo(
    () => db.devedores.filter((d) => d.empresaId === empresaId),
    [db.devedores, empresaId],
  );

  const salvar = () => {
    if (!devedorId) return setErro("Selecione o devedor.");
    if (!numero.trim()) return setErro("Informe o número do título.");
    if (valor <= 0) return setErro("Informe um valor maior que zero.");
    if (new Date(vencimento) < new Date(emissao))
      return setErro("O vencimento não pode ser anterior à emissão.");

    const criado = salvarTitulo({
      empresaId,
      devedorId,
      numero: numero.trim(),
      especie,
      valorOriginal: valor,
      valorAtualizado: valor,
      emissao: new Date(emissao).toISOString(),
      vencimento: new Date(vencimento).toISOString(),
      status: new Date(vencimento) < hoje() ? "PRE_PROTESTO" : "NO_PRAZO",
    });

    notificar({
      titulo: "Título cadastrado",
      descricao: `Título ${criado.numero} incluído na carteira.`,
      tone: "ok",
    });
    limpar();
    onClose();
  };

  const limpar = () => {
    setDevedorId("");
    setNumero("");
    setValor(0);
    setErro(null);
  };

  return (
    <Modal
      aberto={aberto}
      onClose={() => {
        limpar();
        onClose();
      }}
      titulo="Novo título"
      descricao="Lançamento manual na carteira do credor."
      largura="md"
      rodape={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button size="sm" onClick={salvar}>
            Cadastrar título
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Empresa credora" obrigatorio className="sm:col-span-2">
          <Select
            value={empresaId}
            onChange={(e) => {
              setEmpresaId(e.target.value);
              setDevedorId("");
            }}
          >
            {db.empresas.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.nomeFantasia} — {maskDoc(emp.cnpj)}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Devedor"
          obrigatorio
          className="sm:col-span-2"
          hint={`${devedores.length} devedores nesta empresa`}
        >
          <Select value={devedorId} onChange={(e) => setDevedorId(e.target.value)}>
            <option value="">Selecione o devedor…</option>
            {devedores.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nome} — {maskDoc(d.documento)}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Número do título" obrigatorio>
          <Input
            className="tnum"
            placeholder="24801/03"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
          />
        </Field>

        <Field label="Espécie" obrigatorio>
          <Select
            value={especie}
            onChange={(e) => setEspecie(e.target.value as EspecieTitulo)}
          >
            {(Object.keys(ESPECIES) as EspecieTitulo[]).map((e) => (
              <option key={e} value={e}>
                {e} — {ESPECIES[e]}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Valor do título" obrigatorio className="sm:col-span-2">
          <MoneyInput value={valor} onChange={setValor} />
        </Field>

        <Field label="Data de emissão" obrigatorio>
          <Input type="date" value={emissao} onChange={(e) => setEmissao(e.target.value)} />
        </Field>

        <Field label="Data de vencimento" obrigatorio>
          <Input type="date" value={vencimento} onChange={(e) => setVencimento(e.target.value)} />
        </Field>
      </div>

      {erro && (
        <p className="mt-4 rounded-lg bg-danger-soft px-3 py-2.5 text-[13px] text-danger">{erro}</p>
      )}
    </Modal>
  );
}
