import assert from 'node:assert/strict';
import { test } from 'node:test';

import { decodeCursor, encodeCursor } from '../cursor.js';

// Test-only base64url encoder (ASCII input) to hand-craft payloads that
// `encodeCursor` itself would never produce, e.g. one with no separator.
// src/cursor.ts never uses a browser/Node built-in codec — see its header.
const B64URL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
function encodeAsciiBase64Url(ascii: string): string {
  const bytes = Array.from(ascii, (ch) => ch.charCodeAt(0));
  let out = '';
  let i = 0;
  for (; i + 3 <= bytes.length; i += 3) {
    const [b0, b1, b2] = [bytes[i]!, bytes[i + 1]!, bytes[i + 2]!];
    out += B64URL[b0 >> 2]! + B64URL[((b0 & 0x3) << 4) | (b1 >> 4)]! + B64URL[((b1 & 0xf) << 2) | (b2 >> 6)]! + B64URL[b2 & 0x3f]!;
  }
  const remaining = bytes.length - i;
  if (remaining === 1) {
    const b0 = bytes[i]!;
    out += B64URL[b0 >> 2]! + B64URL[(b0 & 0x3) << 4]!;
  } else if (remaining === 2) {
    const [b0, b1] = [bytes[i]!, bytes[i + 1]!];
    out += B64URL[b0 >> 2]! + B64URL[((b0 & 0x3) << 4) | (b1 >> 4)]! + B64URL[(b1 & 0xf) << 2]!;
  }
  return out;
}

test('encode/decode round-trips a keyset tuple', () => {
  const value = { activityAt: '2026-07-26T09:14:02Z', entityId: '8c2b1d4e-5a6f-4b7c-8d9e-0f1a2b3c4d5e' };
  const cursor = encodeCursor(value);
  const decoded = decodeCursor(cursor);
  assert.deepEqual(decoded, { ok: true, value });
});

test('encoded cursor is base64url — no +, /, or = characters', () => {
  const cursor = encodeCursor({ activityAt: '2026-07-26T09:14:02Z', entityId: 'abc123' });
  assert.match(cursor, /^[A-Za-z0-9\-_]+$/);
});

test('decodes a real cursor produced by the API (openapi.yaml example)', () => {
  const decoded = decodeCursor('MjAyNi0wNy0yNlQwNjowMjoxMVp8NGQ1ZTZmNzA');
  assert.deepEqual(decoded, {
    ok: true,
    value: { activityAt: '2026-07-26T06:02:11Z', entityId: '4d5e6f70' },
  });
});

test('decode never throws on garbage input', () => {
  assert.doesNotThrow(() => decodeCursor('not valid base64url!!'));
  assert.doesNotThrow(() => decodeCursor(''));
  assert.doesNotThrow(() => decodeCursor('####'));
  assert.equal(decodeCursor('not valid base64url!!').ok, false);
  assert.equal(decodeCursor('').ok, false);
});

test('decode rejects a cursor with no separator', () => {
  const bogus = encodeAsciiBase64Url('nosseparatorhere');
  assert.equal(decodeCursor(bogus).ok, false);
});

test('decode rejects an invalid activity_at timestamp', () => {
  const cursor = encodeCursor({ activityAt: 'not-a-timestamp', entityId: 'x' });
  const decoded = decodeCursor(cursor);
  assert.equal(decoded.ok, false);
});

test('opaque to callers: two different tuples never collide', () => {
  const a = encodeCursor({ activityAt: '2026-07-26T09:14:02Z', entityId: 'a' });
  const b = encodeCursor({ activityAt: '2026-07-26T09:14:02Z', entityId: 'b' });
  assert.notEqual(a, b);
});
