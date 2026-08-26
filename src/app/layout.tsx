import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Instrument_Sans, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "DR PROTESTO — Recuperação de crédito, do aviso ao protesto",
    template: "%s · DR PROTESTO",
  },
  description:
    "Plataforma de recuperação de crédito: régua de cobrança automatizada, protesto extrajudicial via CENPROT, acordos com assinatura digital, acompanhamento jurídico e liquidação por PIX — em um só lugar.",
  applicationName: "DR PROTESTO",
  keywords: [
    "recuperação de crédito",
    "protesto extrajudicial",
    "CENPROT",
    "régua de cobrança",
    "acordo de dívida",
    "cobrança PIX",
  ],
  authors: [{ name: "DR PROTESTO" }],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "DR PROTESTO",
    title: "DR PROTESTO — Recuperação de crédito ponta a ponta",
    description:
      "Do primeiro aviso ao protesto em cartório, com acordos digitais e liquidação por PIX.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f7fa" },
    { media: "(prefers-color-scheme: dark)", color: "#06121a" },
  ],
};

/** Aplica o tema salvo antes da primeira pintura, evitando o flash claro. */
const TEMA_SCRIPT = `
(function(){try{
  var t = localStorage.getItem('drp:tema');
  if(t === 'dark') document.documentElement.classList.add('dark');
}catch(e){}})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${inter.variable} ${instrument.variable} ${plexMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: TEMA_SCRIPT }} />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
