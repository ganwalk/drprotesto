"use client";

import { useMemo, useState } from "react";
import { CheckCircle, Key, ShieldCheck, XCircle } from "@phosphor-icons/react";
import { Button, Card, CardHeader, PageHeader, Progress } from "@/components/ui/primitives";
import { Field, Input } from "@/components/ui/form";
import { useApp } from "@/store/app-store";
import { cn } from "@/lib/cn";

const REGRAS = [
  { id: "tam", texto: "Ao menos 10 caracteres", testa: (s: string) => s.length >= 10 },
  { id: "mai", texto: "Uma letra maiúscula", testa: (s: string) => /[A-Z]/.test(s) },
  { id: "min", texto: "Uma letra minúscula", testa: (s: string) => /[a-z]/.test(s) },
  { id: "num", texto: "Um número", testa: (s: string) => /\d/.test(s) },
  { id: "esp", texto: "Um caractere especial", testa: (s: string) => /[^A-Za-z0-9]/.test(s) },
];

export default function AlterarSenhaPage() {
  const { notificar } = useApp();
  const [atual, setAtual] = useState("");
  const [nova, setNova] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  const atendidas = useMemo(() => REGRAS.filter((r) => r.testa(nova)), [nova]);
  const forca = atendidas.length / REGRAS.length;

  const salvar = () => {
    if (!atual) return setErro("Informe a senha atual.");
    if (atendidas.length < REGRAS.length)
      return setErro("A nova senha não atende a todos os requisitos.");
    if (nova !== confirmacao) return setErro("A confirmação não coincide com a nova senha.");
    if (nova === atual) return setErro("A nova senha deve ser diferente da atual.");

    setErro(null);
    setAtual("");
    setNova("");
    setConfirmacao("");
    notificar({
      titulo: "Senha alterada",
      descricao: "Você permanecerá conectado neste dispositivo.",
      tone: "ok",
    });
  };

  return (
    <>
      <PageHeader breadcrumb="Conta" titulo="Alterar senha" />

      <div className="grid max-w-4xl gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Nova senha" icon={<Key size={15} weight="duotone" />} />
          <div className="space-y-4 p-5">
            <Field label="Senha atual" obrigatorio>
              <Input
                type="password"
                autoComplete="current-password"
                value={atual}
                onChange={(e) => setAtual(e.target.value)}
              />
            </Field>
            <Field label="Nova senha" obrigatorio>
              <Input
                type="password"
                autoComplete="new-password"
                value={nova}
                onChange={(e) => setNova(e.target.value)}
              />
            </Field>

            {nova && (
              <div>
                <div className="mb-1.5 flex items-center justify-between text-[12px]">
                  <span className="text-fg-muted">Força da senha</span>
                  <span
                    className={cn(
                      "font-semibold",
                      forca === 1 ? "text-ok" : forca >= 0.6 ? "text-warn" : "text-danger",
                    )}
                  >
                    {forca === 1 ? "Forte" : forca >= 0.6 ? "Média" : "Fraca"}
                  </span>
                </div>
                <Progress
                  value={forca}
                  tone={forca === 1 ? "ok" : forca >= 0.6 ? "warn" : "danger"}
                />
              </div>
            )}

            <Field label="Confirmar nova senha" obrigatorio>
              <Input
                type="password"
                autoComplete="new-password"
                value={confirmacao}
                onChange={(e) => setConfirmacao(e.target.value)}
              />
            </Field>

            {erro && (
              <p className="rounded-lg bg-danger-soft px-3 py-2.5 text-[13px] text-danger">
                {erro}
              </p>
            )}

            <Button className="w-full" onClick={salvar}>
              Alterar senha
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Requisitos" />
            <div className="space-y-2.5 p-5">
              {REGRAS.map((r) => {
                const ok = r.testa(nova);
                return (
                  <div key={r.id} className="flex items-center gap-2">
                    {ok ? (
                      <CheckCircle size={15} weight="fill" className="shrink-0 text-ok" />
                    ) : (
                      <XCircle size={15} weight="fill" className="shrink-0 text-fg-subtle" />
                    )}
                    <span className={cn("text-[13px]", ok ? "text-fg" : "text-fg-muted")}>
                      {r.texto}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-5">
            <p className="flex items-center gap-2 text-[13px] font-semibold text-fg">
              <ShieldCheck size={15} weight="duotone" className="text-accent" />
              Boas práticas
            </p>
            <ul className="mt-3 space-y-2 text-[12.5px] leading-relaxed text-fg-muted">
              <li>· Não reutilize a senha de outros sistemas.</li>
              <li>· Contas com acesso a PIX exigem também senha eletrônica e PIN.</li>
              <li>· Troque a senha imediatamente se suspeitar de acesso indevido.</li>
              <li>· Usuários que saem da empresa devem ser desativados, não compartilhados.</li>
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
