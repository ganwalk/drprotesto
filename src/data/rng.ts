/** PRNG determinístico (mulberry32) — o mesmo seed sempre gera a mesma base. */
export function createRng(seed: number) {
  let a = seed >>> 0;
  const next = () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  return {
    next,
    int: (min: number, max: number) => Math.floor(next() * (max - min + 1)) + min,
    float: (min: number, max: number, decimals = 2) => {
      const v = next() * (max - min) + min;
      return Number(v.toFixed(decimals));
    },
    pick: <T>(arr: readonly T[]): T => arr[Math.floor(next() * arr.length)],
    picks: <T>(arr: readonly T[], n: number): T[] => {
      const copy = [...arr];
      const out: T[] = [];
      for (let i = 0; i < n && copy.length; i++) {
        out.push(copy.splice(Math.floor(next() * copy.length), 1)[0]);
      }
      return out;
    },
    bool: (probability = 0.5) => next() < probability,
    /** Escolhe um item respeitando pesos relativos. */
    weighted: <T>(entries: Array<[T, number]>): T => {
      const total = entries.reduce((s, [, w]) => s + w, 0);
      let r = next() * total;
      for (const [value, weight] of entries) {
        r -= weight;
        if (r <= 0) return value;
      }
      return entries[entries.length - 1][0];
    },
  };
}

export type Rng = ReturnType<typeof createRng>;

/* ------------------ Documentos com dígito verificador válido ------------- */

function dv(base: number[], pesos: number[]) {
  const soma = base.reduce((acc, n, i) => acc + n * pesos[i], 0);
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}

export function gerarCPF(rng: Rng) {
  const base = Array.from({ length: 9 }, () => rng.int(0, 9));
  const d1 = dv(base, [10, 9, 8, 7, 6, 5, 4, 3, 2]);
  const d2 = dv([...base, d1], [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]);
  return [...base, d1, d2].join("");
}

export function gerarCNPJ(rng: Rng) {
  const base = [...Array.from({ length: 8 }, () => rng.int(0, 9)), 0, 0, 0, 1];
  const p1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const p2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const d1 = dv(base, p1);
  const d2 = dv([...base, d1], p2);
  return [...base, d1, d2].join("");
}

/** Número de processo no padrão CNJ (20 dígitos), com DV módulo 97. */
export function gerarCNJ(rng: Rng, ano: number, tribunal: string, origem: string) {
  const sequencial = String(rng.int(1000000, 9999999)).padStart(7, "0");
  const j = tribunal[0];
  const tr = tribunal.slice(1);
  const semDV = `${sequencial}${ano}${j}${tr}${origem}`;
  const dvCalc = 98 - (Number(BigInt(semDV + "00") % 97n) % 97);
  const dvStr = String(dvCalc).padStart(2, "0");
  return `${sequencial}${dvStr}${ano}${j}${tr}${origem}`;
}

export function gerarTelefone(rng: Rng) {
  const ddd = rng.pick([11, 21, 31, 41, 47, 51, 61, 62, 71, 81, 85, 27, 48, 19, 16]);
  return `${ddd}9${rng.int(10000000, 99999999)}`;
}

export function slugEmail(nome: string, dominio = "email.com.br") {
  const limpo = nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .trim()
    .split(/\s+/);
  const user = `${limpo[0]}.${limpo[limpo.length - 1]}`;
  return `${user}@${dominio}`;
}

/** Payload EMV compatível com o formato de PIX copia-e-cola. */
export function gerarCopiaECola(rng: Rng, chave: string, valor: number, nome: string) {
  const v = valor.toFixed(2);
  const merchant = `0014BR.GOV.BCB.PIX01${String(chave.length).padStart(2, "0")}${chave}`;
  const txid = Array.from({ length: 25 }, () =>
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[rng.int(0, 35)],
  ).join("");
  const nomeCurto = nome.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().slice(0, 25);
  return (
    `00020126${String(merchant.length).padStart(2, "0")}${merchant}` +
    `52040000530398654${String(v.length).padStart(2, "0")}${v}` +
    `5802BR59${String(nomeCurto.length).padStart(2, "0")}${nomeCurto}` +
    `6009SAO PAULO62${String(txid.length + 4).padStart(2, "0")}05${String(txid.length).padStart(2, "0")}${txid}` +
    `6304${Array.from({ length: 4 }, () => "0123456789ABCDEF"[rng.int(0, 15)]).join("")}`
  );
}
