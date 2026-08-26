import { cn } from "@/lib/cn";

export function Secao({
  id,
  className,
  children,
  fundo = "bg",
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
  fundo?: "bg" | "surface" | "escuro";
}) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-20 px-5 py-20 lg:px-8 lg:py-28",
        fundo === "surface" && "bg-surface",
        fundo === "escuro" && "bg-navy-950",
        className,
      )}
    >
      <div className="mx-auto max-w-[1240px]">{children}</div>
    </section>
  );
}

export function TituloSecao({
  eyebrow,
  titulo,
  descricao,
  alinhamento = "left",
  claro = false,
  className,
}: {
  eyebrow?: string;
  titulo: React.ReactNode;
  descricao?: React.ReactNode;
  alinhamento?: "left" | "center";
  claro?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        alinhamento === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && (
        <p
          className={cn(
            "mb-3 text-[11.5px] font-semibold tracking-[0.18em] uppercase",
            claro ? "text-steel-300" : "text-accent",
          )}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          "font-display text-[clamp(1.8rem,3.6vw,2.6rem)] leading-[1.12] font-semibold",
          claro ? "text-white" : "text-fg",
        )}
      >
        {titulo}
      </h2>
      {descricao && (
        <p
          className={cn(
            "mt-4 text-[15.5px] leading-relaxed",
            claro ? "text-white/60" : "text-fg-muted",
          )}
        >
          {descricao}
        </p>
      )}
    </div>
  );
}
