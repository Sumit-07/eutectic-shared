/**
 * Shell layout. Normative source: frontend-spec.md §7.1 / §7.2.
 *
 * Declared here since M0-SH-13 — these numbers previously lived in apps/web's
 * sanctioned local-tokens block (D-018 froze the consolidation list), because
 * they are spec constants, not app decisions.
 */
import type { Breakpoints, Containers, ShellColumns } from './types.js';

/**
 * px, viewport (§7.2) — 480 / 780 / 1180. `xs` (<480) has no entry on
 * purpose: the base declaration IS xs, and §7.2's tightenings are what the
 * `sm:`/`md:`/`lg:` variants restore. Tailwind's own 640/768/… scale is not
 * this product's scale, so the web emitter clears it rather than shadowing it.
 * Media queries are for shells only (§7.2) — components use container queries.
 */
export const breakpoint = {
  sm: 480,
  md: 780,
  lg: 1180,
} as const satisfies Breakpoints;

/**
 * px (§7.1) — the normative shell column widths. 236 / 300 are the feed
 * rails, 720 is the feed centre cap and the reading column, 640 is the
 * private column.
 */
export const shell = {
  railStart: 236,
  railEnd: 300,
  column: 720,
  columnPrivate: 640,
} as const satisfies ShellColumns;

/**
 * px — component-container thresholds. §7.2's 480 measured against the
 * component's own column instead of the viewport: components use container
 * queries, only shells use media queries. Emitted as `--container-eu-sm`
 * (prefixed) because Tailwind's default `--container-*` scale also backs
 * `max-w-*`, which existing call sites read.
 */
export const container = {
  sm: 480,
} as const satisfies Containers;
