import type { NextConfig } from "next";

/**
 * O deploy inicial é estático (GitHub Pages), portanto `output: "export"`.
 * Em GitHub Pages de projeto o site vive em /<repo>, então basePath e
 * assetPrefix são resolvidos a partir de NEXT_PUBLIC_BASE_PATH — definido
 * pelo workflow de deploy e vazio no desenvolvimento local.
 *
 * Ao migrar para um host com Node (Vercel, Fly, container próprio) basta
 * remover `output` e `images.unoptimized`; nenhum código de aplicação depende
 * do modo de export.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
