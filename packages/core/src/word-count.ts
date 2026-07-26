/**
 * Unicode-aware word counting — frontend-spec.md §9.4 (Composer idea field,
 * 50–70 words) — via `Intl.Segmenter`'s word granularity. No date/utility lib.
 */

/** Counts word-like segments in `text` for `locale` (BCP 47, defaults to `en`). */
export function countWords(text: string, locale = 'en'): number {
  const segmenter = new Intl.Segmenter(locale, { granularity: 'word' });
  let count = 0;
  for (const segment of segmenter.segment(text)) {
    if (segment.isWordLike) {
      count += 1;
    }
  }
  return count;
}

/** frontend-spec §9.4 — the idea field's word range. */
export const IDEA_WORD_MIN = 50;
export const IDEA_WORD_MAX = 70;

/** Machine-readable reason, mirrors the API's `issue: word_count` vocabulary (openapi.yaml). */
export type IdeaLengthReason = 'too_short' | 'too_long';

export interface IdeaLengthResult {
  valid: boolean;
  count: number;
  min: number;
  max: number;
  reason?: IdeaLengthReason;
}

/** Validates the idea field's word count against the 50–70 range (frontend-spec §9.4). */
export function validateIdeaLength(text: string, locale = 'en'): IdeaLengthResult {
  const count = countWords(text, locale);
  if (count < IDEA_WORD_MIN) {
    return { valid: false, count, min: IDEA_WORD_MIN, max: IDEA_WORD_MAX, reason: 'too_short' };
  }
  if (count > IDEA_WORD_MAX) {
    return { valid: false, count, min: IDEA_WORD_MIN, max: IDEA_WORD_MAX, reason: 'too_long' };
  }
  return { valid: true, count, min: IDEA_WORD_MIN, max: IDEA_WORD_MAX };
}
