/**
 * The contrast gate — frontend-spec §13, §19.3.
 * Also pins the hand-written WCAG maths against known reference values, since
 * there is no library here to be right on our behalf.
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { artefactUrl } from '../artefacts.js';
import { WCAG_AA_NORMAL, contrastRatio, relativeLuminance } from '../contrast.js';
import { readTokensJson } from '../read-tokens-json.js';
import { checkAgentInkContrast, formatContrastTable } from '../report.js';

test('relative luminance matches the WCAG reference points', () => {
  assert.equal(relativeLuminance('#000000'), 0);
  assert.equal(relativeLuminance('#FFFFFF'), 1);
  // sRGB mid grey #777777 → 0.1845 per the WCAG formula.
  assert.ok(Math.abs(relativeLuminance('#777777') - 0.1845) < 0.001);
});

test('contrast ratio is bounded, symmetric and self-annihilating', () => {
  assert.equal(contrastRatio('#000000', '#FFFFFF'), 21);
  assert.equal(contrastRatio('#FFFFFF', '#000000'), 21);
  assert.equal(contrastRatio('#FCFCFA', '#FCFCFA'), 1);
  assert.equal(contrastRatio('#abc', '#AABBCC'), 1); // 3-digit hex expands
});

test('every agent ink clears WCAG AA against paper in both themes', async () => {
  const raw = await readFile(artefactUrl('generated/tokens.json'), 'utf8');
  const results = checkAgentInkContrast(readTokensJson(raw));
  assert.equal(results.length, 14, 'seven inks × two themes');
  const failures = results.filter((r) => !r.passes);
  assert.deepEqual(
    failures.map((f) => `${f.ink}/${f.theme} ${f.ratio.toFixed(2)}:1`),
    [],
    `below ${WCAG_AA_NORMAL}:1 against paper (frontend-spec §13)\n${formatContrastTable(results)}`,
  );
});
