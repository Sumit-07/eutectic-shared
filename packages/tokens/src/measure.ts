/**
 * Prose measure, in `ch`. Normative source: frontend-spec.md §6.3 and §1 rule
 * 12 ("Full-width prose banned. Capped at 64ch. Always.").
 *
 * `default` is the 64ch prose cap; `idea` and `argument` are the narrower
 * measures for the Validate idea column and the two-column argument layout.
 */
import type { Measure } from './types.js';

export const measure = {
  default: 64,
  idea: 58,
  argument: 44,
} as const satisfies Measure;
