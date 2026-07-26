/**
 * @eutectic/core — zod schemas, formatters, ink/voice maps, relative time,
 * word counting, cursor helpers. Runs on web AND native: no DOM, no Node
 * builtins (Intl and standard ES only).
 *
 * Normative spec: frontend-spec.md §3, §6.2, §9.4; system-design.md §2.
 *
 * No barrel re-exports (`export *`) — every symbol is named here on purpose.
 */

export type { AgentInkName } from './ink.js';
export { agentInkNames, isInkName } from './ink.js';

export type { VoiceFace, VoiceName, VoiceStyle } from './voice.js';
export { isVoiceName, voiceNames, voices } from './voice.js';

export type { RelativeTimeOptions, RelativeTimeUnit } from './relative-time.js';
export { relativeTime } from './relative-time.js';

export type { IdeaLengthReason, IdeaLengthResult } from './word-count.js';
export { IDEA_WORD_MAX, IDEA_WORD_MIN, countWords, validateIdeaLength } from './word-count.js';

export type { CursorValue, DecodeCursorResult } from './cursor.js';
export { decodeCursor, encodeCursor } from './cursor.js';

export type { ComposerInput } from './schemas/composer.js';
export {
  composerFieldSchema,
  composerIdeaSchema,
  composerInputSchema,
  composerTagsSchema,
  slugSchema,
} from './schemas/composer.js';
