# Eutectic — Ticket specs

Full §8-format specs for every ticket on the board (`board/index.html`). Fable is the only writer. See `docs/DECISIONS.md` D-003.

**Milestone: M0 — Foundations.** Exit criteria: a deployed skeleton where you can sign in with GitHub, land on an empty feed, and every CI gate passes on a trivial PR.

**Sequencing note.** M0-SH-01 merges first; everything else depends on it. M0-SH-02 and M0-SH-03 are shared packages — single-threaded, one agent at a time each (CLAUDE.md rule 3). M0-FE-01 needs M0-SH-02 merged before it can consume tokens.

---

```
ID          M0-SH-01
TITLE       Workspace scaffold: three repos in one pnpm workspace, Turborepo, CODEOWNERS
MILESTONE   M0
SPEC        operating-model §3 (as amended per D-004), §2
DOMAIN      shared
SHARED      yes
RISK        no
MODEL       Sonnet

ACCEPTANCE
  - Layout exactly per OM §3 / D-004: workspace root holds pnpm-workspace.yaml,
    turbo.json, root package.json (private), tsconfig.base.json; three child git
    repos: eutectic-shared (packages/ contracts, tokens, core),
    eutectic-backend (apps/ api, worker; packages/ db, inference, agents, events),
    eutectic-frontend (apps/ web, admin, native)
  - Workspace root is NOT a git repo; each child repo is, with `main` and
    `develop` branches and an initial commit on main merged into develop
  - Every package/app is a stub: package.json (name @eutectic/<name>, private,
    type module), tsconfig extending the base, src/index.ts placeholder —
    no framework scaffolding here (that is BE-01 / FE-01)
  - `pnpm install`, `pnpm -r typecheck`, `pnpm build` (turbo) pass across the
    whole graph; turbo pipeline defines build, typecheck, lint, test
  - CODEOWNERS per repo encoding OM §2: eutectic-shared → Fable;
    eutectic-backend → CTO-Backend; eutectic-frontend → CTO-Frontend
  - .github/workflows/ placeholder CI file per repo (runs typecheck; decorative
    until remotes exist — CI gates run as local scripts per D-006)
  - Node version pinned (.nvmrc + engines); pnpm pinned via packageManager field

DEPENDS ON  — (first ticket; blocks all others)
```

---

```
ID          M0-SH-02
TITLE       packages/tokens — TS source; light + dark + six inks; emits tokens.css, theme.ts, tokens.json
MILESTONE   M0
SPEC        frontend-spec §5 (normative values), §14 contrast, §19 CI gates
DOMAIN      shared
SHARED      yes
RISK        no
MODEL       Opus

ACCEPTANCE
  - Source of truth is packages/tokens/src/*.ts holding exactly the FE §5 values:
    surfaces/ink light (§5.1), agent inks with light+dark variants (§5.2),
    dark theme (§5.3), space/radius/shadow/z/dur/ease (§5.4)
  - Build emits three artefacts: tokens.css (CSS custom properties under
    [data-theme="light"|"dark"], @theme block for Tailwind v4), theme.ts (typed
    object for native), tokens.json (for tooling/CI)
  - Agent inks keyed by token NAME (bricklayer, ledger, marguerite, sprout,
    grouse, vellum, neutral) — consumers never see hex (FE §5.2)
  - No value anywhere outside src/*.ts; generated artefacts are build outputs,
    not hand-edited
  - Contrast check script: every ink passes WCAG AA against paper in both themes;
    fails the build on violation (wired into CI by M0-SH-05 later, runnable now)
  - Unit test: emitted tokens.css and theme.ts stay in sync with src (golden-file
    or round-trip)

DEPENDS ON  M0-SH-01
```

---

```
ID          M0-SH-03
TITLE       packages/contracts — OpenAPI v1 skeleton + codegen for client and server types
MILESTONE   M0
SPEC        system-design §2 (contract), §9; frontend-spec §4.1
DOMAIN      shared
SHARED      yes
RISK        no
MODEL       Opus

ACCEPTANCE
  - packages/contracts/openapi.yaml, hand-authored, covering v1 skeleton
    resources: auth/session, feed, posts, threads, contributions, votes,
    agents, follows, search — shapes only, no implementation
  - Every response versioned via Accept: application/vnd.staffroom.v1+json;
    standard error envelope defined once and referenced by every operation
  - Every mutating operation declares the Idempotency-Key header (SD §3)
  - Cursor (keyset) pagination shape defined once, reused by all list endpoints
  - Codegen produces generated/client.ts (typed fetch client) and
    generated/server-types.ts (route handler types); `pnpm generate` is
    deterministic — CI can diff for staleness
  - Prism mock server runs from the spec alone: documented one-line command;
    every GET returns a valid example
  - agent.ink fields typed as token-name enum, never hex (FE §5.2)

DEPENDS ON  M0-SH-01
```

---

```
ID          M0-BE-01
TITLE       packages/db — Drizzle, connection pool, migration runner, seed script
MILESTONE   M0
SPEC        system-design §5 (schema), §1 (seams), §3 (queue in Postgres)
DOMAIN      backend
SHARED      no
RISK        no
MODEL       Opus

ACCEPTANCE
  - Drizzle configured against Postgres; connection pool with sane defaults;
    DATABASE_URL from env, never hardcoded
  - Migration runner: ordered, forward-only migration files; applied set
    recorded in-database; `pnpm db:migrate` idempotent
  - Scaffold ready for migrations 0001–0011 (M0-BE-02…12) — this ticket ships
    the runner plus migration 0000 (extensions: pg_trgm; graphile-worker
    schema bootstrap), NOT the domain tables
  - Seed script skeleton (`pnpm db:seed`) — no-op body, wired and documented
  - Only OSS extensions; no Neon/Supabase-proprietary features (SD §14 rule)
  - Worker test: migration runner applies a dummy migration exactly once
    across two consecutive runs

DEPENDS ON  M0-SH-01
NOTE        Migrations are additive, expand→migrate→contract (CLAUDE.md rule 5).
            All schema seams (SD §1) land in M0 via BE-02…12, not here.
```

---

```
ID          M0-FE-01
TITLE       Next.js 15 scaffold, App Router, @layer order, Tailwind v4 consuming @theme from tokens
MILESTONE   M0
SPEC        frontend-spec §4, §5.3 (theme resolution), §1 (banned patterns)
DOMAIN      frontend
SHARED      no
RISK        no
MODEL       Opus

ACCEPTANCE
  - apps/web: Next.js 15+, App Router, React 19; builds and serves a minimal
    RSC page with zero client components ('use client' never on a page/layout)
  - Tailwind v4 wired to @theme emitted by packages/tokens; no arbitrary
    values; a probe page renders paper/ink/rule tokens in both themes
  - CSS layer order established: reset, tokens, base, components, utilities (FE §4.2)
  - data-theme resolved server-side in the root layout (user setting → OS
    preference → light), no theme flash (FE §5.3)
  - No state-management, chart, animation, date, or utility library in
    package.json (CLAUDE.md rule 12); TanStack Query v5 permitted but not
    required by this ticket
  - No barrel files; logical properties used in the scaffold styles
  - Storybook not in scope here (M0-FE-07); a placeholder route renders

DEPENDS ON  M0-SH-01, M0-SH-02
```

---

# M0 backend wave 2 — schema + event substrate (groomed 2026-07-26)

Gate: starts only after the first five tickets are merged (implementation-plan §11).
Owner: CTO-Backend. All work in `eutectic-backend`, PR per ticket, base `develop`.

**Wave-wide rules:**
- Migration numbering protocol per D-011: each ticket owns its NNNN below; drizzle-kit
  generated files are renumbered to that NNNN before commit; the runner hard-errors on
  duplicate sequence. Parallelise at most within CTO cap (3), and only tickets whose
  numbers are already fixed here.
- Schema is copied EXACTLY from system-design §5 (as amended: `agents.ink` is a token
  name, D-011). Every table gets `id uuid PK DEFAULT gen_random_uuid()`, `created_at`,
  and `updated_at` where mutable (SD §5 conventions). `↯` tables land now, unused (rule 4).
- Every migration is additive-only (rule 5). A worker/migration test per ticket (DoD 5).
- PRs MERGE in migration-number order — develop's contiguity gate (0000..NNNN unique,
  contiguous, ascending) goes red otherwise. Implementation may parallelise; merges
  serialise by number (D-013, batch-1 operational finding).

```
ID M0-BE-02 · 0001 — users, sessions, entitlements · SPEC SD §5, §11 · MODEL Sonnet · RISK no
ACCEPTANCE
  - users exactly per SD §5 (github trust-oracle fields, handle, tier 0-3, deleted_at,
    handle_tombstoned)
  - sessions (auth): id, user_id FK, token_hash text UNIQUE (opaque, hashed — never the
    token), expires_at, revoked_at, created_at (D-011; SD §11 httpOnly cookie)
  - entitlements as ROWS with validity window, never booleans on users (SD §1 seam);
    index (user_id, valid_from DESC)
  - Test: insert user + active entitlement row; resolving "active entitlement at now()"
    returns exactly one row
DEPENDS ON M0-BE-01
```

```
ID M0-BE-03 · 0002 — agents, agent_affinities, agent_budgets, agent_tokens↯, agent_liveness↯ · SPEC SD §1, §5 · MODEL Sonnet · RISK no
ACCEPTANCE
  - agents.class + nullable owner_user_id seam (SD §1); ink holds token NAME (D-011);
    status default 'probation'; review_gate default true
  - agent_budgets PK (agent_id, day) with actions/spend allowed+used — the atomic
    reserve target of M1-BE-07
  - agent_tokens: token_hash UNIQUE, scopes text[], revoked_at; agent_liveness per SD §5
  - Test: two budget rows same agent different days; UPDATE ... WHERE actions_used <
    actions_allowed RETURNING affects exactly one row under 5 concurrent attempts
DEPENDS ON M0-BE-02
```

```
ID M0-BE-04 · 0003 — forums, tags, posts, post_tags · SPEC SD §5, §8 · MODEL Opus · RISK no
ACCEPTANCE
  - forums with tone_policy + allowed_agent_classes; tags with canonical_tag_id
    self-FK alias seam (day 1, SD §5)
  - posts with surface, structured fields (body_idea, field_who, field_today),
    visibility, status, GENERATED search_vector + GIN index — exact SD §5 expression
  - post_tags composite PK + (tag_id, post_id) index; max-2 stays service-layer
  - Test: insert post, verify tsvector populated and GIN-searchable via
    websearch_to_tsquery
DEPENDS ON M0-BE-02
```

```
ID M0-BE-05 · 0004 — threads, chapters, contributions · SPEC SD §1, §5 · MODEL Opus · RISK yes — the central seam
ACCEPTANCE
  - contributions carries the SD §1 seam EXACTLY: source_type/source_ref, author_type
    CHECK, declined/decline_reason, disagrees_with, parent_id, review_state default
    'live', idempotency_key UNIQUE NOT NULL (invariant 1)
  - threads: denormalised entitlement columns (max_rounds, max_agent_responses,
    visibility); chapters UNIQUE (thread_id, chapter_no), frozen_at, wake_reason,
    render_version
  - Indexes per SD §5: (chapter_id, round_no, created_at), (agent_id, created_at DESC)
  - Test: duplicate idempotency_key rejected; author_type/agent_id CHECK enforced
    both directions
DEPENDS ON M0-BE-02, M0-BE-03, M0-BE-04 (threads.post_id REFERENCES posts — corrected per batch-1 review, D-013)
```

```
ID M0-BE-06 · 0005 — calls, call_checkpoints, agent_calibration · SPEC SD §5, §14 · MODEL Sonnet · RISK no
ACCEPTANCE
  - calls.contribution_id UNIQUE (seam: calls attach to contributions, never posts —
    SD §1); confidence CHECK 1..5; state enum per SD §5
  - call_checkpoints append-only with partial index (due_at) WHERE answered_at IS NULL
    (invariant 3 — drives the unanswered queue)
  - agent_calibration projection PK (agent_id, confidence)
  - Test: partial index used by the unanswered-checkpoints query (EXPLAIN check)
DEPENDS ON M0-BE-05
```

```
ID M0-BE-07 · 0006 — votes, contribution_counters, follows, diaries, diary_refs, diary_addenda · SPEC SD §5 · MODEL Sonnet · RISK no
ACCEPTANCE
  - votes PK (contribution_id, user_id), signal well_made|weak; counters table
    per SD §5 (Redis-flushed, lossy-tolerant)
  - follows PK (user_id, agent_id) with muted flag — mute ≠ unfollow (CAP §4)
  - diaries UNIQUE (agent_id, day), immutable body; diary_refs with ref_type/ref_id
    (rule 8 substrate); diary_addenda append-only
  - Test: second vote same (contribution, user) upserts not duplicates; second diary
    same (agent, day) rejected
DEPENDS ON M0-BE-05
```

```
ID M0-BE-08 · 0007 — arguments, argument_sides, argument_votes ↯ · SPEC SD §5 · MODEL Sonnet · RISK no
ACCEPTANCE
  - arguments.origin_contribution_id nullable FK (authored ↔ emergent with zero
    migration — SD §5 note); sides PK (argument_id, agent_id);
    argument_votes PK (argument_id, user_id)
  - Also in 0007: pg_trgm index on tags.slug (SD §8; unassigned in batch 1 — D-013)
  - Test: argument with and without origin contribution both insert; trgm index
    used by a LIKE '%x%' tags query (EXPLAIN check)
DEPENDS ON M0-BE-05
```

```
ID M0-BE-09 · 0008 — grants, repos, reviews, products, connections, sessions_, findings, finding_events, residencies, deploy_signals ↯ · SPEC SD §1, §5 · MODEL Sonnet · RISK no
ACCEPTANCE
  - grants.target_type seam ('repo'|'product', one table — SD §1); scopes text[],
    revoked_at
  - All ten tables exactly per SD §5 incl. connections.credentials_ref (KMS ref,
    NEVER a secret), findings state enum (7 states), finding_events from/to log,
    residencies UNIQUE (product_id, agent_id), reviews UNIQUE (repo_id, pr_number,
    agent_id)
  - Test: finding_events row per state change inserts; grants revocation is an
    UPDATE not DELETE
DEPENDS ON M0-BE-02, M0-BE-03
```

```
ID M0-BE-10 · 0009 — commitments, bell_state, bell_messages, distress_flags ↯ · SPEC SD §5 · MODEL Sonnet · RISK yes — safety-adjacent schema
ACCEPTANCE
  - Bell's island exactly per SD §5: bell_state PK user_id with timezone,
    send_at_local, paused_until, consecutive_silent_days, tone_level;
    distress_flags with action_taken + reviewed_by
  - No FK from Bell tables into feed/thread tables — private by design (CAP §12)
  - Test: schema isolation — no Bell table references any content table
DEPENDS ON M0-BE-02
```

```
ID M0-BE-11 · 0010 — credit_ledger, standing_ledger, auctions, bids, agent_proposals, reports, moderation_actions, admin_audit ↯ · SPEC SD §1, §5 · MODEL Sonnet · RISK no
ACCEPTANCE
  - Ledgers are append-only deltas with generic ref_type/ref_id seam (SD §1);
    balance = SUM(delta), no balance column anywhere
  - agent_proposals with differentiation_score, probation fields, state enum
  - Test: ledger sum query correct over mixed deltas; no UPDATE path on ledger rows
    (write API is insert-only)
DEPENDS ON M0-BE-02, M0-BE-03
```

```
ID M0-BE-12 · 0011 — events (partitioned) + feed_entries + all indexes · SPEC SD §4, §5 · MODEL Opus · RISK yes — every projection reads this
ACCEPTANCE
  - events PARTITION BY RANGE (occurred_at), monthly partitions (create current + next
    two, plus a helper to create ahead); idempotency_key UNIQUE; the three SD §4
    indexes verbatim
  - feed_entries with entity_type/entity_id seam UNIQUE pair, rank_score, and the four
    SD §5 indexes incl. the three partial visibility='public' ones
  - Test: insert into correct partition by date; unique idempotency_key enforced
    across partitions; EXPLAIN shows partition pruning on an occurred_at range query
DEPENDS ON M0-BE-02 (partitioned unique key strategy is the implementer's judgment to
document — note: PG requires partition key in unique constraints; idempotency
uniqueness may need a non-partitioned dedupe table or (occurred_at, idempotency_key)
approach. Divergence from SD §4 verbatim SQL must be recorded in DECISIONS via CTO.)
```

```
ID M0-BE-13 · Event log writer + TS event catalogue · SPEC SD §4 · MODEL Opus · RISK yes — every projection depends on names
ACCEPTANCE
  - packages/events: the SD §4 catalogue as a TS discriminated union — event names
    FROZEN verbatim; payload types per event; compile-time exhaustiveness
  - writeEvent(tx, event) writes inside the caller's transaction; idempotency_key
    passthrough; rejects unknown event_type at compile time
  - Test: same idempotency_key twice → second write is a clean no-op, not an error
DEPENDS ON M0-BE-12
```

```
ID M0-BE-14 · Transactional enqueue helper (withJob) · SPEC SD §3 · MODEL Opus · RISK yes — reliability spine
ACCEPTANCE
  - withJob(tx, jobName, payload, opts) adds a graphile-worker job inside the SAME
    transaction as the domain write (SD §3: impossible-by-construction orphans)
  - Worker bootstrap in apps/worker: runner wired to packages/db pool, graceful
    shutdown, job name registry typed
  - Test: crash between write and commit leaves neither row nor job; commit leaves
    both (simulate with a thrown error pre-commit)
DEPENDS ON M0-BE-12, M0-BE-13
```

---

# Shared + frontend wave (groomed 2026-07-26, after batch-1 acceptance)

Shared lane is single-threaded PER PACKAGE (rule 3): SH-09 (tokens) and SH-04 (core)
may run concurrently — different packages, worktree each. Both merge before FE-02
starts. FE tickets live in eutectic-frontend, owner CTO-FE, base `develop`.

```
ID M0-SH-09 · tokens gains type scale, font stacks, voices, measure · SPEC FE §6, §5.4; D-012 · MODEL Sonnet · SHARED yes · RISK no
ACCEPTANCE
  - FE §6.3 scale VERBATIM as tokens (display 40/1.1 … micro 10.5/1.3, each with
    face role): rem-based on web output, raw px numbers in theme.ts for native
  - Font stacks per §6.1 incl. fallbacks as --eu-font-{prose,ui,mono}; Tailwind
    @theme mapping so text-display…text-micro and font-prose/ui/mono utilities exist
  - §6.2 voices (serif/mono/terse/plain: face+size+lineHeight+tracking) as composite
    @utility voice-* on web and typed objects in theme.ts for native
  - Weight policy encoded: 400/500 available, 600 only via a name/button-scoped
    token, 700+ never emitted anywhere
  - Measure utilities: measure 64ch, measure-idea 58ch, measure-argument 44ch
    (§6.3) — retires D-012's local @utility in apps/web (deletion happens in
    M0-FE-02, this ticket never touches apps/web)
  - Existing artefact-sync tests and contrast gate stay green; `pnpm generate`
    deterministic
DEPENDS ON M0-SH-02
```

```
ID M0-SH-04 · packages/core — schemas, formatters, ink/voice maps, helpers · SPEC FE §3, §6.2; SD §2 · MODEL Sonnet · SHARED yes · RISK no
ACCEPTANCE
  - Runs on web AND native: no DOM, no node builtins in src
  - zod dependency approved by Fable (spec-named, FE §3). No other new deps
  - Ink map: the seven token names (never hex), typed against packages/tokens
  - Voice map: voice name → style descriptor per FE §6.2 (agent→voice assignment
    is DATA from the API, not hardcoded here)
  - relativeTime via Intl.RelativeTimeFormat (no date lib, rule 12) with the
    ladder now/·m/·h/·d, absolute past 7d
  - Word counter: unicode-aware; validator for the idea field's 50–70 range (§9.4)
  - Keyset cursor encode/decode matching contracts' pagination shape exactly
    (base64url, opaque to callers)
  - zod schemas for composer input (idea range, For/Today, tags ≤2) mirroring
    contract types — compile error if they drift (type-level assert)
  - Unit tests per module; workspace typecheck/build green
DEPENDS ON M0-SH-02, M0-SH-03
```

```
ID M0-FE-02 · Self-hosted fonts: Newsreader, Instrument Sans, Commit Mono · SPEC FE §6.1, §14 · MODEL Sonnet · RISK no
ACCEPTANCE
  - Three VARIABLE woff2 files (Newsreader with opsz axis), latin subset,
    self-hosted in apps/web, combined ≤100KB — a checked-in script measures and
    fails over budget
  - next/font/local with the §6.1 fallback stacks; font-display swap; prose + UI
    preloaded, mono NOT preloaded (§14)
  - Font family CSS vars wired to the tokens stacks (M0-SH-09) — no family
    string restated in apps/web
  - Probe page extended: ten-step scale and four voices render in both themes
  - D-012's local @utility measure in apps/web DELETED in favour of the tokens one
  - No layout-shift regression: CLS budget ≤0.02 holds on /probe
DEPENDS ON M0-FE-01, M0-SH-09
```

```
ID M0-FE-03 · Three shells: feed, reading, private + breakpoints · SPEC FE §7 · MODEL Opus · RISK no
ACCEPTANCE
  - Feed shell grid 236px/minmax(0,1fr)/300px, centre max 720px; Reading single
    column max 720px with back link; Private single column max 640px, no rails
  - Media queries for shells only, per §7.2: lg ≥1180 three-col; md 780–1179
    hides right rail (its content reachable as a Staff nav route — stub route
    acceptable); sm 480–779 single column + horizontally scrolling surface strip
    + bottom tab bar; xs <480 tightenings that belong to the shell
  - Container queries are the stated pattern for components — shells must not
    preclude them (no overflow/contain traps)
  - NO hamburger anywhere; the surface strip IS the nav (§7.2)
  - RSC only, zero 'use client'; tokens only; demo routes render each shell with
    placeholder content
DEPENDS ON M0-FE-01, M0-SH-09
```

```
ID M0-FE-04 · Primitives: Button, Chip, Field, Rule — all states · SPEC FE §9.1, §8.1, §11 · MODEL Sonnet · RISK no
ACCEPTANCE
  - Every component: default/hover/focus-visible/active/disabled(/loading where
    applicable) — visible on a fixture route until Storybook (M0-FE-07)
  - Button: variant solid|outline|quiet, size sm|md, loading, icon?, iconOnly —
    iconOnly THROWS in dev if the icon is outside the §8.1 twelve-item whitelist;
    'solid at most once per screen' documented as a review rule (no runtime check)
  - Chip: tone, mono? — the ONLY component using radius.full
  - Field: visible label REQUIRED (type-level), hint, error replacing hint with
    aria-describedby, optional counter
  - Rule: strength soft|default|strong, replaces every ad-hoc border
  - Zero 'use client' expected; if a leaf truly needs it, justify in the PR body
    (client-component count is CI-gated later, FE §14)
  - Tokens only — any hex/px/arbitrary value fails review outright (§1)
DEPENDS ON M0-FE-01, M0-SH-09
```

---

## Wave 3 — backend API surface + frontend component system (groomed 2026-07-27, after D-016)

Wave-wide rules (both domains):
- Read CLAUDE.md, DECISIONS.md D-010…D-016, and the spec sections your ticket names, before writing code.
- Contract-first (rule 1): the OpenAPI skeleton in eutectic-shared/packages/contracts is merged and is the ONLY route surface BE-15 binds and FE-08 consumes. If a route you need is missing from openapi.yaml, STOP and report to your CTO — Fable owns contracts.
- No partial work merged; PR per ticket; review tier ≥ implementer tier; CTOs merge to develop.
- Remote branch deletion is Fable-only (D-015). Leave merged branches in place.
- New-dependency rule 12: dependencies named in a ticket's ACCEPTANCE are pre-approved by Fable; anything else needs escalation BEFORE install.

### Backend

```
ID M0-BE-15 · Fastify app: OpenAPI route binding, error envelope, request id, versioned Accept · SPEC SD §2, §9; contracts/openapi.yaml · MODEL Opus · RISK yes — the route surface everything else binds to
ACCEPTANCE
  - apps/api Fastify app; every route registered FROM the merged openapi.yaml
    (generated server-types), handlers are typed stubs returning contract-shaped
    501/mock payloads — NO business logic in this ticket
  - CI-able drift check: registered routes vs openapi.yaml disagree → test fails
    (SD §2 "CI fails if openapi.yaml and the API's registered routes disagree")
  - Error envelope: single shape for all errors, per contract; unknown routes and
    validation failures both use it
  - Request id: accepted from inbound header or generated; echoed in responses
    and in every log line
  - Accept: application/vnd.staffroom.v1+json versioning honoured; wrong/missing
    version → contract-shaped 406
  - Fastify + its openapi glue are the approved new deps; anything further
    escalates first (rule 12)
  - Worker test not applicable; route-surface test + drift test required
DEPENDS ON M0-SH-03, M0-BE-01
```

```
ID M0-BE-16 · Idempotency middleware: Idempotency-Key on all mutations · SPEC SD §3 §135-141 · MODEL Opus · RISK yes — correctness of every retry
ACCEPTANCE
  - Every mutating route (POST/PUT/PATCH/DELETE) requires Idempotency-Key;
    missing → contract-shaped 400; reads never require it
  - First request executes and RECORDS status+body; replay with same key returns
    the recorded response, does NOT re-execute (proven by a side-effect counter
    in tests)
  - Same key + different request hash → 422 conflict (key reuse is a client bug)
  - Storage in Postgres (new table allowed ONLY if named idempotency_responses
    and additive, migration 0012 — check contiguity gate), or reuse
    event_idempotency ONLY if semantics genuinely fit; justify choice in PR body
  - Concurrency test: two parallel identical requests → exactly one execution
DEPENDS ON M0-BE-15
```

```
ID M0-BE-19 · Redis: cache helper, counters, sliding-window rate limiter · SPEC SD §3 §6 (cache layers table) · MODEL Sonnet · RISK no
ACCEPTANCE
  - packages/db or new packages/cache (CTO's call, justify): typed get/set/del
    with TTL, JSON codec, namespace prefixes; Redis at host port 6380 (dev)
  - Redis is CACHE ONLY (D-001): every helper is loss-tolerant — a Redis outage
    degrades to Postgres reads, never to an error; test proves fallback
  - Counters: atomic incr with TTL bucket
  - Sliding-window rate limiter: allow/deny + retry-after; unit tests cover
    window boundaries
  - No queue semantics anywhere in this package (rule: queue lives in Postgres)
DEPENDS ON M0-BE-01
```

```
ID M0-BE-18 · Entitlement resolution + session caching · SPEC SD §5 (identity/entitlement), §6, §11 · MODEL Sonnet · RISK yes — premium must never buy reach
ACCEPTANCE
  - resolveEntitlement(userId, now): active row = valid_from <= now < coalesce(valid_to,'infinity'),
    newest valid_from wins; no row → free-plan defaults (constants, spec'd in PR)
  - Cached on session via BE-19 helper, TTL <= 60s; cache invalidated on
    entitlement.changed (subscriber or explicit bust — document which)
  - Read surface returns the entitlement ROW shape (rows, not booleans — SD §5)
  - GUARD: nothing in this module is importable by any ranking/feed code path —
    add the CI-able test skeleton asserting rank_score modules do not import
    entitlements (rule 9 seed test)
DEPENDS ON M0-BE-15, M0-BE-19
```

```
ID M0-BE-20 · OTel tracing through queue jobs, structured logs, health endpoints · SPEC SD §13 · MODEL Sonnet · RISK no
ACCEPTANCE
  - OpenTelemetry SDK (approved dep): trace id born at the HTTP request,
    propagated through withJob enqueue into the worker handler (job payload or
    job metadata carries context; document the mechanism)
  - Structured JSON logs with request id + trace id on api and worker
  - /healthz (liveness: process up) and /readyz (readiness: Postgres SELECT 1,
    Redis PING — Redis failure degrades readiness to 'degraded', not down)
  - Retention rule honoured: prompt hashes and token counts only, never full
    reasoning traces (SD §13) — note in code where inference logging will hook
DEPENDS ON M0-BE-14, M0-BE-15
```

```
ID M0-BE-22 · Debt: events test helper double-encode fix · SPEC D-016 item 6a · MODEL Sonnet · RISK no
ACCEPTANCE
  - packages/db/src/__tests__/events.test.ts helper: ${JSON.stringify(payload)}::jsonb
    replaced with sql.json(payload); add one assertion that the stored value is a
    jsonb OBJECT (jsonb_typeof = 'object'), not a string scalar
  - Grep test or lint note preventing the ${JSON.stringify(...)}::jsonb shape
    from reappearing in packages/db tests
DEPENDS ON M0-BE-13
```

M0-BE-17 (GitHub OAuth) is BLOCKED on human input: a GitHub OAuth App client id/secret. Do not start it. M0-BE-21 (admin auth) follows BE-17.

### Frontend

```
ID M0-FE-05 · Primitives: Meter, Skeleton, Sheet, Toast, Tooltip · SPEC FE §9.1, §12, §4.2 · MODEL Opus · RISK no
ACCEPTANCE
  - Meter: wellMade/weak/replies/myVote/onVote; mono micro, gap space6; NO pills,
    no background; colour only on the pressed signal; labels >=sm, icon+count
    below sm (container query, not viewport)
  - Skeleton: lines?/width?/height — height MUST equal the replaced content
    (CLS); document the pairing rule where each skeleton is defined
  - Sheet: native <dialog> (§4.2 — no focus-trap library), side, title;
    closes on Esc and backdrop; focus returns to invoker
  - Toast: one at a time, 4s, bottom-left; tone, message, action?
  - Tooltip: delay 400, keyboard reachable, never sole source of information
  - 'use client' allowed ONLY at leaves that need it (Sheet trigger, Toast,
    Tooltip, Meter vote handler); count and justify each in the PR body —
    app-authored JS budget D-012 applies
  - All states on /probe/primitives; tokens only
DEPENDS ON M0-FE-04
```

```
ID M0-FE-06 · Entry system: EntryShell, Gutter, Byline, Prose, Cites · SPEC FE §9.2, §7.4, §6.2-6.3 · MODEL Opus · RISK yes — the reading surface IS the product
ACCEPTANCE
  - Gutter per §7.4 verbatim: width 56 (40 xs), initial at prose 27/.85 in
    agentInk, age mono 10.5 inkFaint, cal mono 10.5 inkQuiet over hairline
  - EntryShell: padding space7 space8 space6, borderBottom 1px rule, content col
    flex 1 minWidth 0 maxWidth 64ch; container-query driven, never viewport
  - Prose: renders the structured token array (paragraphs, code, em, strong,
    links) — NO markdown engine, NO dangerouslySetInnerHTML; token-array type
    imported from @eutectic/core or contracts (whichever holds it; if neither,
    STOP and report — Fable adds it to the shared package)
  - Byline: agent voice per §6.2 (voice-* utilities from SH-09)
  - Cites: refs list at entry end, mono micro
  - RSC only — zero 'use client' in this ticket
  - /probe/entry route rendering one entry per voice, both themes
DEPENDS ON M0-FE-04, M0-SH-09, M0-SH-04
```

```
ID M0-FE-07 · Storybook: every component, every state, both themes · SPEC FE §9, OM §9 · MODEL Sonnet · RISK no
ACCEPTANCE
  - Storybook (approved dev-dep) with stories for FE-04/05/06 components: every
    prop-state in §9.1's table, light AND dark (data-theme switch)
  - Dev-only: nothing from Storybook may enter app bundles (build proves 103KB
    baseline unchanged)
  - /probe/* fixture routes REMAIN (they are the no-JS truth; Storybook is the
    catalogue) — do not delete them in this ticket
DEPENDS ON M0-FE-05, M0-FE-06
```

```
ID M0-FE-08 · Generated client + TanStack Query + Prism mock · SPEC FE §4.1, §4.4, SD §2 · MODEL Opus · RISK yes — the only bridge to the backend
ACCEPTANCE
  - Typed client generated from eutectic-shared contracts (never hand-written
    fetch); generation script + staleness check (regenerate and diff → CI-able)
  - TanStack Query v5 (approved dep, ~13KB — D-012 app-authored budget applies:
    / stays <=65KB app-authored; measure and report numbers in the PR)
  - Query keys per §4.4: ['feed', surface, forum, tag, cursor]; cursor helpers
    from @eutectic/core
  - Prism mock server (dev-only dep) serving openapi.yaml; pnpm script; one
    smoke test hitting the mock through the generated client
  - Accept: application/vnd.staffroom.v1+json set by the client on every request
  - Session cookie mode: credentials include, no token storage in JS
DEPENDS ON M0-SH-03, M0-FE-01
```

```
ID M0-FE-09 · Theme resolution server-side, no flash · SPEC FE §5.3, §16 · MODEL Sonnet · RISK no
ACCEPTANCE
  - Resolution order: user setting → OS preference → light (§5.3); data-theme
    stamped on <html> in the RSC layout — NO flash, NO client-side theme swap on
    first paint (verify: prod HTML contains resolved data-theme)
  - M0 persistence = httpOnly-false theme cookie set via a route handler; the
    server-persisted profile setting arrives with auth (M1) — leave the seam
    (one function that today reads the cookie, later reads profile-then-cookie)
  - OS preference honoured via prefers-color-scheme ONLY when no cookie —
    implemented without flash (CSS-level default or inline attribute logic in
    the layout; document the choice)
  - No user-customisable accent; agent inks never overridable (§16)
  - Toggle control on /probe (not a product surface yet)
DEPENDS ON M0-FE-01
```

---

## Wave 4 — CI + admin scaffold + backend corrections (groomed 2026-07-27, after D-019)

### Backend

```
ID M0-BE-23 · FREE_PLAN_DEFAULTS correction + not_implemented stubs + SUCCESS_STATUS deletion · SPEC capabilities §16, D-019, M0-SH-12 · MODEL Sonnet · RISK yes — entitlement constants ARE product policy
ACCEPTANCE
  - FREE_PLAN_DEFAULTS = maxPostsPerDay 5, maxRounds 3, maxAgentResponses 4
    (capabilities §16); booleans and residenciesAllowed unchanged
  - Test asserts the constants against §16's numbers BY NAME in a comment
    citing the spec — the next drift is a loud failure, not a fixture echo
  - Pull eutectic-shared develop (f5e5515): stubs switch ApiFailure(501,'internal')
    → 'not_implemented'; delete the hand-maintained SUCCESS_STATUS table in
    routes.ts and read RouteDescriptor.successStatus from the contract
  - No other behaviour change; suites stay green
DEPENDS ON M0-BE-18, M0-SH-12
```

### Frontend

```
ID M0-FE-10 · CI: the ten §19 gates, wired locally · SPEC FE §19, §14, D-012, D-018 · MODEL Opus · RISK yes — the gates ARE the constitution
ACCEPTANCE
  - One `pnpm ci-gates` entry point (script or turbo task) running, in order:
    contract freshness (exists), token lint (grep: no hex, no px font-size, no
    arbitrary Tailwind values outside the ONE sanctioned local block), ink
    contrast both themes (14 pairs >= 4.5:1, from generated tokens.json),
    bundle budgets per D-012/D-019 (framework ceiling 102KB, app-authored
    per-route ceilings), client-component count per route (six today — ratchet),
    font budget (exists), a11y lint (img dimensions, icon-only whitelist,
    accessible names), banned-import gate (§19.10 + §1 banned deps),
    premium-neutrality placeholder that FAILS LOUDLY as 'not yet testable'
    only if skipped silently — mark xfail with a tracking note until entries
    render real entitlement data (M1)
  - Lighthouse and Playwright visual regression: wire runners + budgets;
    Playwright includes the CLS check on /probe promised in D-015 item 7
  - Node engine pinned >= 22.12 (package.json engines + CI config; D-019)
  - Every gate proven RED at least once in the PR body (break it, show the
    failure, fix it) — a gate that has never failed is decoration
  - No new runtime deps; dev-only tooling needs no escalation if listed in
    the PR body
DEPENDS ON M0-FE-07, M0-SH-12
```

```
ID M0-FE-12 · apps/admin scaffold, allowlist auth seam · SPEC FE §3, SD §12 · MODEL Sonnet · RISK no
ACCEPTANCE
  - apps/admin: Next.js 15 App Router, same tokens/@theme wiring as apps/web
    (import from packages/tokens — no copy), same font setup reused
  - Allowlist auth SEAM only: env-read allowlist (ADMIN_GITHUB_LOGINS), a
    guard layout that today renders a 'sign in with GitHub' dead-end (BE-17
    blocked) and a clearly-marked DEV_BYPASS usable only when
    NODE_ENV=development; 2FA arrives with BE-21 — leave the seam, do NOT
    build auth
  - Route stubs per SD §12: /kill-switch, /review-queue, /reports,
    /tone-policy, /proposals, /budgets, /distress (highest priority, first in
    nav), /projections — each a titled empty state, no fake data
  - Talks only to /v1/admin/* via the generated client — since those routes
    are not in the contract yet, NO data fetching lands in this ticket; wiring
    follows the admin contract ticket
  - Bundle discipline: same 102KB ceiling; zero app-authored client JS expected
DEPENDS ON M0-FE-07
```

---

## Wave 5 — consolidation (after M0-SH-13, shared develop @ 716835c)

```
ID M0-FE-13 · Delete the local-tokens block: consume SH-13's emissions · SPEC FE §7.1/§7.2/§7.4/§9.1/§11/§13, D-018, D-021 · MODEL Sonnet · RISK no
ACCEPTANCE
  - packages/tokens (shared develop @ 716835c) now emits everything in the
    block: breakpoints, --container-eu-sm, shell columns + shell-grid-3/
    shell-grid-2/shell-column/shell-column-private, shimmer (--animate-shimmer
    + eu-shimmer keyframes), sheet-backdrop, delay-tooltip, touch-target,
    block-lh, and leading-initial (.85). Verify by reading generated/tokens.css
    BEFORE deleting anything.
  - apps/web/src/app/globals.css: delete the entire sanctioned local-tokens
    block, markers included — from the `eutectic:local-tokens:begin` banner
    comment through the `:end` comment. Nothing token-shaped may remain below
    @layer base. The file's header comment and the D-012 deletion note may be
    tidied in the same pass.
  - apps/web/scripts/check-token-lint.mjs: the exemption is RETIRED, not
    relaxed — a `eutectic:local-tokens:begin`/`:end` marker pair appearing
    ANYWHERE in the app is now a failure (today the script fails when the pair
    is MISSING; invert that). Raw dimension/duration literals in globals.css
    are now banned like everywhere else. Prove the gate red once: re-add a
    marker pair, show the failure in the PR body, remove it.
  - components/entry/gutter.tsx: `leading-none` → `leading-initial` on the
    initial (closes the documented ~4px slack, §7.4 ".85" verbatim); the two
    documented `sm:` call sites become `@min-eu-sm:` container variants per
    the file's own migration note. Delete the now-satisfied "TWO SPEC VALUES
    THIS FILE CANNOT EXPRESS" caveats. A container-query variant requires a
    named/`@container` ancestor — if none exists yet at those call sites, add
    `@container` to the gutter's parent in the same PR, or report to
    CTO-Frontend rather than leaving `sm:` silently in place.
  - Every other call site is a no-op by construction (same utility names from
    tokens.css). Zero visual diffs outside the gutter initial: Storybook
    stories unchanged, Playwright baselines updated ONLY for gutter-initial
    stories if the .85 leading shifts pixels.
  - pnpm ci-gates green end-to-end (Node >= 22.12 binary); CLS ratchet (0.026)
    and framework baseline (102KB) unchanged — this ticket adds zero JS.
  - No new dependencies. No spec divergence expected; if any is found, spec
    update in the same PR per CLAUDE.md rule 13.
DEPENDS ON M0-SH-13 (done, 716835c), M0-FE-10
```

```
ID M0-BE-24 · Real backend CI: workspace reconstruction, Postgres gates · SPEC SD §13, D-022 · MODEL Sonnet · RISK no
ACCEPTANCE
  - Replace the placeholder .github/workflows/ci.yml: push (develop/main) +
    pull_request + workflow_dispatch. Reconstruction recipe per D-022, copied
    from eutectic-shared/.github/workflows/ci.yml: checkout self at the PR
    ref into eutectic-backend/, checkout Sumit-07/eutectic-shared and
    Sumit-07/eutectic-frontend at develop as siblings, copy the six
    workspace-root mirror files up one level FROM THE eutectic-shared
    CHECKOUT, touch .synthesized-from-mirror, pnpm 9.15.9, Node from .nvmrc,
    pnpm install --frozen-lockfile
  - postgres:16 service container; run every migration (0000-0012) against
    the fresh database before tests; DATABASE_URL wired to the service
  - Gates, filtered to "./eutectic-backend/**": build, typecheck, test —
    the premium-neutrality guard and worker tests run in CI, not just locally
  - If any test genuinely needs Redis, add a redis:7 service container;
    do NOT mock around a real integration test to avoid the container
  - .gitignore: drop trailing slashes on directory patterns (D-018 hazard),
    same comment as eutectic-shared's
  - Retire the BE-15 hand-declared Node ambient shims: @types/node ^22
    dev-only is PRE-APPROVED (rule 12, D-022). Lockfile flow: send Fable the
    final package.json diffs; Fable lands the pnpm-lock.yaml mirror update in
    eutectic-shared BEFORE this PR can go green. Run pnpm install locally to
    update the live root lockfile.
  - Every gate proven RED once in the PR body (break, show, fix)
DEPENDS ON M0-SH-05 (done), M0-BE-20
```

```
ID M0-FE-14 · Real frontend CI: the 11 gates on Linux + Playwright baselines · SPEC FE §19, D-020, D-022 · MODEL Sonnet · RISK no
ACCEPTANCE
  - Replace the placeholder .github/workflows/ci.yml: same reconstruction
    recipe as D-022 (self at PR ref, siblings at develop, mirror copied up,
    frozen install), Node from .nvmrc (22.12 — the gates' floor)
  - pnpm ci-gates runs end-to-end on ubuntu-latest: all 11 gates, including
    Lighthouse (headless Chrome on the runner) and the CLS check on /probe
  - Playwright: npx playwright install --with-deps chromium; commit the
    Linux visual-regression baselines the gates currently skip loudly on;
    the skip path is retired — missing Linux baselines now FAIL
  - Ratchets unchanged (CLS 0.026 on /probe, LCP 2300ms on /, framework
    baseline 102KB): CI must reproduce the same numbers class, not relax them
  - .gitignore: drop trailing slashes on directory patterns (D-018 hazard)
  - Every gate proven RED once in the PR body
DEPENDS ON M0-SH-05 (done), M0-FE-13
```
