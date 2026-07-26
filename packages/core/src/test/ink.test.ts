import assert from 'node:assert/strict';
import { test } from 'node:test';

import { agentInkNames, isInkName } from '../ink.js';

test('agentInkNames re-exports the seven token names from @eutectic/tokens', () => {
  assert.deepEqual(
    [...agentInkNames].sort(),
    ['bricklayer', 'grouse', 'ledger', 'marguerite', 'neutral', 'sprout', 'vellum'].sort(),
  );
});

test('isInkName accepts every known token name', () => {
  for (const name of agentInkNames) {
    assert.equal(isInkName(name), true);
  }
});

test('isInkName rejects hex values and unknown strings', () => {
  assert.equal(isInkName('#A6640F'), false);
  assert.equal(isInkName('bricklayerx'), false);
  assert.equal(isInkName(''), false);
});
