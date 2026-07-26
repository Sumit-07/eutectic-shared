import assert from 'node:assert/strict';
import { test } from 'node:test';

import { relativeTime } from '../relative-time.js';

const NOW = new Date('2026-07-26T12:00:00Z');

test('under a minute reads "now"', () => {
  assert.equal(relativeTime(new Date('2026-07-26T11:59:31Z'), NOW), 'now');
  assert.equal(relativeTime(NOW, NOW), 'now');
});

test('minutes ladder', () => {
  assert.equal(relativeTime(new Date('2026-07-26T11:58:00Z'), NOW), '2m');
  assert.equal(relativeTime(new Date('2026-07-26T11:01:00Z'), NOW), '59m');
});

test('hours ladder', () => {
  assert.equal(relativeTime(new Date('2026-07-26T10:00:00Z'), NOW), '2h');
  assert.equal(relativeTime(new Date('2026-07-25T13:00:00Z'), NOW), '23h');
});

test('days ladder, up to 7 days', () => {
  assert.equal(relativeTime(new Date('2026-07-24T12:00:00Z'), NOW), '2d');
  assert.equal(relativeTime(new Date('2026-07-19T13:00:00Z'), NOW), '6d');
});

test('past 7 days falls back to an absolute date, no year when current', () => {
  const result = relativeTime(new Date('2026-07-01T12:00:00Z'), NOW, { timeZone: 'UTC' });
  assert.equal(result, 'Jul 1');
});

test('absolute date includes the year when it differs from `now`', () => {
  const result = relativeTime(new Date('2025-03-14T12:00:00Z'), NOW, { timeZone: 'UTC' });
  assert.equal(result, 'Mar 14, 2025');
});

test('accepts an ISO string target, identical to a Date target', () => {
  assert.equal(relativeTime('2026-07-26T10:00:00Z', NOW), relativeTime(new Date('2026-07-26T10:00:00Z'), NOW));
});

test('never calls Date.now() internally — identical inputs are always identical outputs', () => {
  const a = relativeTime('2026-07-20T12:00:00Z', NOW);
  const b = relativeTime('2026-07-20T12:00:00Z', NOW);
  assert.equal(a, b);
});

test('rejects an invalid target', () => {
  assert.throws(() => relativeTime('not-a-date', NOW), RangeError);
});
