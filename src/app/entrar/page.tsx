"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Eye, EyeSlash, ShieldCheck } from "@phosphor-icons/react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/primitives";
import { Field, Input, Checkbox } from "@/components/ui/form";
import { HeroCanvas } from "@/components/landing/hero-canvas";
import { useApp } from "@/store/app-store";

export default function EntrarPage() {
  const router = useRouter();
  const { entrar, db, pronto } = useApp();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [verSenha, setVerSenha] = useState(false);
  const [lembrar, setLembrar] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const submeter = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setCarregando(true);
    const ok = await entrar(email, senha);
    setCarregando(false);
    if (ok) router.push("/dashboard");
    else setErro("Informe um e-mail válido e uma senha de ao menos 4 caracteres.");
  };

  const preencherDemo = () => {
    setEmail(pronto ? db.usuarioAtual.email : "helena.drummond@grupoaurora.com.br");
    setSenha("demonstracao");
    setErro(null);
  };

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Coluna do formulário */}
      <div className="flex flex-col justify-between px-6 py-8 lg:px-16 lg:py-12">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Logo size={32} />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-fg-muted transition-colors hover:text-fg"
          >
            <ArrowLeft size={14} weight="bold" />
            Voltar ao site
          </Link>
        </div>

        <div className="mx-auto w-full max-w-sm py-12">
          <h1 className="font-display text-[28px] leading-tight font-semibold text-fg">
            Acesse sua conta
          </h1>
          <p className="mt-2 text-[14px] leading-relaxed text-fg-muted">
            Entre com as credenciais do seu usuário credor ou supervisor.
          </p>

          <form onSubmit={submeter} className="mt-8 space-y-4">
            <Field label="E-mail corporativo" obrigatorio>
              <Input
                type="email"
                autoComplete="email"
                placeholder="voce@empresa.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>

            <Field label="Senha" obrigatorio>
              <span className="relative block">
                <Input
                  type={verSenha ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="pr-10"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setVerSenha((v) => !v)}
                  aria-label={verSenha ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute top-1/2 right-2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-fg-subtle hover:bg-surface-2 hover:text-fg"
                >
                  {verSenha ? <EyeSlash size={15} /> : <Eye size={15} />}
                </button>
              </span>
            </Field>

            <div className="flex items-center justify-between">
              <Checkbox checked={lembrar} onChange={setLembrar} label="Manter conectado" />
              <button type="button" className="text-[13px] font-medium text-accent hover:underline">
                Esqueci a senha
              </button>
            </div>

            {erro && (
              <p className="rounded-lg bg-danger-soft px-3 py-2.5 text-[13px] text-danger">{erro}</p>
            )}

            <Button type="submit" size="lg" className="w-full" loading={carregando}>
              Entrar
              <ArrowRight size={16} weight="bold" />
            </Button>
          </form>

          <div className="mt-6 rounded-xl border border-line bg-surface-2/60 p-4">
            <p className="flex items-center gap-2 text-[12.5px] font-semibold text-fg">
              <ShieldCheck size={15} weight="duotone" className="text-accent" />
              Ambiente de demonstração
            </p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-fg-muted">
              Qualquer e-mail válido e senha de 4+ caracteres abre a conta de exemplo. Os dados
              ficam apenas no seu navegador.
            </p>
            <button
              type="button"
              onClick={preencherDemo}
              className="mt-3 text-[12.5px] font-semibold text-accent hover:underline"
            >
              Preencher credenciais de demonstração
            </button>
          </div>
        </div>

        <p className="text-[12px] text-fg-subtle">
          © {new Date().getFullYear()} DR PROTESTO · Recuperação de crédito
        </p>
      </div>

      {/* Coluna visual */}
      <div className="relative hidden overflow-hidden bg-navy-950 lg:block">
        <HeroCanvas className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-transparent to-navy-950/40" />
        <div className="relative flex h-full flex-col justify-end p-14">
          <blockquote className="max-w-md">
            <p className="font-display text-[26px] leading-snug font-medium text-white">
              “Trocamos cinco planilhas e três e-mails por um único registro. O protesto virou
              consequência do processo, não uma corrida contra o prazo.”
            </p>
            <footer className="mt-6 text-[13.5px] text-white/55">
              Diretoria financeira · Indústria de colchões, 4 CNPJs
            </footer>
          </blockquote>

          <div className="mt-12 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-white/12 bg-white/10">
            {[
              { v: "38%", l: "recuperado antes do cartório" },
              { v: "11 dias", l: "até o acordo" },
              { v: "4", l: "empresas na mesma conta" },
            ].map((i) => (
              <div key={i.l} className="bg-navy-950/50 px-4 py-4">
                <p className="tnum font-display text-[19px] font-semibold text-white">{i.v}</p>
                <p className="mt-1 text-[11.5px] leading-snug text-white/50">{i.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
