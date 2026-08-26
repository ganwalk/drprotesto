"use client";

import { useState } from "react";
import { Plus } from "@phosphor-icons/react";
import { Secao, TituloSecao } from "./secao";
import { cn } from "@/lib/cn";

const PERGUNTAS = [
  {
    p: "Preciso de um cartório específico para protestar?",
    r: "Não. A remessa é feita pela rede CENPROT, que encaminha o título ao tabelionato competente conforme o domicílio do devedor. A plataforma acompanha protocolo, cartório e UF de cada título e registra a devolução com o motivo informado pelo cartório.",
  },
  {
    p: "O que acontece quando o devedor paga depois do protesto?",
    r: "O pagamento é conciliado no extrato e liquida o título. Em seguida, o acordo entra no estágio de protesto baixado e a carta de anuência pode ser emitida para que o devedor solicite a baixa no cartório, ou a solicitação é feita diretamente pela plataforma quando o tabelionato aceita o fluxo eletrônico.",
  },
  {
    p: "A régua dispara mensagem em qualquer horário?",
    r: "Não. Cada régua tem dias da semana permitidos e uma janela de horário, por padrão das 08:00 às 18:00. Domingos e feriados são bloqueados automaticamente. Devedores marcados como bloqueados ficam fora de qualquer disparo.",
  },
  {
    p: "Como funciona a assinatura eletrônica dos acordos?",
    r: "O PDF do acordo é enviado ao assinador externo junto com os identificadores do caso e os contatos das partes. Quando todos assinam, o assinador chama o webhook de retorno, o documento assinado é anexado ao acordo e o evento fica registrado na auditoria. Opcionalmente, uma mensagem de confirmação é disparada por WhatsApp.",
  },
  {
    p: "Consigo administrar várias empresas na mesma conta?",
    r: "Sim — é o desenho central do produto. Uma conta matriz agrupa várias empresas (CNPJs), cada uma com carteira, régua, índice financeiro, parâmetros de multa e juros e usuários credores próprios. O seletor no topo troca o escopo de todas as telas.",
  },
  {
    p: "Os dados desta demonstração são reais?",
    r: "Não. Toda a base é gerada por um seed determinístico e vive apenas no seu navegador — nenhuma informação sai do dispositivo. Nomes, documentos e valores são fictícios, ainda que os documentos tenham dígito verificador válido para exercitar as validações.",
  },
];

export function SecaoFaq() {
  const [aberta, setAberta] = useState<number | null>(0);

  return (
    <Secao>
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <TituloSecao
            eyebrow="Dúvidas frequentes"
            titulo="O que costumam perguntar antes de começar."
          />
        </div>

        <div className="lg:col-span-8">
          <div className="divide-y divide-line border-y border-line">
            {PERGUNTAS.map((item, i) => {
              const ativa = aberta === i;
              return (
                <div key={item.p}>
                  <button
                    onClick={() => setAberta(ativa ? null : i)}
                    aria-expanded={ativa}
                    className="flex w-full items-start justify-between gap-6 py-5 text-left"
                  >
                    <span
                      className={cn(
                        "font-display text-[15.5px] font-medium transition-colors",
                        ativa ? "text-accent" : "text-fg",
                      )}
                    >
                      {item.p}
                    </span>
                    <Plus
                      size={16}
                      weight="bold"
                      className={cn(
                        "mt-1 shrink-0 transition-transform duration-300",
                        ativa ? "rotate-45 text-accent" : "text-fg-subtle",
                      )}
                    />
                  </button>
                  <div
                    className={cn(
                      "grid transition-[grid-template-rows] duration-300 ease-out",
                      ativa ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                    )}
                  >
                    <div className="overflow-hidden">
                      <p className="max-w-2xl pb-6 text-[14px] leading-relaxed text-fg-muted">
                        {item.r}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Secao>
  );
}
