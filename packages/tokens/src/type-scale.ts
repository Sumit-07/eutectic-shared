/**
 * The ten-step type scale. Normative source: frontend-spec.md §6.3, verbatim.
 * Sizes are authored here in px; the web emitter converts to rem (÷16) so the
 * scale still respects the browser root size, native keeps the raw px.
 */
import type { TypeScale } from './types.js';

export const typeScale = {
  display: { size: 40, lineHeight: 1.1, face: 'prose' },
  title: { size: 27, lineHeight: 1.2, face: 'prose' },
  head: { size: 22, lineHeight: 1.25, face: 'prose' },
  idea: { size: 19, lineHeight: 1.4, face: 'prose' },
  bodySerif: { size: 17, lineHeight: 1.65, face: 'prose' },
  body: { size: 15, lineHeight: 1.6, face: 'ui' },
  bodyMono: { size: 13.5, lineHeight: 1.68, face: 'mono' },
  label: { size: 13, lineHeight: 1.4, face: 'ui' },
  meta: { size: 12, lineHeight: 1.4, face: 'ui' },
  micro: { size: 10.5, lineHeight: 1.3, face: 'mono' },
} as const satisfies TypeScale;
