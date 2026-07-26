/**
 * Keyset pagination cursor — matches `packages/contracts`' `Cursor` parameter
 * and `PageInfo` schema exactly: an opaque base64url string encoding the
 * `(activity_at, entity_id)` tuple (openapi.yaml, `components.parameters.Cursor`).
 * Callers must treat it as opaque; these helpers exist for the code that
 * actually produces/consumes the tuple.
 *
 * No Node builtins (no `Buffer`) — a hand-rolled UTF-8 + base64url codec so
 * this runs unmodified on web and native.
 */

const BASE64URL_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
const SEPARATOR = '|';

function utf8Encode(input: string): number[] {
  const bytes: number[] = [];
  for (const ch of input) {
    const cp = ch.codePointAt(0) ?? 0;
    if (cp < 0x80) {
      bytes.push(cp);
    } else if (cp < 0x800) {
      bytes.push(0xc0 | (cp >> 6), 0x80 | (cp & 0x3f));
    } else if (cp < 0x10000) {
      bytes.push(0xe0 | (cp >> 12), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
    } else {
      bytes.push(
        0xf0 | (cp >> 18),
        0x80 | ((cp >> 12) & 0x3f),
        0x80 | ((cp >> 6) & 0x3f),
        0x80 | (cp & 0x3f),
      );
    }
  }
  return bytes;
}

function utf8Decode(bytes: readonly number[]): string {
  let out = '';
  let i = 0;
  while (i < bytes.length) {
    const b0 = bytes[i];
    if (b0 === undefined) break;
    if (b0 < 0x80) {
      out += String.fromCodePoint(b0);
      i += 1;
    } else if ((b0 & 0xe0) === 0xc0) {
      const b1 = bytes[i + 1];
      if (b1 === undefined) throw new Error('truncated utf-8 sequence');
      out += String.fromCodePoint(((b0 & 0x1f) << 6) | (b1 & 0x3f));
      i += 2;
    } else if ((b0 & 0xf0) === 0xe0) {
      const b1 = bytes[i + 1];
      const b2 = bytes[i + 2];
      if (b1 === undefined || b2 === undefined) throw new Error('truncated utf-8 sequence');
      out += String.fromCodePoint(((b0 & 0x0f) << 12) | ((b1 & 0x3f) << 6) | (b2 & 0x3f));
      i += 3;
    } else if ((b0 & 0xf8) === 0xf0) {
      const b1 = bytes[i + 1];
      const b2 = bytes[i + 2];
      const b3 = bytes[i + 3];
      if (b1 === undefined || b2 === undefined || b3 === undefined) {
        throw new Error('truncated utf-8 sequence');
      }
      out += String.fromCodePoint(
        ((b0 & 0x07) << 18) | ((b1 & 0x3f) << 12) | ((b2 & 0x3f) << 6) | (b3 & 0x3f),
      );
      i += 4;
    } else {
      throw new Error('invalid utf-8 byte');
    }
  }
  return out;
}

function base64UrlEncodeBytes(bytes: readonly number[]): string {
  let out = '';
  let i = 0;
  for (; i + 3 <= bytes.length; i += 3) {
    const b0 = bytes[i] as number;
    const b1 = bytes[i + 1] as number;
    const b2 = bytes[i + 2] as number;
    out += BASE64URL_CHARS[b0 >> 2];
    out += BASE64URL_CHARS[((b0 & 0x3) << 4) | (b1 >> 4)];
    out += BASE64URL_CHARS[((b1 & 0xf) << 2) | (b2 >> 6)];
    out += BASE64URL_CHARS[b2 & 0x3f];
  }
  const remaining = bytes.length - i;
  if (remaining === 1) {
    const b0 = bytes[i] as number;
    out += BASE64URL_CHARS[b0 >> 2];
    out += BASE64URL_CHARS[(b0 & 0x3) << 4];
  } else if (remaining === 2) {
    const b0 = bytes[i] as number;
    const b1 = bytes[i + 1] as number;
    out += BASE64URL_CHARS[b0 >> 2];
    out += BASE64URL_CHARS[((b0 & 0x3) << 4) | (b1 >> 4)];
    out += BASE64URL_CHARS[(b1 & 0xf) << 2];
  }
  return out;
}

function base64UrlDecodeToBytes(input: string): number[] {
  if (input.length === 0) return [];
  if (!/^[A-Za-z0-9\-_]+$/.test(input)) {
    throw new Error('invalid base64url characters');
  }
  const bytes: number[] = [];
  let buffer = 0;
  let bitsCollected = 0;
  for (const ch of input) {
    const value = BASE64URL_CHARS.indexOf(ch);
    buffer = (buffer << 6) | value;
    bitsCollected += 6;
    if (bitsCollected >= 8) {
      bitsCollected -= 8;
      bytes.push((buffer >> bitsCollected) & 0xff);
    }
  }
  return bytes;
}

/** The decoded keyset tuple — `openapi.yaml`'s `(activity_at, entity_id)`. */
export interface CursorValue {
  /** ISO 8601 timestamp, matches the contract's `Timestamp` schema. */
  activityAt: string;
  entityId: string;
}

export type DecodeCursorResult =
  | { ok: true; value: CursorValue }
  | { ok: false; error: string };

/** Encodes a keyset tuple into the opaque cursor string clients pass back as `?cursor=`. */
export function encodeCursor(value: CursorValue): string {
  const raw = `${value.activityAt}${SEPARATOR}${value.entityId}`;
  return base64UrlEncodeBytes(utf8Encode(raw));
}

/** Decodes an opaque cursor string. Never throws — garbage input yields `{ ok: false }`. */
export function decodeCursor(cursor: string): DecodeCursorResult {
  let raw: string;
  try {
    raw = utf8Decode(base64UrlDecodeToBytes(cursor));
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'invalid cursor encoding' };
  }

  const sepIndex = raw.indexOf(SEPARATOR);
  if (sepIndex === -1) {
    return { ok: false, error: 'cursor is missing the activity_at/entity_id separator' };
  }
  const activityAt = raw.slice(0, sepIndex);
  const entityId = raw.slice(sepIndex + 1);
  if (activityAt.length === 0 || entityId.length === 0) {
    return { ok: false, error: 'cursor has an empty activity_at or entity_id segment' };
  }
  if (Number.isNaN(Date.parse(activityAt))) {
    return { ok: false, error: 'cursor activity_at is not a valid timestamp' };
  }
  return { ok: true, value: { activityAt, entityId } };
}
