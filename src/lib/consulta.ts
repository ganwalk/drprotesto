import { createRng } from "@/data/rng";
import type { ConsultaCadastral } from "./domain";
import { CIDADES, NOMES_PF, NOMES_PJ, SUFIXOS_PJ } from "@/data/pools";

const NATUREZAS = [
  "206-2 — Sociedade Empresária Limitada",
  "205-4 — Sociedade Anônima Fechada",
  "230-5 — Empresa Individual de Responsabilidade Limitada",
  "213-5 — Empresário (Individual)",
];

const CNAES = [
  "4649-4/08 — Comércio atacadista de produtos de higiene, limpeza e conservação domiciliar",
  "3101-2/00 — Fabricação de móveis com predominância de madeira",
  "4754-7/01 — Comércio varejista de móveis",
  "2229-3/02 — Fabricação de artefatos de material plástico",
  "4744-0/99 — Comércio varejista de materiais de construção em geral",
  "6204-0/00 — Consultoria em tecnologia da informação",
];

const SITUACOES_PJ = ["Ativa", "Ativa", "Ativa", "Baixada", "Suspensa"];
const SITUACOES_PF = ["Regular", "Regular", "Regular", "Pendente de regularização"];

const CARTORIOS_UF = [
  "1º Tabelionato de Protesto",
  "2º Tabelionato de Protesto",
  "3º Tabelionato de Protesto",
  "Tabelionato Único de Protesto",
];

/**
 * Gera um retorno de consulta cadastral determinístico a partir do documento.
 *
 * No modo de demonstração este módulo substitui o birô externo: o mesmo
 * documento devolve sempre o mesmo cadastro. Ao integrar um provedor real
 * (Serasa, Boa Vista, Receita), troque esta função pela chamada HTTP — o
 * formato de retorno já é o esperado pela tela.
 */
export function consultarDocumento(documento: string): ConsultaCadastral | null {
  const digitos = documento.replace(/\D/g, "");
  if (digitos.length !== 11 && digitos.length !== 14) return null;

  // Semente derivada do próprio documento: resultado estável entre sessões.
  const seed = digitos.split("").reduce((acc, d, i) => acc + Number(d) * (i + 7), 0) * 9973;
  const rng = createRng(seed);
  const tipo = digitos.length === 14 ? "PJ" : "PF";
  const [cidade, uf] = rng.pick(CIDADES);

  const qtdProtestos = rng.weighted<number>([
    [0, 5],
    [1, 3],
    [2, 2],
    [3, 1],
  ]);

  const protestos = Array.from({ length: qtdProtestos }, () => ({
    cartorio: rng.pick(CARTORIOS_UF),
    uf: rng.pick(CIDADES)[1],
    quantidade: rng.int(1, 6),
    valorTotal: rng.float(800, 62000),
    dataMaisAntiga: new Date(
      Date.now() - rng.int(60, 1400) * 86_400_000,
    ).toISOString(),
  }));

  if (tipo === "PJ") {
    return {
      documento: digitos,
      tipo: "PJ",
      nome: `${rng.pick(NOMES_PJ)} ${rng.pick(SUFIXOS_PJ)}`,
      situacao: rng.pick(SITUACOES_PJ),
      dataAbertura: new Date(Date.now() - rng.int(400, 9000) * 86_400_000).toISOString(),
      naturezaJuridica: rng.pick(NATUREZAS),
      cnaePrincipal: rng.pick(CNAES),
      capitalSocial: rng.float(10000, 4500000),
      endereco: `${rng.pick(["Rua", "Avenida", "Rodovia"])} ${rng.pick(["das Indústrias", "Brasil", "Santos Dumont", "Presidente Vargas", "das Nações"])}, ${rng.int(10, 4800)}`,
      cidade,
      uf,
      telefone: `${rng.pick([11, 21, 31, 41, 51])}${rng.int(30000000, 39999999)}`,
      email: `contato@${rng.pick(["empresa", "comercial", "grupo"])}${rng.int(10, 99)}.com.br`,
      socios: Array.from({ length: rng.int(1, 3) }, () => ({
        nome: rng.pick(NOMES_PF),
        qualificacao: rng.pick([
          "49 — Sócio-Administrador",
          "22 — Sócio",
          "05 — Administrador",
          "10 — Diretor",
        ]),
      })),
      protestos,
    };
  }

  return {
    documento: digitos,
    tipo: "PF",
    nome: rng.pick(NOMES_PF),
    situacao: rng.pick(SITUACOES_PF),
    nascimento: new Date(
      Date.now() - rng.int(7500, 22000) * 86_400_000,
    ).toISOString(),
    endereco: `${rng.pick(["Rua", "Avenida", "Travessa"])} ${rng.pick(["das Acácias", "Ipiranga", "Sete de Setembro", "Dom Pedro II", "das Palmeiras"])}, ${rng.int(10, 2400)}`,
    cidade,
    uf,
    telefone: `${rng.pick([11, 21, 31, 41, 51])}9${rng.int(10000000, 99999999)}`,
    email: null,
    protestos,
  };
}
