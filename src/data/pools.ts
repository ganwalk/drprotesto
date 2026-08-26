/** Vocabulário do seed: nomes, cidades, cartórios e categorias. */

export const NOMES_PF = [
  "Adriana Vasconcelos Prado", "Ricardo Menezes Albuquerque", "Juliana Sampaio Ferraz",
  "Marcelo Tavares Bittencourt", "Patrícia Nogueira Rangel", "Eduardo Quintanilha Serra",
  "Camila Andrade Peixoto", "Rogério Almeida Vilela", "Fernanda Barcellos Moreira",
  "Anderson Pacheco Lousada", "Simone Rezende Caldeira", "Otávio Cerqueira Bastos",
  "Larissa Fontoura Medeiros", "Gustavo Sarmento Vieira", "Débora Cavalcanti Rios",
  "Henrique Marinho Falcão", "Vanessa Loureiro Amorim", "Cristiano Bezerra Pontes",
  "Renata Guimarães Sodré", "Thiago Barroso Machado", "Priscila Antunes Werneck",
  "Leandro Figueiredo Duarte", "Michele Braga Fontes", "Alexandre Pinheiro Coutinho",
  "Tatiane Oliveira Sarmento", "Fábio Castilho Meireles", "Aline Corrêa Bandeira",
  "Rodrigo Estevam Portela", "Carolina Nunes Assunção", "Wagner Teixeira Malta",
  "Sabrina Lacerda Fontenele", "Márcio Aurélio Damasceno", "Elaine Cristina Bagnoli",
  "Vinícius Rebouças Tolentino", "Karla Vieira Monteiro", "Sérgio Bandeira Trindade",
  "Bianca Salgado Peralta", "Jonatas Ribeiro Valadares", "Mariana Estrela Cordeiro",
  "Daniel Vilaça Sampaio", "Luciana Prates Bonfim", "Everton Siqueira Rabelo",
  "Natália Frota Aguiar", "Paulo Sérgio Vasques", "Rafaela Monteiro Bastos",
  "Douglas Ferrari Nogueira", "Isabela Moraes Toledo", "Cláudio Renato Bulhões",
  "Verônica Paes Landim", "Márcia Helena Sobral", "Gilberto Assunção Xavier",
  "Amanda Lisboa Ferrão", "Nelson Aguiar Portugal", "Rosana Britto Vilanova",
  "Emerson Padilha Quaresma", "Talita Rocha Sanches", "Ivan Bacelar Nogueira",
  "Cíntia Rodrigues Peçanha", "Maurício Salles Trindade", "Josiane Bento Uchôa",
];

export const NOMES_PJ = [
  "Comercial Vértice Distribuidora", "Móveis Aurora Indústria", "Rede Bonaparte Varejo",
  "Colchões Norte Sul", "Estofados Primavera", "Atacadão Serra Verde",
  "Casa & Sono Comércio", "Distribuidora Trilhos do Vale", "Lar Perfeito Magazine",
  "Rede Dormir Bem Franquias", "Espumas Fortaleza Indústria", "Grupo Meridiano Varejo",
  "Sono Real Comércio", "Central de Colchões Ipiranga", "Estofaria Bandeirantes",
  "Móveis do Cerrado", "Rede Confort Home", "Distribuidora Ponta Norte",
  "Colchoaria São Bento", "Magazine Vila Rica", "Deposito Central Sul",
  "Comercial Aliança Móveis", "Grupo Ventura Retail", "Lojas Bem Estar",
  "Indústria Textil Marambaia", "Rede Casa Nova Móveis", "Distribuidora Cataguases",
  "Sono & Cia Comércio", "Espumatec Componentes", "Rede Descanso Total",
];

export const SUFIXOS_PJ = ["LTDA", "S/A", "EIRELI", "ME", "LTDA"];

export const CIDADES: Array<[string, string]> = [
  ["São Paulo", "SP"], ["Guarulhos", "SP"], ["Campinas", "SP"], ["Santo André", "SP"],
  ["Rio de Janeiro", "RJ"], ["Niterói", "RJ"], ["Duque de Caxias", "RJ"],
  ["Belo Horizonte", "MG"], ["Contagem", "MG"], ["Uberlândia", "MG"],
  ["Curitiba", "PR"], ["Londrina", "PR"], ["Joinville", "SC"], ["Florianópolis", "SC"],
  ["Porto Alegre", "RS"], ["Caxias do Sul", "RS"], ["Goiânia", "GO"], ["Brasília", "DF"],
  ["Salvador", "BA"], ["Feira de Santana", "BA"], ["Recife", "PE"], ["Fortaleza", "CE"],
  ["Manaus", "AM"], ["Belém", "PA"], ["Vitória", "ES"], ["Serra", "ES"],
  ["Campo Grande", "MS"], ["Cuiabá", "MT"], ["Natal", "RN"], ["João Pessoa", "PB"],
];

export const CARTORIOS = [
  "1º Tabelionato de Protesto de Letras e Títulos",
  "2º Tabelionato de Protesto de Letras e Títulos",
  "3º Tabelionato de Protesto de Letras e Títulos",
  "4º Tabelionato de Protesto de Letras e Títulos",
  "5º Tabelionato de Protesto de Letras e Títulos",
  "Tabelionato Único de Protesto",
];

export const MOTIVOS_DEVOLUCAO = [
  "Devedor não localizado no endereço informado",
  "Irregularidade formal no título apresentado",
  "Pagamento comprovado antes da lavratura",
  "Dados do sacado divergentes da base do cartório",
  "Título prescrito para fins de protesto",
  "Sustação judicial do protesto",
];

export const ERROS_AVISO = [
  "E-mail inexistente (bounce permanente)",
  "Caixa de entrada cheia",
  "Número não possui WhatsApp ativo",
  "Sessão do WhatsApp desconectada no momento do disparo",
  "Devedor optou por não receber mensagens",
  "Domínio do destinatário rejeitou a mensagem",
  "Timeout na entrega — reenvio agendado",
];

export const COMARCAS = [
  "Comarca de São Paulo — Foro Central Cível",
  "Comarca do Rio de Janeiro — Foro Central",
  "Comarca de Belo Horizonte",
  "Comarca de Curitiba",
  "Comarca de Porto Alegre",
  "Comarca de Goiânia",
  "Comarca de Brasília — Circunscrição Especial Judiciária",
];

export const VARAS = [
  "12ª Vara Cível", "4ª Vara Cível", "7ª Vara Cível", "2ª Vara Empresarial",
  "18ª Vara Cível", "9ª Vara Cível", "1ª Vara de Execuções Fiscais",
];

export const MOVIMENTACOES = [
  ["Distribuição por sorteio", "Processo distribuído e autuado eletronicamente."],
  ["Recolhimento de custas", "Guia de custas iniciais recolhida e juntada aos autos."],
  ["Citação expedida", "Mandado de citação expedido ao oficial de justiça."],
  ["Juntada de petição", "Petição do credor juntada aos autos com documentos comprobatórios."],
  ["Certidão do oficial", "Oficial de justiça certificou o cumprimento parcial do mandado."],
  ["Contestação apresentada", "Parte ré apresentou contestação no prazo legal."],
  ["Audiência de conciliação designada", "Audiência designada no CEJUSC da comarca."],
  ["Acordo homologado", "Termo de acordo homologado por sentença."],
  ["Penhora on-line deferida", "Deferida consulta a ativos financeiros via SISBAJUD."],
  ["Arquivamento provisório", "Autos remetidos ao arquivo provisório."],
];

export const CATEGORIAS_DESPESA = [
  "Custas processuais", "Emolumentos de cartório", "Honorários advocatícios",
  "Diligência de oficial", "Certidões e taxas", "Correios e postagem",
  "Software e integrações", "Consultas cadastrais",
];

export const FORNECEDORES = [
  "TJSP — Guia de custas", "IEPTB Nacional", "Cartório 2º Ofício",
  "Escritório Bastos & Falcão", "Correios", "Serasa Experian",
  "CENPROT — Taxa de remessa", "Cloud Signature Br",
];

export const BANCOS = [
  "Banco do Brasil", "Itaú Unibanco", "Bradesco", "Santander", "Caixa Econômica",
  "Nubank", "Banco Inter", "Sicredi", "BTG Pactual",
];

export const MSG_DEVEDOR = [
  "Boa tarde, recebi a notificação. Consigo pagar só na semana que vem, dá pra segurar?",
  "Já efetuei esse pagamento no dia 12, vou mandar o comprovante.",
  "Qual o valor atualizado com os juros? Quero quitar tudo de uma vez.",
  "Consigo parcelar em quantas vezes?",
  "Não reconheço essa cobrança, pode me enviar a nota fiscal?",
  "Pode me mandar o PIX novamente? O código anterior expirou.",
  "Estou desempregado no momento, tem alguma condição especial?",
  "Quero falar com um atendente, por favor.",
  "Ok, combinado. Vou pagar a entrada hoje ainda.",
  "Recebi o contrato por e-mail, já assinei.",
];

export const MSG_SISTEMA = [
  "Olá, {{primeiro_nome}}. Identificamos o título {{numero_titulo}} em aberto no valor de {{valor_cobranca}}, vencido em {{vencimento}}. Regularize pelo link: {{link_pagamento}}",
  "{{primeiro_nome}}, seu título {{numero_titulo}} vence hoje. Evite encargos e protesto — pague agora: {{link_pagamento}}",
  "Aviso de pré-protesto: o título {{numero_titulo}} está com {{dias_atraso}} dias de atraso. Após esse prazo, o título será encaminhado a cartório.",
  "Temos uma proposta de acordo para você com desconto. Responda SIM para receber as condições.",
];

export const MSG_OPERADOR = [
  "Bom dia! Consigo sim parcelar em até 6x com entrada de 20%. Posso gerar a proposta?",
  "Claro, segue o valor atualizado até hoje. Vou te enviar o PIX em seguida.",
  "Verifiquei aqui e o pagamento não consta na nossa conciliação. Pode me enviar o comprovante com o ID da transação?",
  "Perfeito, acabei de enviar o contrato para assinatura no seu e-mail.",
  "Registrado. Assim que o pagamento cair, damos baixa e solicitamos a baixa do protesto.",
];

export const CARGOS = [
  "Analista de crédito e cobrança", "Coordenadora de recuperação", "Gerente financeiro",
  "Assistente de cobrança", "Supervisor de crédito", "Controller",
  "Advogado interno", "Analista fiscal",
];
