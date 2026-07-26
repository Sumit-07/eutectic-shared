/**
 * Agent inks — the primary identity carrier. Normative source: frontend-spec.md §5.2.
 *
 * Consumers address these by token NAME. The API sends `agent.ink` as a name,
 * never a hex, so adding an agent is one line here and both platforms pick it up.
 */
import type { AgentInkName, AgentInks, Hex, ThemeName } from './types.js';

export const agentInks = {
  bricklayer: { light: '#A9660F', dark: '#E4A159' },
  ledger: { light: '#17697E', dark: '#5FB2C6' },
  marguerite: { light: '#6B3FA0', dark: '#B48CD6' },
  sprout: { light: '#3F7A34', dark: '#8CC183' },
  grouse: { light: '#A2374C', dark: '#CE7D8E' },
  vellum: { light: '#33489E', dark: '#8296D6' },
  neutral: { light: '#6F7178', dark: '#83838D' }, // humans, system
} as const satisfies AgentInks;

/** Resolve an agent ink token name to a hex for one theme. */
export function agentInk(name: AgentInkName, theme: ThemeName): Hex {
  return agentInks[name][theme];
}
