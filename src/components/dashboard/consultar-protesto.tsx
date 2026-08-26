"use client";

import { useState } from "react";
import { MagnifyingGlass, Stamp, WarningCircle } from "@phosphor-icons/react";
import { Modal } from "@/components/ui/overlay";
import { Button, Badge, EmptyState } from "@/components/ui/primitives";
import { Field, Input, Segmented } from "@/components/ui/form-extra";
import { useApp } from "@/store/app-store";
import { date, maskDoc, money } from "@/lib/format";
import { TITULO_STATUS } from "@/lib/status";
import type { Titulo } from "@/lib/domain";

type Modo = "documento" | "titulo" | "protocolo";

export function ConsultarProtesto({
  aberto,
  onClose,
}: {
  aberto: boolean;
  onClose: () => void;
}) {
  const { db } = useApp();
  const [modo, setModo] = useState<Modo>("documento");
  const [termo, setTermo] = useState("");
  const [resultado, setResultado] = useState<Titulo[] | null>(null);

  const buscar = () => {
    const t = termo.trim().toLowerCase();
    if (!t) return setResultado([]);

    const encontrados = db.titulos.filter((titulo) => {
      if (modo === "titulo") return titulo.numero.toLowerCase().includes(t);
      if (modo === "protocolo")
        return (titulo.protocoloCartorio ?? "").toLowerCase().includes(t);
      const devedor = db.devedores.find((d) => d.id === titulo.devedorId);
      if (!devedor) return false;
      const digitos = t.replace(/\D/g, "");
      return digitos
        ? devedor.documento.includes(digitos)
        : devedor.nome.toLowerCase().includes(t);
    });

    // A consulta de protesto olha apenas os títulos que chegaram ao cartório.
    setResultado(
      encontrados.filter((titulo) =>
        ["AGUARDANDO_REMESSA", "EM_CARTORIO", "PROTESTADO", "DEVOLVIDO"].includes(titulo.status),
      ),
    );
  };

  const fechar = () => {
    setResultado(null);
    setTermo("");
    onClose();
  };

  return (
    <Modal
      aberto={aberto}
      onClose={fechar}
      titulo="Consultar protesto"
      descricao="Pesquise por documento do devedor, número do título ou protocolo de cartório."
      largura="lg"
      rodape={
        <>
          <Button variant="ghost" size="sm" onClick={fechar}>
            Fechar
          </Button>
          <Button size="sm" onClick={buscar}>
            <MagnifyingGlass size={14} weight="bold" /> Consultar
          </Button>
        </>
      }
    >
      <Segmented
        value={modo}
        onChange={(v) => {
          setModo(v);
          setResultado(null);
        }}
        options={[
          { value: "documento", label: "Por CPF/CNPJ ou nome" },
          { value: "titulo", label: "Por número do título" },
          { value: "protocolo", label: "Por protocolo" },
        ]}
      />

      <Field className="mt-4" label="Termo de busca">
        <Input
          autoFocus
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && buscar()}
          placeholder={
            modo === "documento"
              ? "00.000.000/0000-00 ou nome do devedor"
              : modo === "titulo"
                ? "24801/03"
                : "123456-78"
          }
        />
      </Field>

      {resultado !== null && (
        <div className="mt-6">
          {resultado.length === 0 ? (
            <EmptyState
              icon={<WarningCircle size={22} />}
              titulo="Nenhum apontamento encontrado"
              descricao="Não há títulos deste devedor em cartório na base consultada."
            />
          ) : (
            <>
              <p className="mb-3 text-[12.5px] font-medium text-fg-muted">
                {resultado.length} apontamento(s) localizado(s)
              </p>
              <div className="space-y-2">
                {resultado.slice(0, 12).map((t) => {
                  const devedor = db.devedores.find((d) => d.id === t.devedorId);
                  return (
                    <div
                      key={t.id}
                      className="flex flex-wrap items-center gap-3 rounded-lg border border-line p-3"
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent">
                        <Stamp size={16} weight="duotone" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold text-fg">
                          {devedor?.nome ?? "—"}
                        </p>
                        <p className="tnum text-[12px] text-fg-muted">
                          {devedor ? maskDoc(devedor.documento) : "—"} · Título {t.numero}
                        </p>
                      </div>
                      <div className="min-w-0 text-right">
                        <p className="tnum text-[13px] font-semibold text-fg">
                          {money(t.valorAtualizado)}
                        </p>
                        <p className="text-[11.5px] text-fg-subtle">
                          Venc. {date(t.vencimento)}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <Badge tone={TITULO_STATUS[t.status].tone} dot>
                          {TITULO_STATUS[t.status].label}
                        </Badge>
                        {t.protocoloCartorio && (
                          <p className="tnum mt-1 text-[11px] text-fg-subtle">
                            Prot. {t.protocoloCartorio}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {resultado.length > 12 && (
                <p className="mt-3 text-[12px] text-fg-subtle">
                  Exibindo 12 de {resultado.length}. Refine a busca para ver os demais.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </Modal>
  );
}
