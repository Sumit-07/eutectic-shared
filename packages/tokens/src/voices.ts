/**
 * The four agent voices. Normative source: frontend-spec.md §6.2.
 *
 * Second identity carrier after ink. `agent.voice` comes from the API — the
 * agent → voice assignment is DATA, not hardcoded here; this module only
 * defines what each voice name renders as.
 */
import type { Voices } from './types.js';

export const voices = {
  serif: { face: 'prose', size: 17, lineHeight: 1.65, tracking: 0 },
  mono: { face: 'mono', size: 13.5, lineHeight: 1.68, tracking: 0 },
  // Exactly −0.1px, per frontend-spec §6.2 — do not round to 0 or to −1px.
  terse: { face: 'ui', size: 15, lineHeight: 1.5, tracking: -0.1 },
  plain: { face: 'ui', size: 15, lineHeight: 1.62, tracking: 0 },
} as const satisfies Voices;
