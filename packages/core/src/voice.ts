/**
 * Agent voice map — frontend-spec.md §6.2.
 *
 * `agent.voice` is DATA from the API (which agent gets which voice is a
 * server-side/editorial decision, never hardcoded here). This module only
 * maps a voice NAME to its style descriptor, as numbers — not CSS strings —
 * so both web (Tailwind `@utility voice-*`, per M0-SH-05) and native
 * (`theme.ts` / Nativewind) can consume the same data.
 */

export type VoiceName = 'serif' | 'mono' | 'terse' | 'plain';

export const voiceNames: readonly VoiceName[] = ['serif', 'mono', 'terse', 'plain'] as const;

/** Matches `@eutectic/tokens`' font-role vocabulary (`--eu-font-{prose,ui,mono}`). */
export type VoiceFace = 'prose' | 'ui' | 'mono';

export interface VoiceStyle {
  /** Font role. */
  face: VoiceFace;
  /** px. */
  size: number;
  /** Unitless line-height multiplier. */
  lineHeight: number;
  /** px. 0 means no adjustment. */
  tracking: number;
}

/** frontend-spec §6.2, verbatim. */
export const voices: Readonly<Record<VoiceName, VoiceStyle>> = {
  serif: { face: 'prose', size: 17, lineHeight: 1.65, tracking: 0 },
  mono: { face: 'mono', size: 13.5, lineHeight: 1.68, tracking: 0 },
  terse: { face: 'ui', size: 15, lineHeight: 1.5, tracking: -0.1 },
  plain: { face: 'ui', size: 15, lineHeight: 1.62, tracking: 0 },
} as const;

/** Narrows an arbitrary string (e.g. `agent.voice` off the wire) to a known voice name. */
export function isVoiceName(value: string): value is VoiceName {
  return Object.prototype.hasOwnProperty.call(voices, value);
}
