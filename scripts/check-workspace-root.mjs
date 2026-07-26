#!/usr/bin/env node
// M0-SH-05 — the workspace-root mirror must match the live workspace root.
//
// The pnpm workspace root (package.json, pnpm-workspace.yaml, pnpm-lock.yaml,
// tsconfig.base.json, turbo.json, .nvmrc) lives one level ABOVE the three git
// repos and belongs to none of them. `workspace-root/` in this repo is its
// tracked mirror — the copy CI reconstructs the workspace from (D-022), and
// the only copy with history and a backup.
//
// Direction of truth: the LIVE root is what developers and pnpm actually use;
// the mirror follows it. `--write` copies live → mirror; the default mode
// byte-compares and fails on drift. In CI there is no live root above the
// checkout, so the check is skipped — there the mirror IS the root.
import { copyFileSync, existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const liveRoot = path.resolve(repoRoot, '..');
const mirror = path.join(repoRoot, 'workspace-root');

export const WORKSPACE_ROOT_FILES = [
  'package.json',
  'pnpm-workspace.yaml',
  'pnpm-lock.yaml',
  'tsconfig.base.json',
  'turbo.json',
  '.nvmrc',
];

const write = process.argv.includes('--write');

// A live root exists only on a dev machine (the parent dir holds the three
// repos and the pnpm root). In CI the parent is the synthesized workspace
// whose root files CAME from the mirror, so comparing would be circular.
const liveRootPresent =
  existsSync(path.join(liveRoot, 'pnpm-workspace.yaml')) &&
  !existsSync(path.join(liveRoot, '.synthesized-from-mirror'));

if (!liveRootPresent) {
  console.log('check-workspace-root: no live workspace root above this repo — skipped (CI).');
  process.exit(0);
}

let drifted = 0;
for (const file of WORKSPACE_ROOT_FILES) {
  const livePath = path.join(liveRoot, file);
  const mirrorPath = path.join(mirror, file);
  if (!existsSync(livePath)) {
    console.error(`MISSING live ${file} — the workspace root is incomplete`);
    drifted += 1;
    continue;
  }
  if (write) {
    copyFileSync(livePath, mirrorPath);
    continue;
  }
  if (!existsSync(mirrorPath)) {
    console.error(`DRIFT ${file}: not mirrored. Run: node scripts/check-workspace-root.mjs --write`);
    drifted += 1;
    continue;
  }
  if (!readFileSync(livePath).equals(readFileSync(mirrorPath))) {
    console.error(`DRIFT ${file}: live root differs from workspace-root/. Run: node scripts/check-workspace-root.mjs --write`);
    drifted += 1;
  }
}

if (write) {
  console.log(`check-workspace-root: mirrored ${WORKSPACE_ROOT_FILES.length} files.`);
} else if (drifted > 0) {
  process.exit(1);
} else {
  console.log(`check-workspace-root: ${WORKSPACE_ROOT_FILES.length} files in sync.`);
}
