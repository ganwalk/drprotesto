import { buildDatabase, type Database } from "@/data/seed";

/**
 * Contrato único de acesso a dados.
 *
 * A aplicação inteira fala com esta interface — nenhuma tela importa o seed
 * diretamente. Trocar o modo de demonstração pelo backend real é uma questão
 * de definir NEXT_PUBLIC_DATA_SOURCE=http e NEXT_PUBLIC_API_URL; nenhum
 * componente precisa mudar.
 */
export interface DataSource {
  readonly kind: "local" | "http";
  /** Carrega o estado completo da conta autenticada. */
  bootstrap(): Promise<Database>;
  /** Persiste o estado após uma mutação. */
  persist(db: Database): Promise<void>;
  /** Descarta alterações locais e volta ao estado original. */
  reset(): Promise<Database>;
  autenticar(email: string, senha: string): Promise<{ token: string }>;
}

const STORAGE_KEY = "drp:db:v1";
const TOKEN_KEY = "@stricv2:token";

/* ----------------------------- Modo demonstração -------------------------- */

/**
 * Base gerada por seed determinístico e mantida no localStorage, para que as
 * alterações feitas na demonstração sobrevivam ao recarregamento da página.
 */
class LocalDataSource implements DataSource {
  readonly kind = "local" as const;

  async bootstrap(): Promise<Database> {
    if (typeof window === "undefined") return buildDatabase();
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as Database;
    } catch {
      // Estado corrompido ou storage indisponível: recomeça do seed.
    }
    return buildDatabase();
  }

  async persist(db: Database): Promise<void> {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch {
      // Quota estourada ou modo privativo: a sessão segue apenas em memória.
    }
  }

  async reset(): Promise<Database> {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
    }
    return buildDatabase();
  }

  async autenticar(email: string): Promise<{ token: string }> {
    return { token: `demo.${btoa(email).replace(/=/g, "")}.${Date.now()}` };
  }
}

/* ------------------------------- Backend real ----------------------------- */

/**
 * Adaptador REST para api.drprotesto.com.br. Os caminhos abaixo espelham os
 * recursos observados no sistema em produção; ajuste-os se a API divergir.
 */
class HttpDataSource implements DataSource {
  readonly kind = "http" as const;

  constructor(private readonly baseUrl: string) {}

  private token() {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(TOKEN_KEY);
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const token = this.token();
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init?.headers,
      },
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText} — ${path}`);
    }
    return (await res.json()) as T;
  }

  bootstrap() {
    return this.request<Database>("/bootstrap");
  }

  async persist(db: Database) {
    await this.request<void>("/bootstrap", {
      method: "PUT",
      body: JSON.stringify(db),
    });
  }

  reset() {
    return this.request<Database>("/bootstrap?reset=1", { method: "POST" });
  }

  async autenticar(email: string, senha: string) {
    const out = await this.request<{ token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, senha }),
    });
    if (typeof window !== "undefined") {
      window.localStorage.setItem(TOKEN_KEY, out.token);
    }
    return out;
  }
}

let instance: DataSource | null = null;

export function getDataSource(): DataSource {
  if (instance) return instance;
  const mode = process.env.NEXT_PUBLIC_DATA_SOURCE ?? "local";
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  instance = mode === "http" && apiUrl ? new HttpDataSource(apiUrl) : new LocalDataSource();
  return instance;
}

export const IS_DEMO = (process.env.NEXT_PUBLIC_DATA_SOURCE ?? "local") !== "http";
