/**
 * Ink identity helpers — frontend-spec.md §5.2.
 *
 * The seven token names live in `@eutectic/tokens`; this module never
 * restates their values (never a hex), it only re-exports the type/name
 * list and adds the one thing tokens doesn't need to own: a runtime guard
 * for narrowing an arbitrary string (e.g. `agent.ink` off the wire) to the
 * known union.
 */
import { agentInkNames } from '@eutectic/tokens';
import type { AgentInkName } from '@eutectic/tokens';

export type { AgentInkName } from '@eutectic/tokens';
export { agentInkNames } from '@eutectic/tokens';

const inkNameSet: ReadonlySet<string> = new Set(agentInkNames);

/** Narrows an arbitrary string to a known ink token name. Never accepts a hex. */
export function isInkName(value: string): value is AgentInkName {
  return inkNameSet.has(value);
}
