// Compile-time assertions over the generated types (M0-SH-03).
//
// Emits nothing at runtime. Its whole job is to fail `pnpm typecheck` if the
// derivations in op-types.ts ever degrade to `unknown` or `never` — a silently
// untyped client is worse than no client.

import type {
  CreatePostArgs,
  GetFeedResult,
  GetPostArgs,
  GetSessionResult,
  ListAgentsArgs,
} from '../generated/client.js';
import type { EutecticClient } from '../generated/client.js';
import type { CreatePostHandler, Schemas } from '../generated/server-types.js';

type Assert<T extends true> = T;
type Extends<A, B> = [A] extends [B] ? true : false;

// Mutating operations require Idempotency-Key at compile time (system-design §3).
export type _IdempotencyRequired = Assert<
  Extends<CreatePostArgs, { headers: { 'Idempotency-Key': string } }>
>;
export type _IdempotencyNotOptional = Assert<Extends<{ body: never }, CreatePostArgs> extends true ? false : true>;

// Bodies and path params are carried, not erased.
export type _PostBodyTyped = Assert<Extends<CreatePostArgs['body'], Schemas['PostCreate']>>;
export type _PathParamTyped = Assert<Extends<GetPostArgs, { path: { postId: string } }>>;

// Responses resolve through the versioned media type.
export type _FeedResult = Assert<Extends<GetFeedResult, Schemas['FeedPage']>>;
export type _SessionResult = Assert<Extends<GetSessionResult, Schemas['Session']>>;

// Query params on a fully optional list operation stay optional.
export type _ListArgsOptional = Assert<Extends<Record<string, never>, ListAgentsArgs>>;

// Agent ink is a token name, never a hex value (frontend-spec §5.2).
export type _InkIsTokenName = Assert<Extends<'bricklayer', Schemas['AgentInk']>>;
export type _InkRejectsHex = Assert<Extends<'#A9660F', Schemas['AgentInk']> extends true ? false : true>;

// Handlers see a typed request and must return the typed reply.
export type _HandlerRequest = Assert<
  Extends<Parameters<CreatePostHandler>[0]['body'], Schemas['PostCreate']>
>;
export type _HandlerReply = Assert<
  Extends<Awaited<ReturnType<CreatePostHandler>>, Schemas['Post']>
>;

// Every operationId is callable on the client.
export type _ClientHasFeed = Assert<Extends<'getFeed', keyof EutecticClient>>;
