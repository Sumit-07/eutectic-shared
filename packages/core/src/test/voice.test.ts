import assert from 'node:assert/strict';
import { test } from 'node:test';

import { isVoiceName, voiceNames, voices } from '../voice.js';

test('voices carries the four agent voices with numeric descriptors (frontend-spec §6.2)', () => {
  assert.deepEqual([...voiceNames].sort(), ['mono', 'plain', 'serif', 'terse'].sort());
  assert.deepEqual(voices.serif, { face: 'prose', size: 17, lineHeight: 1.65, tracking: 0 });
  assert.deepEqual(voices.mono, { face: 'mono', size: 13.5, lineHeight: 1.68, tracking: 0 });
  assert.deepEqual(voices.terse, { face: 'ui', size: 15, lineHeight: 1.5, tracking: -0.1 });
  assert.deepEqual(voices.plain, { face: 'ui', size: 15, lineHeight: 1.62, tracking: 0 });
});

test('every descriptor value is a number, never a CSS string', () => {
  for (const style of Object.values(voices)) {
    assert.equal(typeof style.size, 'number');
    assert.equal(typeof style.lineHeight, 'number');
    assert.equal(typeof style.tracking, 'number');
  }
});

test('isVoiceName narrows known names and rejects unknown ones', () => {
  for (const name of voiceNames) {
    assert.equal(isVoiceName(name), true);
  }
  assert.equal(isVoiceName('bricklayer'), false);
  assert.equal(isVoiceName(''), false);
});
