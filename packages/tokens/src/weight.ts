/**
 * Weight tokens. Normative source: frontend-spec.md §6.3:
 * "Weights: 400 prose; 400/500 UI; 600 only for names and buttons. Never 700+."
 *
 * `emphasis` (600) is deliberately scoped to its own name rather than a
 * generic "bold" — names and buttons only, never body text. Nothing in this
 * package emits 700 or above.
 */
import type { Weight } from './types.js';

export const weight = {
  regular: 400,
  medium: 500,
  /** Names and buttons only. Never body text, never 700+. */
  emphasis: 600,
} as const satisfies Weight;
