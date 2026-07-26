/**
 * Parse and validate `generated/tokens.json`.
 *
 * The gate reads the artefact off disk, so the artefact is untyped input.
 * Ten lines of validation beat a cast that hides a truncated file.
 */
import type { TokensJson } from './emit/json.js';
import type { AgentInkName, ThemeName } from './types.js';
import { agentInkNames, themeNames } from './types.js';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function readTokensJson(raw: string): TokensJson {
  const parsed: unknown = JSON.parse(raw);
  if (!isRecord(parsed) || !isRecord(parsed['themes'])) {
    throw new Error('tokens.json: missing `themes`');
  }
  const themes = parsed['themes'];
  for (const theme of themeNames) {
    const entry = themes[theme];
    if (!isRecord(entry) || !isRecord(entry['colors']) || !isRecord(entry['agentInks'])) {
      throw new Error(`tokens.json: theme "${theme}" is missing colors or agentInks`);
    }
    if (typeof entry['colors']['paper'] !== 'string') {
      throw new Error(`tokens.json: theme "${theme}" has no paper colour`);
    }
    for (const ink of agentInkNames) {
      if (typeof entry['agentInks'][ink] !== 'string') {
        throw new Error(`tokens.json: theme "${theme}" is missing agent ink "${ink}"`);
      }
    }
  }
  return parsed as unknown as TokensJson;
}

/** Every (ink, theme) pair the gate must check. */
export function inkThemePairs(): readonly (readonly [AgentInkName, ThemeName])[] {
  const pairs: (readonly [AgentInkName, ThemeName])[] = [];
  for (const ink of agentInkNames) {
    for (const theme of themeNames) {
      pairs.push([ink, theme] as const);
    }
  }
  return pairs;
}
