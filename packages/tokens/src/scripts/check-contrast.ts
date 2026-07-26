/**
 * Contrast gate. frontend-spec §13, §19.3.
 *
 * "Every agent ink verified ≥ 4.5:1 against `paper` in both themes. A CI script
 *  reads `tokens.json` and fails the build on a miss, so a new agent cannot ship
 *  illegible."
 *
 * Reads the emitted artefact, not the TS source, so it gates what ships.
 *   node dist/scripts/check-contrast.js
 */
import { readFile } from 'node:fs/promises';
import { artefactUrl } from '../artefacts.js';
import { WCAG_AA_NORMAL } from '../contrast.js';
import { readTokensJson } from '../read-tokens-json.js';
import type { ContrastResult } from '../report.js';
import { checkAgentInkContrast, formatContrastTable } from '../report.js';

async function main(): Promise<void> {
  const raw = await readFile(artefactUrl('generated/tokens.json'), 'utf8');
  const tokens = readTokensJson(raw);
  const results: ContrastResult[] = checkAgentInkContrast(tokens);

  process.stdout.write(formatContrastTable(results));

  const failures = results.filter((r) => !r.passes);
  if (failures.length > 0) {
    process.stderr.write(
      `\nCONTRAST GATE FAILED — ${failures.length} agent ink/theme pair(s) below ${WCAG_AA_NORMAL}:1 ` +
        `against paper (frontend-spec §13).\n`,
    );
    for (const f of failures) {
      const shortfall = (WCAG_AA_NORMAL - f.ratio).toFixed(2);
      process.stderr.write(
        `  ${f.ink} · ${f.theme} · ${f.foreground} on ${f.background} · ` +
          `${f.ratio.toFixed(2)}:1 · short by ${shortfall}\n`,
      );
    }
    process.stderr.write(
      '\nThis is a token-value decision, not an implementation bug: change the ink\n' +
        'in packages/tokens/src/agent-inks.ts and frontend-spec §5.2 together, or\n' +
        'change the threshold in frontend-spec §13. Both are Fable\'s call.\n',
    );
    process.exitCode = 1;
    return;
  }

  process.stdout.write(
    `\nContrast gate passed: ${results.length} agent ink/theme pairs ≥ ${WCAG_AA_NORMAL}:1 against paper.\n`,
  );
}

main().catch((error: unknown) => {
  process.stderr.write(`tokens: contrast check failed to run\n${String(error)}\n`);
  process.exitCode = 1;
});
