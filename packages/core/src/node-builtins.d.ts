/**
 * Minimal ambient declarations for the two Node built-ins used by this
 * package's tests only (`src/` itself uses neither — see each module's
 * header: no DOM, no Node builtins in implementation code).
 *
 * Why not `@types/node`: CLAUDE.md rule 12 — no new dependency without
 * Fable's approval, and this package's runtime dependency list is zod plus
 * the two sibling workspace packages. Same precedent as
 * `packages/tokens/src/node-builtins.d.ts` (D-010).
 *
 * If Fable approves `@types/node` workspace-wide (M0-SH-05 is the natural
 * place), delete this file — nothing else changes.
 */

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
    throws(fn: () => unknown, error?: unknown, message?: string): void;
    doesNotThrow(fn: () => unknown, message?: string): void;
    fail(message?: string): never;
  }
  const assert: Assert;
  export default assert;
}
