"use client";

import { useMemo, useState } from "react";
import { Calculator, Info, Printer, Scales } from "@phosphor-icons/react";
import { Badge, Button, Card, CardHeader, Divider, PageHeader } from "@/components/ui/primitives";
import { Field, Input, MoneyInput, Select, Switch } from "@/components/ui/form";
import { useApp } from "@/store/app-store";
import { date, money, pct } from "@/lib/format";
import { addDays, hoje, INDICES, type IndiceFinanceiro } from "@/lib/domain";

/**
 * Taxas médias mensais de referência usadas na demonstração.
 *
 * Em produção esta tela consome a API oficial do TJDFT (motor JurisCalc),
 * que devolve o fator acumulado exato entre as duas datas. As médias abaixo
 * existem só para que o cálculo seja verificável offline — a estrutura do
 * demonstrativo é idêntica à do retorno oficial.
 */
const TAXA_MENSAL_MEDIA: Record<IndiceFinanceiro, number> = {
  IGPM: 0.0042,
  IPCA: 0.0038,
  INPC: 0.0037,
  INCC_DI: 0.0045,
  SELIC: 0.0087,
  NENHUM: 0,
};

/** Marco da Lei 14.905/2024: antes, 1% a.m.; depois, taxa legal (SELIC − IPCA). */
const MARCO_LEI_14905 = new Date("2024-08-30T00:00:00-03:00");
const JUROS_ANTIGO_MENSAL = 0.01;
const JUROS_LEGAL_MENSAL = 0.0049;

function mesesEntre(inicio: Date, fim: Date) {
  return Math.max(0, (fim.getTime() - inicio.getTime()) / (30.4375 * 86_400_000));
}

export default function CalculadoraPage() {
  const { db } = useApp();

  const [valorOriginal, setValorOriginal] = useState(10000);
  const [indice, setIndice] = useState<IndiceFinanceiro>("INPC");
  const [dataInicial, setDataInicial] = useState(
    addDays(hoje(), -365).toISOString().slice(0, 10),
  );
  const [dataFinal, setDataFinal] = useState(hoje().toISOString().slice(0, 10));
  const [multaPct, setMultaPct] = useState(2);
  const [honorariosPct, setHonorariosPct] = useState(10);
  const [custas, setCustas] = useState(0);
  const [aplicarJuros, setAplicarJuros] = useState(true);
  const [tituloId, setTituloId] = useState("");

  const calculo = useMemo(() => {
    const inicio = new Date(dataInicial);
    const fim = new Date(dataFinal);
    if (Number.isNaN(inicio.getTime()) || Number.isNaN(fim.getTime()) || fim <= inicio) {
      return null;
    }

    const meses = mesesEntre(inicio, fim);
    const fatorCorrecao = Math.pow(1 + TAXA_MENSAL_MEDIA[indice], meses);
    const valorCorrigido = valorOriginal * fatorCorrecao;
    const correcao = valorCorrigido - valorOriginal;

    // Juros divididos pelo marco da Lei 14.905/2024.
    let juros = 0;
    let mesesAntigos = 0;
    let mesesNovos = 0;
    if (aplicarJuros) {
      if (fim <= MARCO_LEI_14905) {
        mesesAntigos = meses;
      } else if (inicio >= MARCO_LEI_14905) {
        mesesNovos = meses;
      } else {
        mesesAntigos = mesesEntre(inicio, MARCO_LEI_14905);
        mesesNovos = mesesEntre(MARCO_LEI_14905, fim);
      }
      juros =
        valorCorrigido * (mesesAntigos * JUROS_ANTIGO_MENSAL + mesesNovos * JUROS_LEGAL_MENSAL);
    }

    const multa = valorCorrigido * (multaPct / 100);
    const subtotal = valorCorrigido + juros + multa;
    const honorarios = subtotal * (honorariosPct / 100);
    const total = subtotal + honorarios + custas;

    return {
      meses,
      fatorCorrecao,
      valorCorrigido,
      correcao,
      juros,
      mesesAntigos,
      mesesNovos,
      multa,
      honorarios,
      total,
      variacaoTotal: valorOriginal ? total / valorOriginal - 1 : 0,
    };
  }, [valorOriginal, indice, dataInicial, dataFinal, multaPct, honorariosPct, custas, aplicarJuros]);

  // Carregar um título da carteira preenche valor, data e parâmetros da empresa.
  const carregarTitulo = (id: string) => {
    setTituloId(id);
    const titulo = db.titulos.find((t) => t.id === id);
    if (!titulo) return;
    const empresa = db.empresas.find((e) => e.id === titulo.empresaId);
    setValorOriginal(titulo.valorOriginal);
    setDataInicial(new Date(titulo.vencimento).toISOString().slice(0, 10));
    if (empresa) {
      setIndice(empresa.indiceFinanceiro);
      setMultaPct(empresa.multaPercentual);
    }
  };

  const titulosVencidos = db.titulos
    .filter((t) => t.status !== "NO_PRAZO" && t.status !== "LIQUIDADO")
    .slice(0, 80);

  return (
    <>
      <PageHeader
        breadcrumb="Consultas"
        titulo="Calculadora de atualização monetária"
        descricao="Correção monetária, juros legais da Lei 14.905/2024, multa, honorários e custas — no formato do demonstrativo oficial."
        acoes={
          <Button variant="outline" onClick={() => window.print()}>
            <Printer size={15} /> Imprimir demonstrativo
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Parâmetros do cálculo"
            icon={<Calculator size={15} weight="duotone" />}
          />
          <div className="space-y-4 p-5">
            <Field
              label="Carregar de um título"
              hint="Opcional — preenche valor, data e parâmetros da empresa"
            >
              <Select value={tituloId} onChange={(e) => carregarTitulo(e.target.value)}>
                <option value="">Cálculo avulso</option>
                {titulosVencidos.map((t) => {
                  const d = db.devedores.find((x) => x.id === t.devedorId);
                  return (
                    <option key={t.id} value={t.id}>
                      {t.numero} — {d?.nome.slice(0, 30)} — {money(t.valorOriginal)}
                    </option>
                  );
                })}
              </Select>
            </Field>

            <Field label="Valor original" obrigatorio>
              <MoneyInput value={valorOriginal} onChange={setValorOriginal} />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Data inicial" obrigatorio>
                <Input
                  type="date"
                  value={dataInicial}
                  onChange={(e) => setDataInicial(e.target.value)}
                />
              </Field>
              <Field label="Data final" obrigatorio>
                <Input
                  type="date"
                  value={dataFinal}
                  onChange={(e) => setDataFinal(e.target.value)}
                />
              </Field>
            </div>

            <Field label="Índice de correção">
              <Select
                value={indice}
                onChange={(e) => setIndice(e.target.value as IndiceFinanceiro)}
              >
                {(Object.keys(INDICES) as IndiceFinanceiro[]).map((i) => (
                  <option key={i} value={i}>
                    {INDICES[i].label} — {INDICES[i].fonte}
                  </option>
                ))}
              </Select>
            </Field>

            <Divider className="my-1" />

            <Switch
              checked={aplicarJuros}
              onChange={setAplicarJuros}
              label="Aplicar juros de mora"
              descricao="1% a.m. até 29/08/2024; taxa legal (SELIC − IPCA) a partir de 30/08/2024."
            />

            <div className="grid grid-cols-2 gap-3">
              <Field label="Multa (%)">
                <Input
                  type="number"
                  step="0.5"
                  className="tnum"
                  value={multaPct}
                  onChange={(e) => setMultaPct(Number(e.target.value))}
                />
              </Field>
              <Field label="Honorários (%)">
                <Input
                  type="number"
                  step="1"
                  className="tnum"
                  value={honorariosPct}
                  onChange={(e) => setHonorariosPct(Number(e.target.value))}
                />
              </Field>
            </div>

            <Field label="Custas processuais">
              <MoneyInput value={custas} onChange={setCustas} />
            </Field>
          </div>
        </Card>

        <div className="lg:col-span-3">
          <Card>
            <CardHeader
              title="Demonstrativo de cálculo"
              description={
                calculo
                  ? `Período de ${date(dataInicial)} a ${date(dataFinal)} · ${calculo.meses.toFixed(1)} meses`
                  : "Informe um período válido"
              }
              icon={<Scales size={15} weight="duotone" />}
              actions={<Badge tone="accent">{INDICES[indice].label}</Badge>}
            />

            {!calculo ? (
              <p className="px-5 py-16 text-center text-[13px] text-fg-muted">
                A data final precisa ser posterior à data inicial.
              </p>
            ) : (
              <>
                <div className="divide-y divide-line">
                  <Linha rotulo="Valor original" valor={money(valorOriginal)} />
                  <Linha
                    rotulo={`Correção monetária (${INDICES[indice].label})`}
                    detalhe={`fator ${calculo.fatorCorrecao.toFixed(6)} · ${calculo.meses.toFixed(1)} meses`}
                    valor={money(calculo.correcao)}
                    tom="accent"
                  />
                  <Linha
                    rotulo="Valor corrigido"
                    valor={money(calculo.valorCorrigido)}
                    forte
                  />
                  {aplicarJuros && (
                    <Linha
                      rotulo="Juros de mora"
                      detalhe={
                        calculo.mesesAntigos > 0 && calculo.mesesNovos > 0
                          ? `${calculo.mesesAntigos.toFixed(1)}m a 1% + ${calculo.mesesNovos.toFixed(1)}m a ${pct(JUROS_LEGAL_MENSAL)}`
                          : calculo.mesesAntigos > 0
                            ? `${calculo.mesesAntigos.toFixed(1)} meses a 1% a.m.`
                            : `${calculo.mesesNovos.toFixed(1)} meses à taxa legal`
                      }
                      valor={money(calculo.juros)}
                      tom="warn"
                    />
                  )}
                  <Linha
                    rotulo={`Multa contratual (${multaPct}%)`}
                    valor={money(calculo.multa)}
                    tom="warn"
                  />
                  <Linha
                    rotulo={`Honorários advocatícios (${honorariosPct}%)`}
                    valor={money(calculo.honorarios)}
                    tom="warn"
                  />
                  {custas > 0 && <Linha rotulo="Custas processuais" valor={money(custas)} />}
                </div>

                <div className="flex flex-wrap items-end justify-between gap-4 border-t-2 border-accent bg-accent-soft px-5 py-5">
                  <div>
                    <p className="text-[11.5px] font-semibold tracking-wider text-accent uppercase">
                      Total atualizado
                    </p>
                    <p className="tnum font-display mt-1 text-[30px] leading-none font-semibold text-accent">
                      {money(calculo.total)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11.5px] text-fg-muted">Variação sobre o original</p>
                    <p className="tnum text-[16px] font-semibold text-fg">
                      +{pct(calculo.variacaoTotal)}
                    </p>
                  </div>
                </div>
              </>
            )}
          </Card>

          <Card className="mt-4 border-accent/25 bg-accent-soft/40 p-5">
            <p className="flex items-center gap-2 text-[13px] font-semibold text-accent">
              <Info size={15} weight="duotone" />
              Sobre a fonte dos índices
            </p>
            <p className="mt-2 text-[12.5px] leading-relaxed text-fg-muted">
              Nesta demonstração o fator de correção é calculado com a taxa média mensal do índice
              escolhido, capitalizada pelo número de meses do período — o resultado é próximo, mas
              não idêntico ao oficial. Em produção, a tela consome a API de cálculo do TJDFT (motor{" "}
              <strong className="font-semibold text-fg">{db.integracoes.tjdft.motor}</strong>), que
              devolve o fator acumulado exato mês a mês, com a série publicada por FGV e IBGE.
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}

function Linha({
  rotulo,
  detalhe,
  valor,
  tom,
  forte,
}: {
  rotulo: string;
  detalhe?: string;
  valor: string;
  tom?: "accent" | "warn";
  forte?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5">
      <div className="min-w-0">
        <p className={`text-[13.5px] ${forte ? "font-semibold text-fg" : "text-fg"}`}>{rotulo}</p>
        {detalhe && <p className="tnum mt-0.5 text-[11.5px] text-fg-subtle">{detalhe}</p>}
      </div>
      <p
        className={`tnum shrink-0 text-[14px] ${
          forte
            ? "font-semibold text-fg"
            : tom === "accent"
              ? "font-medium text-accent"
              : tom === "warn"
                ? "font-medium text-warn"
                : "text-fg"
        }`}
      >
        {valor}
      </p>
    </div>
  );
}
