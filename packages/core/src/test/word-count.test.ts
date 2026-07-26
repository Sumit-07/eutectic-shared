import assert from 'node:assert/strict';
import { test } from 'node:test';

import { IDEA_WORD_MAX, IDEA_WORD_MIN, countWords, validateIdeaLength } from '../word-count.js';

test('countWords counts word-like segments, not whitespace/punctuation', () => {
  assert.equal(countWords('one two three'), 3);
  assert.equal(countWords("it's a test — with an em dash, and a comma."), 10);
  assert.equal(countWords(''), 0);
});

function words(n: number): string {
  return Array.from({ length: n }, (_, i) => `word${i}`).join(' ');
}

test('validateIdeaLength rejects below 50 words', () => {
  const result = validateIdeaLength(words(49));
  assert.equal(result.valid, false);
  assert.equal(result.reason, 'too_short');
  assert.equal(result.count, 49);
  assert.equal(result.min, IDEA_WORD_MIN);
  assert.equal(result.max, IDEA_WORD_MAX);
});

test('validateIdeaLength rejects above 70 words', () => {
  const result = validateIdeaLength(words(71));
  assert.equal(result.valid, false);
  assert.equal(result.reason, 'too_long');
  assert.equal(result.count, 71);
});

test('validateIdeaLength accepts the boundaries, 50 and 70', () => {
  assert.equal(validateIdeaLength(words(50)).valid, true);
  assert.equal(validateIdeaLength(words(70)).valid, true);
  assert.equal(validateIdeaLength(words(50)).reason, undefined);
});
