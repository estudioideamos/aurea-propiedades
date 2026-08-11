declare module "cloudflare:workers" {
  type D1Value = string | number | null | ArrayBuffer | Uint8Array;
  interface D1Result<T = unknown> {
    results?: T[];
    meta: { last_row_id?: number | string; [key: string]: unknown };
  }
  interface D1PreparedStatement {
    bind(...values: D1Value[]): D1PreparedStatement;
    run<T = unknown>(): Promise<D1Result<T>>;
    first<T = unknown>(): Promise<T | null>;
    all<T = unknown>(): Promise<D1Result<T>>;
  }
  interface D1DatabaseBinding {
    prepare(query: string): D1PreparedStatement;
  }
  export const env: {
    DB: D1DatabaseBinding;
    TOKKO_CONFIG_ENCRYPTION_KEY?: string;
    [key: string]: unknown;
  };
  export function waitUntil(promise: Promise<unknown>): void;
}
