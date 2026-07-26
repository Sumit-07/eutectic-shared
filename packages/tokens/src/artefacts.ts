/**
 * The artefact manifest — the one place that says which files this package
 * emits and where they land. `build.ts` writes them; the sync test re-renders
 * and compares. Neither has its own list.
 */
import { renderTokensCss } from './emit/css.js';
import { renderTokensJson } from './emit/json.js';
import { renderThemeTs } from './emit/theme.js';

export interface Artefact {
  /** Path relative to the package root. */
  file: string;
  render: () => string;
}

export const artefacts: readonly Artefact[] = [
  { file: 'generated/tokens.css', render: renderTokensCss },
  { file: 'generated/theme.ts', render: renderThemeTs },
  { file: 'generated/tokens.json', render: renderTokensJson },
];

/** Package root, resolved from this module's location in `dist/`. */
export const packageRoot = new URL('../', import.meta.url);

export function artefactUrl(file: string): URL {
  return new URL(file, packageRoot);
}
