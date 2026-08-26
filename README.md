# DR PROTESTO

Plataforma de recuperação de crédito ponta a ponta: régua de cobrança automatizada,
protesto extrajudicial via CENPROT, negociação de acordos com assinatura eletrônica,
acompanhamento de processos judiciais e liquidação por PIX — landing page e ferramenta
no mesmo projeto.

A implementação segue o mapeamento funcional do sistema em produção (módulos, rotas,
fluxos de status e integrações), recriando a experiência com dados fictícios gerados
no navegador.

---

## Rodando localmente

```bash
npm install
npm run dev          # http://localhost:3000
```

Outros comandos:

```bash
npm run build        # gera o export estático em out/
npm run typecheck    # tsc --noEmit
npm run lint
```

Para conferir o build estático como ele será servido em produção:

```bash
npm run build
npx serve out
```

---

## Deploy no GitHub Pages

O projeto já está configurado para export estático (`output: "export"` em
`next.config.ts`) e acompanha o workflow `.github/workflows/deploy.yml`.

Para publicar:

1. Vá em **Settings → Pages** do repositório.
2. Em **Source**, selecione **GitHub Actions**.
3. Faça push para `main` (ou rode o workflow manualmente em **Actions →
   Deploy to GitHub Pages → Run workflow**).

O workflow instala as dependências, roda o typecheck, gera o export e publica.
O `basePath` é resolvido automaticamente: em Pages de projeto o site vive em
`/<nome-do-repo>`, e em Pages de usuário (`<usuario>.github.io`) fica na raiz.

Para rodar o build local apontando para um subcaminho:

```bash
NEXT_PUBLIC_BASE_PATH=/drprotesto npm run build
```

---

## Arquitetura

```
src/
  app/                      Rotas (App Router)
    page.tsx                Landing page
    entrar/                 Autenticação
    dashboard/              Aplicação — 22 telas espelhando os módulos do sistema
  components/
    landing/                Seções da LP + hero WebGL
    dashboard/              Shell, drawers, modais e componentes de módulo
    ui/                     Design system (botões, tabela, gráficos, overlays)
    brand/                  Marca
  data/                     Seed determinístico e vocabulário
  lib/                      Domínio, formatação, status, consulta cadastral
  services/                 Camada de acesso a dados (mock ↔ HTTP)
  store/                    Estado global (Zustand) e seletores derivados
```

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
Zustand · Recharts · Phosphor Icons · qrcode.

**Hero WebGL:** shader próprio (`components/landing/hero-canvas.tsx`), sem
bibliotecas 3D — ruído fBm com *domain warping* e linhas de nível topográficas,
com fallback em gradiente CSS quando não há contexto WebGL e pausa automática
fora da viewport ou com `prefers-reduced-motion`.

---

## Dados de demonstração

Toda a base é gerada por um seed determinístico (`src/data/seed.ts`) e vive
apenas no `localStorage` do navegador — nada trafega para servidores.

- 4 empresas (CNPJs) sob uma conta matriz
- ~148 devedores e ~330 títulos distribuídos por todos os estágios do protesto
- Réguas de cobrança, avisos, acordos, processos, cobranças PIX, extrato,
  despesas e conversas de WhatsApp

CPFs e CNPJs têm dígito verificador válido e os números de processo seguem o
padrão CNJ, para exercitar as validações reais das telas. Nomes, valores e
documentos são fictícios.

A data de referência do conjunto é fixa (`ANCHOR_DATE` em `src/lib/domain.ts`),
o que mantém o seed reprodutível entre o build e a visita — sem divergência de
hidratação e sem números que mudam sozinhos.

Para voltar ao estado original: **Sobre o sistema → Restaurar base de
demonstração**, ou limpe o `localStorage` do site.

---

## Conectando o backend real

A aplicação inteira acessa dados através da interface `DataSource`
(`src/services/datasource.ts`). Nenhuma tela importa o seed diretamente.

Existem dois adaptadores:

| Adaptador | Quando é usado | O que faz |
| --- | --- | --- |
| `LocalDataSource` | padrão | Seed determinístico + `localStorage` |
| `HttpDataSource` | `NEXT_PUBLIC_DATA_SOURCE=http` | REST contra `NEXT_PUBLIC_API_URL` |

Para apontar ao backend real, defina as variáveis:

```bash
NEXT_PUBLIC_DATA_SOURCE=http
NEXT_PUBLIC_API_URL=https://api.drprotesto.com.br
```

O adaptador HTTP espera:

- `GET  /bootstrap` → estado completo da conta (formato de `Database`)
- `PUT  /bootstrap` → persistência após mutação
- `POST /bootstrap?reset=1` → restauração
- `POST /auth/login` → `{ token }`, persistido como `@stricv2:token`

Ajuste os caminhos em `HttpDataSource` se a API divergir. O token é enviado
como `Authorization: Bearer`.

Ao migrar para um host com Node (Vercel, Fly, container próprio), remova
`output: "export"` e `images.unoptimized` de `next.config.ts` — nenhum código
de aplicação depende do modo de export.

### O que ainda depende de integração externa

Estas partes estão implementadas na interface e no modelo, mas simuladas na
camada de dados — cada uma indica na própria tela onde o serviço real entra:

- **CENPROT** — remessa e retorno de status de protesto
- **Assinador digital** — envio do PDF e webhook de retorno (payloads
  documentados em *Integrações*)
- **WhatsApp** — pareamento por QR Code e envio de mensagens
- **PIX** — o payload copia-e-cola segue o formato EMV e o QR Code é real, mas
  a liquidação não consulta um PSP
- **TJDFT / JurisCalc** — a calculadora usa taxa média mensal por índice; a API
  oficial devolve o fator acumulado exato
- **Consulta cadastral** — gerada localmente a partir do documento

---

## Acessibilidade e temas

Tema claro e escuro em todas as telas, via tokens CSS semânticos. Foco visível
consistente, navegação por teclado nos overlays (Esc fecha), `aria-label` nos
controles de ícone e respeito a `prefers-reduced-motion` nas animações e no
shader do hero.
