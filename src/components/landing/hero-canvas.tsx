"use client";

import { useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------
   Plano de gradiente em WebGL.

   Ruído fBm com domain warping desenha um campo contínuo em tons de
   navy/aço; sobre ele, linhas de nível topográficas dão a leitura técnica
   e sóbria que o contexto jurídico pede. O ponteiro desloca o campo com
   amortecimento, então o movimento é sutil — nunca chamativo.

   Sem bibliotecas: um quad em tela cheia e um fragment shader.
------------------------------------------------------------------- */

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;

uniform vec2  uRes;
uniform float uTime;
uniform vec2  uMouse;
uniform float uDark;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = rot * p;
    a *= 0.5;
  }
  return v;
}

// Rampa de cor da marca: do quase-preto azulado ao azul-gelo.
vec3 ramp(float t) {
  vec3 c0 = vec3(0.016, 0.055, 0.090);
  vec3 c1 = vec3(0.043, 0.125, 0.172);
  vec3 c2 = vec3(0.110, 0.290, 0.395);
  vec3 c3 = vec3(0.235, 0.520, 0.680);
  vec3 c4 = vec3(0.640, 0.820, 0.910);

  vec3 col = mix(c0, c1, smoothstep(0.00, 0.34, t));
  col = mix(col, c2, smoothstep(0.30, 0.62, t));
  col = mix(col, c3, smoothstep(0.58, 0.85, t));
  col = mix(col, c4, smoothstep(0.86, 1.00, t));
  return col;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = (gl_FragCoord.xy * 2.0 - uRes) / uRes.y;

  float t = uTime * 0.045;

  // Domain warping: o campo se dobra sobre si mesmo, criando o fluxo lento.
  vec2 warp = vec2(
    fbm(p * 1.05 + vec2(0.0, t)),
    fbm(p * 1.05 + vec2(5.2, -t) + 3.7)
  );
  vec2 q = p + 0.85 * (warp - 0.5) + (uMouse - 0.5) * 0.30;

  float n = fbm(q * 1.35 + vec2(t * 0.8, -t * 0.5));
  n = clamp(n * 1.28 - 0.06, 0.0, 1.0);

  // Inclinação diagonal: mais luz no canto superior direito.
  float tilt = smoothstep(-1.35, 1.30, p.x * 0.62 + p.y * 0.78);
  float campo = clamp(n * 0.62 + tilt * 0.62, 0.0, 1.0);

  vec3 col = ramp(campo);

  // Linhas de nível — leitura topográfica, quase subliminar.
  float bandas = fract(campo * 11.0);
  float linha = smoothstep(0.0, 0.055, abs(bandas - 0.5));
  col += (1.0 - linha) * 0.085 * vec3(0.70, 0.86, 1.0);

  // Brilho especular acompanhando o ponteiro.
  float halo = 1.0 - smoothstep(0.0, 0.85, distance(uv, uMouse));
  col += halo * 0.075 * vec3(0.55, 0.80, 0.96);

  // Vinheta que ancora o texto sobreposto.
  float vig = smoothstep(1.70, 0.20, length(p * vec2(0.62, 1.0)));
  col *= mix(0.62, 1.06, vig);

  // Grão sutil evita o banding das transições longas.
  float grao = (hash(gl_FragCoord.xy + uTime) - 0.5) * 0.020;
  col += grao;

  col = mix(col, col * 0.86, uDark * 0.35);

  gl_FragColor = vec4(col, 1.0);
}
`;

function compilar(gl: WebGLRenderingContext, tipo: number, fonte: string) {
  const shader = gl.createShader(tipo);
  if (!shader) return null;
  gl.shaderSource(shader, fonte);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function HeroCanvas({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [falhou, setFalhou] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const gl =
      (canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" }) as
        | WebGLRenderingContext
        | null) ??
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);

    if (!gl) {
      setFalhou(true);
      return;
    }

    const vs = compilar(gl, gl.VERTEX_SHADER, VERT);
    const fs = compilar(gl, gl.FRAGMENT_SHADER, FRAG);
    const program = gl.createProgram();
    if (!vs || !fs || !program) {
      setFalhou(true);
      return;
    }
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      setFalhou(true);
      return;
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const aPos = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "uRes");
    const uTime = gl.getUniformLocation(program, "uTime");
    const uMouse = gl.getUniformLocation(program, "uMouse");
    const uDark = gl.getUniformLocation(program, "uDark");

    // Alvo do ponteiro e valor amortecido — o movimento nunca "salta".
    const alvo = { x: 0.62, y: 0.42 };
    const atual = { x: 0.62, y: 0.42 };

    const redimensionar = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      const w = Math.floor(canvas.clientWidth * dpr);
      const h = Math.floor(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    const onPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      alvo.x = (e.clientX - rect.left) / rect.width;
      alvo.y = 1 - (e.clientY - rect.top) / rect.height;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    // Pausa o loop quando o hero sai da viewport.
    let visivel = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        visivel = entry.isIntersecting;
      },
      { threshold: 0.01 },
    );
    observer.observe(canvas);

    let raf = 0;
    const inicio = performance.now();

    const desenhar = () => {
      raf = requestAnimationFrame(desenhar);
      if (!visivel) return;

      redimensionar();
      atual.x += (alvo.x - atual.x) * 0.045;
      atual.y += (alvo.y - atual.y) * 0.045;

      const tempo = reduzido ? 8 : (performance.now() - inicio) / 1000;
      const escuro = document.documentElement.classList.contains("dark") ? 1 : 0;

      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, tempo);
      gl.uniform2f(uMouse, atual.x, atual.y);
      gl.uniform1f(uDark, escuro);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    desenhar();

    const onLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(raf);
      setFalhou(true);
    };
    canvas.addEventListener("webglcontextlost", onLost);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("pointermove", onPointer);
      canvas.removeEventListener("webglcontextlost", onLost);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buffer);
    };
  }, []);

  if (falhou) {
    // Sem WebGL, um gradiente equivalente mantém o hero legível.
    return (
      <div
        className={className}
        aria-hidden
        style={{
          background:
            "radial-gradient(125% 95% at 80% 10%, #5f9cc2 0%, #2e6285 26%, #102b39 62%, #06121a 100%)",
        }}
      />
    );
  }

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}
