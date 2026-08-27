"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { moneyCompact, money, num } from "@/lib/format";

/* ------------------------------------------------------------------
   Gráficos temáticos.

   As cores vêm das variáveis CSS do design system — atributos SVG
   aceitam var(), então claro e escuro trocam sem JavaScript.
------------------------------------------------------------------- */

const EIXO = {
  stroke: "var(--line)",
  fontSize: 11,
  tick: { fill: "var(--fg-subtle)", fontSize: 11 },
};

function CaixaTooltip({
  active,
  payload,
  label,
  formatador,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number | string; color?: string; dataKey?: string }>;
  label?: string | number;
  formatador?: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 shadow-[var(--shadow-pop)]">
      {label !== undefined && (
        <p className="mb-1.5 text-[11.5px] font-semibold text-fg">{label}</p>
      )}
      {payload.map((p, i) => (
        <p key={i} className="flex items-center gap-2 text-[12px] text-fg-muted">
          <span className="size-2 rounded-full" style={{ background: p.color }} />
          <span>{p.name}</span>
          <span className="tnum ml-auto font-semibold text-fg">
            {formatador && typeof p.value === "number" ? formatador(p.value) : p.value}
          </span>
        </p>
      ))}
    </div>
  );
}

export function GraficoEvolucao({
  dados,
  altura = 280,
}: {
  dados: Array<{ mes: string; vencido: number; recuperado: number; protestado: number }>;
  altura?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={altura}>
      <AreaChart data={dados} margin={{ top: 8, right: 10, left: 4, bottom: 0 }}>
        <defs>
          <linearGradient id="grad-vencido" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--warn)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="var(--warn)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="grad-recuperado" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--ok)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="var(--ok)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={EIXO.tick} dy={6} />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={EIXO.tick}
          tickFormatter={(v) => moneyCompact(Number(v))}
          width={72}
        />
        <Tooltip content={<CaixaTooltip formatador={money} />} cursor={{ stroke: "var(--line-strong)" }} />
        <Legend
          iconType="circle"
          iconSize={7}
          wrapperStyle={{ fontSize: 12, color: "var(--fg-muted)", paddingTop: 8 }}
        />
        <Area
          type="monotone"
          dataKey="vencido"
          name="Vencido no mês"
          stroke="var(--warn)"
          strokeWidth={2}
          fill="url(#grad-vencido)"
        />
        <Area
          type="monotone"
          dataKey="recuperado"
          name="Recuperado no mês"
          stroke="var(--ok)"
          strokeWidth={2}
          fill="url(#grad-recuperado)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function GraficoAging({
  dados,
  altura = 260,
}: {
  dados: Array<{ faixa: string; valor: number; qtd: number }>;
  altura?: number;
}) {
  const cores = [
    "var(--fg-subtle)",
    "var(--steel-400, #bab5b0)",
    "var(--accent)",
    "var(--warn)",
    "var(--danger)",
    "var(--danger)",
  ];
  return (
    <ResponsiveContainer width="100%" height={altura}>
      <BarChart data={dados} margin={{ top: 8, right: 10, left: 4, bottom: 0 }}>
        <XAxis dataKey="faixa" axisLine={false} tickLine={false} tick={EIXO.tick} dy={6} />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={EIXO.tick}
          tickFormatter={(v) => moneyCompact(Number(v))}
          width={72}
        />
        <Tooltip
          content={<CaixaTooltip formatador={money} />}
          cursor={{ fill: "var(--surface-2)" }}
        />
        <Bar dataKey="valor" name="Em aberto" radius={[5, 5, 0, 0]} maxBarSize={54}>
          {dados.map((_, i) => (
            <Cell key={i} fill={cores[i % cores.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function GraficoDistribuicao({
  dados,
  altura = 240,
}: {
  dados: Array<{ nome: string; valor: number; cor: string }>;
  altura?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={altura}>
      <PieChart>
        <Pie
          data={dados}
          dataKey="valor"
          nameKey="nome"
          innerRadius="58%"
          outerRadius="86%"
          paddingAngle={2}
          strokeWidth={0}
        >
          {dados.map((d, i) => (
            <Cell key={i} fill={d.cor} />
          ))}
        </Pie>
        <Tooltip content={<CaixaTooltip formatador={num} />} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function GraficoBarrasSimples({
  dados,
  chave,
  nome,
  altura = 220,
  formatador = num,
  cor = "var(--accent)",
}: {
  dados: Array<Record<string, string | number>>;
  chave: string;
  nome: string;
  altura?: number;
  formatador?: (v: number) => string;
  cor?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={altura}>
      <BarChart data={dados} margin={{ top: 8, right: 10, left: 4, bottom: 0 }}>
        <XAxis dataKey="rotulo" axisLine={false} tickLine={false} tick={EIXO.tick} dy={6} />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={EIXO.tick}
          tickFormatter={(v) => formatador(Number(v))}
          width={72}
        />
        <Tooltip content={<CaixaTooltip formatador={formatador} />} cursor={{ fill: "var(--surface-2)" }} />
        <Bar dataKey={chave} name={nome} fill={cor} radius={[5, 5, 0, 0]} maxBarSize={44} />
      </BarChart>
    </ResponsiveContainer>
  );
}
