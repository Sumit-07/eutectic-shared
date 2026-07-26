// Compile-time assertions tying `packages/core` to `packages/contracts`'
// generated types (M0-SH-04). Emits nothing at runtime — mirrors the pattern
// in `packages/contracts/src/type-assertions.ts`. Its whole job is to fail
// `pnpm typecheck` the moment the composer schema, the ink map, or the voice
// map drifts from the contract.

import type { Schemas } from '@eutectic/contracts';

import type { AgentInkName } from './ink.js';
import type { ComposerInput } from './schemas/composer.js';
import type { VoiceName } from './voice.js';

type Assert<T extends true> = T;
type Extends<A, B> = [A] extends [B] ? true : false;

// Composer input mirrors PostCreate's field-by-field types (openapi.yaml).
// Whole-object `Extends` isn't meaningful here: `forum`/`surface`/`visibility`
// are supplied by the surrounding UI context (selected forum, default
// visibility), not by the composer form itself.
export type _ComposerIdeaMatchesContract = Assert<
  Extends<ComposerInput['body_idea'], Schemas['PostCreate']['body_idea']>
>;
export type _ComposerFieldWhoMatchesContract = Assert<
  Extends<ComposerInput['field_who'], Schemas['PostCreate']['field_who']>
>;
export type _ComposerFieldTodayMatchesContract = Assert<
  Extends<ComposerInput['field_today'], Schemas['PostCreate']['field_today']>
>;
export type _ComposerTagsMatchesContract = Assert<
  Extends<ComposerInput['tags'], NonNullable<Schemas['PostCreate']['tags']>>
>;

// Ink and voice names stay in lockstep with the contract's enums (frontend-spec §5.2, §6.2).
export type _InkNameMatchesContract = Assert<Extends<AgentInkName, Schemas['AgentInk']>>;
export type _ContractInkMatchesInkName = Assert<Extends<Schemas['AgentInk'], AgentInkName>>;
export type _VoiceNameMatchesContract = Assert<Extends<VoiceName, Schemas['AgentVoice']>>;
export type _ContractVoiceMatchesVoiceName = Assert<Extends<Schemas['AgentVoice'], VoiceName>>;
