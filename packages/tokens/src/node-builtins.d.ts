/**
 * Minimal ambient declarations for the Node built-ins this package touches.
 *
 * Why not `@types/node`: CLAUDE.md rule 12 — no new dependency without Fable's
 * approval, and this ticket is specified as zero-dependency. The surface used
 * here is six functions wide, so it is declared rather than installed.
 *
 * If Fable approves `@types/node` workspace-wide (M0-SH-05 is the natural
 * place), delete this file — nothing else changes.
 */

interface ImportMeta {
  readonly url: string;
}

declare class URL {
  constructor(input: string | URL, base?: string | URL);
  readonly href: string;
  toString(): string;
}

declare const process: {
  exitCode: number | undefined;
  readonly stdout: { write(chunk: string): boolean };
  readonly stderr: { write(chunk: string): boolean };
};

declare module 'node:fs/promises' {
  export function readFile(path: URL | string, encoding: 'utf8'): Promise<string>;
  export function writeFile(
    path: URL | string,
    data: string,
    encoding: 'utf8',
  ): Promise<void>;
  export function mkdir(
    path: URL | string,
    options?: { recursive?: boolean },
  ): Promise<string | undefined>;
}

declare module 'node:url' {
  export function fileURLToPath(url: URL | string): string;
}

declare module 'node:test' {
  export function test(name: string, fn: () => void | Promise<void>): void;
}

declare module 'node:assert/strict' {
  interface Assert {
    (value: unknown, message?: string): void;
    ok(value: unknown, message?: string): void;
    equal(actual: unknown, expected: unknown, message?: string): void;
    notEqual(actual: unknown, expected: unknown, message?: string): void;
    deepEqual(actual: unknown, expected: unknown, message?: string): void;
    match(value: string, regexp: RegExp, message?: string): void;
    fail(message?: string): never;
  }
  const assert: Assert;
  export default assert;
}
