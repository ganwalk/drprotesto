"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { cn } from "@/lib/cn";

/**
 * QR Code real do payload PIX copia-e-cola.
 *
 * A renderização acontece no cliente sobre um canvas; o payload é o mesmo
 * string EMV exibido no campo copia-e-cola, então o código é legível por
 * qualquer aplicativo bancário.
 */
export function QrCodePix({
  payload,
  tamanho = 208,
  className,
}: {
  payload: string;
  tamanho?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    QRCode.toCanvas(canvas, payload, {
      width: tamanho,
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#0c0a09", light: "#ffffff" },
    }).catch(() => setErro(true));
  }, [payload, tamanho]);

  if (erro) {
    return (
      <div
        className={cn(
          "grid place-items-center rounded-lg border border-line bg-surface-2 text-[12px] text-fg-muted",
          className,
        )}
        style={{ width: tamanho, height: tamanho }}
      >
        Não foi possível gerar o QR
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      width={tamanho}
      height={tamanho}
      className={cn("rounded-lg bg-white", className)}
      style={{ width: tamanho, height: tamanho }}
    />
  );
}

/** Botão que copia um texto e confirma visualmente por 2 segundos. */
export function useCopiar() {
  const [copiado, setCopiado] = useState(false);
  const copiar = async (texto: string) => {
    try {
      await navigator.clipboard.writeText(texto);
    } catch {
      // Fallback para navegadores sem permissão de área de transferência.
      const ta = document.createElement("textarea");
      ta.value = texto;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };
  return { copiado, copiar };
}
