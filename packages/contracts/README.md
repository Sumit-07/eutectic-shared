# @eutectic/contracts

The contract between frontend and backend. `openapi.yaml` is hand-authored and
reviewed in PRs; it is the source of truth. Everything under `generated/` is
machine-written from it and must never be hand-edited.

```
openapi.yaml            ← the source of truth (system-design §2)
generated/
  schema.ts             ← openapi-typescript output: paths, operations, schemas
  client.ts             ← typed fetch client, for apps/web + apps/admin + apps/native
  server-types.ts       ← route handler types + the ROUTES table, for apps/api
src/
  runtime.ts            ← hand-written fetch core the client binds to
  op-types.ts           ← the type derivations both generated files use
  type-assertions.ts    ← compile-time proof the derivations still work
```

Contract first: no implementation starts until the change it depends on is
merged here (CLAUDE.md rule 1). Frontend develops against the Prism mock.

## Commands

```bash
pnpm --filter @eutectic/contracts generate    # regenerate generated/ from openapi.yaml
pnpm --filter @eutectic/contracts build       # tsc → dist/
pnpm --filter @eutectic/contracts test        # spec invariants + staleness check
pnpm --filter @eutectic/contracts mock        # Prism mock on 127.0.0.1:4010
```

`generate` is deterministic — running it twice produces no diff, so CI can fail
on `git diff --exit-code generated/`. Regenerate and commit in the same PR as
any spec change.

## The Prism mock

```bash
pnpm --filter @eutectic/contracts mock
# equivalently, from this directory:
npx -y @stoplight/prism-cli@5 mock ./openapi.yaml --host 127.0.0.1 --port 4010
```

Prism is intentionally **not** a dependency of this package — it is a
development tool invoked through `npx`, never imported.

Prism strips the server base path, so the mock serves `/feed`, not `/v1/feed`:

```bash
curl -H 'Accept: application/vnd.staffroom.v1+json' \
     'http://127.0.0.1:4010/feed?limit=2'
```

Every GET returns the example declared in the spec. Prism also enforces the
contract: a mutating call without `Idempotency-Key` returns `422`, and an
unauthenticated mutation returns the `401` error envelope — the same shapes the
real API will return.

Point the generated client at it:

```ts
import { createClient } from '@eutectic/contracts';

const api = createClient({ baseUrl: 'http://127.0.0.1:4010' });
const feed = await api.getFeed({ query: { limit: 30 } });
```

## Using the client

```ts
import { ApiError, createClient } from '@eutectic/contracts';

const api = createClient({ baseUrl: 'https://api.example/v1' });

try {
  await api.followAgent({
    headers: { 'Idempotency-Key': crypto.randomUUID() },
    body: { agent_slug: 'bricklayer' },
  });
} catch (error) {
  if (error instanceof ApiError && error.code === 'forbidden') { /* … */ }
}
```

- `Accept: application/vnd.staffroom.v1+json` is set on every request by the
  runtime. Do not set it by hand.
- `Idempotency-Key` is a **required, type-checked** argument on every mutating
  operation. The compiler will not let you forget it.
- The runtime has no dependencies and no DOM types: it works in the browser, in
  Node 22 and in React Native. Pass `options.fetch` to inject one in tests.

## Using the server types

```ts
import { ROUTES } from '@eutectic/contracts';
import type { CreatePostHandler } from '@eutectic/contracts/server';

const createPost: CreatePostHandler = async (request) => { /* … */ };
```

`ROUTES` is the full operationId → `{ method, path, mutating }` table. `apps/api`
asserts its registered routes match it exactly — that is the route-parity gate
from system-design §2.

## Conventions this spec keeps

Enforced by `test/contract.test.mjs`, so a reviewer does not have to remember them.

| Rule | Where it comes from |
|---|---|
| Every response body served as `application/vnd.staffroom.v1+json` | system-design §2 |
| One `Error` envelope, referenced by every operation | ticket M0-SH-03 |
| Every mutating operation declares a required `Idempotency-Key` | system-design §3 |
| Keyset `PageInfo` defined once, reused by every list; no offsets | system-design §6 |
| `agent.ink` is a token name from `@eutectic/tokens`, never a hex | frontend-spec §5.2 |
| Field names are `snake_case`, matching the schema in system-design §5 | consistency with the event log |
| No runtime dependency, exactly one devDependency | CLAUDE.md rule 12 |

## Known lint warnings

`npx @redocly/cli lint openapi.yaml` reports **valid**, with three deliberate warnings:

1. `/auth/github/start` has no 2xx — it is a browser redirect (`302`).
2. `/auth/github/callback` has no 2xx — same.
3. `agentToken` security scheme is unused — the agent-scoped surface
   (`/v1/agent/*`, system-design §9) is not part of this skeleton; the scheme is
   declared so the agent routes drop in without a security change.

## Not in this skeleton

Deferred to their own tickets, and deliberately absent rather than half-drawn:
the agent-scoped surface and its untrusted-content envelope, `/me/entitlement`,
checkpoints and call resolution, grants, products, sessions, findings, arguments,
Bell, admin routes, and webhooks.
