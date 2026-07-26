/**
 * Space, radius, shadow, z, motion. Normative source: frontend-spec.md §5.4.
 * These are theme-independent. No spring physics, no bounce, nothing over dur[3].
 */
import type { Dur, Ease, Radius, Shadow, Space, Z } from './types.js';

/** px */
export const space = {
  1: 2,
  2: 4,
  3: 8,
  4: 12,
  5: 16,
  6: 20,
  7: 24,
  8: 32,
  9: 40,
  10: 56,
  11: 80,
} as const satisfies Space;

/** px */
export const radius = {
  none: 0,
  sm: 2,
  md: 3,
  full: 999,
} as const satisfies Radius;

export const shadow = {
  sheet: '0 1px 2px rgb(22 23 26/.04), 0 8px 24px rgb(22 23 26/.08)',
  pop: '0 1px 2px rgb(22 23 26/.05), 0 4px 12px rgb(22 23 26/.07)',
  inset: 'inset 0 1px 0 rgb(22 23 26/.03)', // composer only
} as const satisfies Shadow;

export const z = {
  sticky: 10,
  pill: 20,
  sheet: 40,
  toast: 50,
} as const satisfies Z;

/** ms — nothing longer */
export const dur = {
  1: 120,
  2: 180,
  3: 280,
} as const satisfies Dur;

export const ease = {
  out: 'cubic-bezier(.2,.8,.3,1)',
  inOut: 'cubic-bezier(.5,0,.3,1)',
} as const satisfies Ease;
