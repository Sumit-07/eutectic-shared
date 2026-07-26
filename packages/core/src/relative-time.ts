/**
 * Relative time — frontend-spec.md §15: "relative under 7 days ('2h', '3d'),
 * then absolute ('14 Mar')". No date library (CLAUDE.md rule 12); built on
 * `Intl.RelativeTimeFormat` and `Intl.DateTimeFormat` only.
 *
 * `now` is always an explicit parameter — never `Date.now()` internally —
 * so callers get a pure, testable function.
 */

export type RelativeTimeUnit = 'minute' | 'hour' | 'day';

export interface RelativeTimeOptions {
  /** BCP 47 locale. Defaults to `en`. */
  locale?: string;
  /** IANA time zone for the absolute (past-7-day) fallback. Defaults to the runtime's local zone. */
  timeZone?: string;
}

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const WEEK_MS = 7 * DAY_MS;

const UNIT_SUFFIX: Record<RelativeTimeUnit, string> = {
  minute: 'm',
  hour: 'h',
  day: 'd',
};

const rtfCache = new Map<string, Intl.RelativeTimeFormat>();

function getRtf(locale: string): Intl.RelativeTimeFormat {
  let rtf = rtfCache.get(locale);
  if (!rtf) {
    rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'always', style: 'narrow' });
    rtfCache.set(locale, rtf);
  }
  return rtf;
}

/**
 * The localized digits for `value` in `unit`, read off `Intl.RelativeTimeFormat`
 * so non-Latin numbering systems render correctly. We deliberately discard the
 * "ago"/"in" text RTF produces — frontend-spec §15 wants the bare magnitude
 * ("2h", never "2h ago") — and fall back to a plain ASCII count if a runtime's
 * locale data ever yields no digit characters at all.
 */
function magnitude(value: number, unit: RelativeTimeUnit, locale: string): string {
  const parts = getRtf(locale).formatToParts(value, unit);
  const digits = parts
    .map((part) => part.value)
    .join('')
    .replace(/[^\p{Nd}]/gu, '');
  return digits.length > 0 ? digits : String(Math.abs(Math.trunc(value)));
}

function yearOf(date: Date, locale: string, timeZone: string | undefined): string {
  return new Intl.DateTimeFormat(locale, { year: 'numeric', timeZone }).format(date);
}

function toMillis(input: Date | string): number {
  return input instanceof Date ? input.getTime() : Date.parse(input);
}

/**
 * `target` relative to `now`: `"now"` under a minute, then a compact
 * magnitude ladder (minutes, hours, days) out to 7 days, then an absolute
 * date — month + day, plus year only when `target`'s year differs from `now`'s.
 */
export function relativeTime(target: Date | string, now: Date, options: RelativeTimeOptions = {}): string {
  const locale = options.locale ?? 'en';
  const targetMs = toMillis(target);
  if (Number.isNaN(targetMs)) {
    throw new RangeError('relativeTime: invalid target date');
  }

  const diffMs = targetMs - now.getTime();
  const absMs = Math.abs(diffMs);

  if (absMs < MINUTE_MS) {
    return 'now';
  }

  if (absMs < WEEK_MS) {
    let unit: RelativeTimeUnit;
    let unitMs: number;
    if (absMs < HOUR_MS) {
      unit = 'minute';
      unitMs = MINUTE_MS;
    } else if (absMs < DAY_MS) {
      unit = 'hour';
      unitMs = HOUR_MS;
    } else {
      unit = 'day';
      unitMs = DAY_MS;
    }
    const value = Math.trunc(diffMs / unitMs);
    return `${magnitude(value, unit, locale)}${UNIT_SUFFIX[unit]}`;
  }

  const targetDate = target instanceof Date ? target : new Date(targetMs);
  const includeYear = yearOf(targetDate, locale, options.timeZone) !== yearOf(now, locale, options.timeZone);
  const dtf = new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: includeYear ? 'numeric' : undefined,
    timeZone: options.timeZone,
  });
  return dtf.format(targetDate);
}
