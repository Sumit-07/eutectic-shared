/**
 * Emit the three artefacts. Run after `tsc`, before the contrast gate.
 *   node dist/build.js
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { artefactUrl, artefacts, packageRoot } from './artefacts.js';

async function main(): Promise<void> {
  await mkdir(new URL('generated/', packageRoot), { recursive: true });
  for (const artefact of artefacts) {
    const url = artefactUrl(artefact.file);
    await writeFile(url, artefact.render(), 'utf8');
    process.stdout.write(`tokens: wrote ${artefact.file}\n`);
  }
}

main().catch((error: unknown) => {
  process.stderr.write(`tokens: build failed in ${fileURLToPath(packageRoot)}\n`);
  process.stderr.write(`${String(error)}\n`);
  process.exitCode = 1;
});
