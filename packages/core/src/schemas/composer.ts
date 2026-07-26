/**
 * Composer input — frontend-spec.md §9.4 and `packages/contracts`' `PostCreate`
 * schema (openapi.yaml). Field names are kept identical to the wire shape
 * (`body_idea`, `field_who`, `field_today`, `tags`) on purpose: no renaming
 * layer to keep in sync by hand. `../type-assertions.ts` ties the inferred
 * output type to `Schemas['PostCreate']` so drift is a compile error, not a
 * runtime surprise.
 */
import { z } from 'zod';

import { IDEA_WORD_MAX, IDEA_WORD_MIN, validateIdeaLength } from '../word-count.js';

/** openapi.yaml `Slug`: lowercase, `^[a-z0-9][a-z0-9-]{0,63}$`. */
const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{0,63}$/;

export const slugSchema = z.string().regex(SLUG_PATTERN, 'must be a lowercase slug');

/** `body_idea`: 50–70 words (frontend-spec §9.4), 1–1200 chars (openapi.yaml). */
export const composerIdeaSchema = z
  .string()
  .min(1)
  .max(1200)
  .refine((value) => validateIdeaLength(value).valid, {
    message: `the idea must be ${IDEA_WORD_MIN} to ${IDEA_WORD_MAX} words`,
  });

/** `field_who` / `field_today`: 1–200 chars (openapi.yaml `PostCreate`). */
export const composerFieldSchema = z.string().trim().min(1).max(200);

/** `tags`: at most two (frontend-spec §9.4, openapi.yaml `maxItems: 2`). */
export const composerTagsSchema = z.array(slugSchema).max(2);

export const composerInputSchema = z.object({
  body_idea: composerIdeaSchema,
  field_who: composerFieldSchema,
  field_today: composerFieldSchema,
  tags: composerTagsSchema.default([]),
});

export type ComposerInput = z.infer<typeof composerInputSchema>;
