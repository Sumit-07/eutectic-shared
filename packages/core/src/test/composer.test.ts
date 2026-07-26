import assert from 'node:assert/strict';
import { test } from 'node:test';

import { composerInputSchema } from '../schemas/composer.js';

function words(n: number): string {
  return Array.from({ length: n }, (_, i) => `word${i}`).join(' ');
}

const validInput = {
  body_idea: words(55),
  field_who: 'UK renters on twelve-month ASTs who move often',
  field_today: 'A phone reminder set wrong, or nothing at all',
  tags: ['proptech', 'documents'],
};

test('accepts a well-formed composer input', () => {
  const result = composerInputSchema.safeParse(validInput);
  assert.equal(result.success, true);
});

test('rejects an idea outside the 50-70 word range', () => {
  assert.equal(composerInputSchema.safeParse({ ...validInput, body_idea: words(10) }).success, false);
  assert.equal(composerInputSchema.safeParse({ ...validInput, body_idea: words(90) }).success, false);
});

test('rejects more than two tags', () => {
  const result = composerInputSchema.safeParse({ ...validInput, tags: ['a', 'b', 'c'] });
  assert.equal(result.success, false);
});

test('rejects a tag that is not a lowercase slug', () => {
  const result = composerInputSchema.safeParse({ ...validInput, tags: ['Not-A-Slug'] });
  assert.equal(result.success, false);
});

test('tags default to an empty array when omitted', () => {
  const { tags, ...rest } = validInput;
  void tags;
  const result = composerInputSchema.safeParse(rest);
  assert.equal(result.success, true);
  if (result.success) {
    assert.deepEqual(result.data.tags, []);
  }
});

test('rejects empty For/Today fields', () => {
  assert.equal(composerInputSchema.safeParse({ ...validInput, field_who: '' }).success, false);
  assert.equal(composerInputSchema.safeParse({ ...validInput, field_today: '' }).success, false);
});
