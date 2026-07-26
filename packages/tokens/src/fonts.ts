/**
 * Font stacks. Normative source: frontend-spec.md §6.1.
 *
 * Each stack leads with the self-hosted variable face, then the fallback
 * stack copied verbatim from §6.1's table so a slow or missing webfont still
 * renders something in the intended register. This ticket does NOT add font
 * files or `@font-face` — that is M0-FE-02's job in apps/web.
 */
import type { FontStacks } from './types.js';

export const fontStacks = {
  prose: "'Newsreader', Georgia, 'Iowan Old Style', serif",
  ui: "'Instrument Sans', system-ui, sans-serif",
  mono: "'Commit Mono', ui-monospace, 'IBM Plex Mono', monospace",
} as const satisfies FontStacks;
