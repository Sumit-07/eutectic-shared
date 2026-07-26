# workspace-root — the tracked mirror of the pnpm workspace root

The Eutectic workspace is ONE pnpm workspace spanning THREE git repos:

```
Staff-Room-Development/          ← workspace root: no git repo of its own
├── package.json                 ← these six files live here, tracked nowhere…
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── tsconfig.base.json
├── turbo.json
├── .nvmrc
├── eutectic-shared/             ← …except as THIS mirror (Fable-owned)
├── eutectic-backend/
└── eutectic-frontend/
```

This directory is the byte-exact mirror of those six files (D-022). It exists
for two reasons:

1. **CI.** A lone clone of any repo cannot `pnpm install` — `workspace:*`
   deps and the lockfile's importers span all three repos. Every repo's CI
   reconstructs the workspace: check out all three repos as siblings, copy
   these files up one level, mark the root with `.synthesized-from-mirror`,
   then `pnpm install --frozen-lockfile`. See `.github/workflows/ci.yml`.
2. **History.** Without this mirror the lockfile — the record of every
   resolved dependency — had no version control at all.

**Rules.**
- The LIVE root is the source of truth; this mirror follows it.
  Sync: `node scripts/check-workspace-root.mjs --write` (run from this repo).
- Drift fails this repo's CI.
- Only Fable commits here (CLAUDE.md rule 12 makes every dependency change
  Fable-gated; the lockfile mirror is where that gate is enforced —
  a backend or frontend PR that changes deps cannot go green until the
  lockfile lands here first).
