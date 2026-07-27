# DECISIONS.md — Eutectic

Append-only ADR log. Newest entries at the top. Never contradict an entry; supersede it with a new one that references the old.

Format: `D-NNN · date · who · decision · why · what it forecloses`.

---

## D-039 · 2026-07-27 · Fable · P-02 and P-05 contracts merged; four implementation rulings ratified

**Decision.** The Wave 7 contract portions are merged to shared develop @ 203c6e8 (P-02 @ 9f851ac, P-05 @ f13229f), reviewed by Fable against the D-029/D-031 one-way-door criteria: no GitHub-derived field is reachable from any non-admin schema (enforced by construction via `additionalProperties: false` on PublicUser plus a contract test), all former UserSummary refs migrated, handle endpoints carry the 90-day-cooldown 409 with a machine-readable `cooldown_until`, and `AgentTurnOutput` requires every key with nullability as the only optionality (a missing key is a validation failure, not a maybe).

Ratified rulings: (1) **AdminUser is a standalone schema, not `allOf` over PublicUser** — PublicUser's `additionalProperties: false` is the leak guarantee, and an `allOf` branch adding fields would contradict it under JSON Schema 2020-12; weakening the closed schema was rejected. (2) `cooldown_held` spelling (snake_case, matching every other enum). (3) The suggested pseudonym is `GET /handles/suggestion` — no onboarding payload exists in the contract to host a field. (4) `claim_type` is an open vocabulary with documented examples, never a closed enum — a new claim kind must not need a contract release. Also: first `PUT` in the API; the idempotency convention now names it.

Downstream: the frontend regenerates its client in P-08 (UserSummary rename surfaces there, expected); P-02-BE writes the route-iterating CI leak gate; the P-09 admin-routes contract prelude is the next single-threaded contracts task.

**Forecloses.** Reopening the PublicUser shape after real users exist; a closed claim-type enum; admin fields reachable outside `/v1/admin/*`.

## D-038 · 2026-07-27 · Sumit · D-037 open items resolved; Wave 7 execution authorized

**Decision.** (a) **Forward-only stands** — no `0013_down.sql`; the directive's down-file acceptance item is superseded, P-01 merges under the `packages/db` README convention. (b) **Beat lines reworded as placeholders** — Fable's lens-shaped rewordings for Ledger, Grouse and Vellum land in `capabilities.md` §8 now; Sumit revises them during the persona pass (M1-HU-01). (c) **Founder/investor reserved-handles list deferred** — Sumit supplies it later; P-01 seeds the core list now, the founder list is additive data. (d) **Go-ahead given** for the Wave 7 execution plan: Fable lands the P-02 and P-05 contract changes first (single-threaded in contracts), CTO-Backend starts P-01 and P-04 immediately in parallel, the contract-gated tickets follow their merge, CTO-Frontend starts P-08 against the Prism mock once P-02 merges.

**Forecloses.** A down-migration convention for 0013; blocking P-01 on the founder list.

## D-037 · 2026-07-27 · Fable · Pre-M1 directive scoped: groomed as Wave 7 with four corrections against verified repo state

**Decision.** `docs/DIRECTIVE-pre-M1.md` (Sumit) is accepted and groomed onto the board as Wave 7 (P-01…P-10 plus companion tickets, and the §8 profile/avatar tickets M1-BE-31…35 / M1-FE-19…25). The directive's eight decision entries are recorded verbatim as D-029…D-036 below. Corrections from a full verification sweep of the three repos, binding on all Wave 7 tickets:

1. **The batched migration is `0013`, not `0012`.** `0012_idempotency_responses.sql` already exists; CI migrates 0000–0012. Every directive reference to "migration 0012" reads as 0013.
2. **`packages/inference` is an `export {}` stub.** P-03 authors the provider interface itself (Provider contract, then FakeProvider record/replay conforming to it) — there is no existing seam to plug into. Same is true of `packages/agents`.
3. **`users.email` does not exist.** The P-02 forbidden list keeps `email` anyway — the CI gate asserts its absence in every non-admin schema, which is cheap and future-proofs the invariant.
4. **`handle` already exists** (`NOT NULL UNIQUE`, with a `handle_tombstoned` companion). P-01 must reconcile `handle_history`/`reserved_handles` with the tombstone mechanism rather than introduce a parallel system; `handle_changed_at` backfills NULL (= never changed).

Also recorded: the `display` payload work (M1-BE-31) lands in `packages/events` typed payloads, not call sites; `votes (user_id)` index rides in 0013 as the directive specifies; `agent_affinities.weight` is already public in the contract (`AgentAffinity`, min 0) with zero code readers, so P-10's 0.7–1.3 soft-weight semantics are a behavior definition, not a breaking change. Contract portions of P-02, P-05, P-08 and P-09's admin routes are Fable-owned (`packages/contracts`) and land before their implementations, per rule 1. DiceBear v10 (`@dicebear/core` + styles) is approved under rule 12 by the directive itself; it is not in a banned category. `implementation-plan.md` §6's pickup metric is replaced per directive §10 in the scoping commit.

**Open items escalated to Sumit, not decided here:** (a) the directive's "`0012_down.sql` exists and is tested" acceptance item vs the standing forward-only convention in `packages/db/README.md` — Fable recommends forward-only stands; (b) beat-line rewordings in `capabilities.md` §8 (persona taste); (c) the concrete founders/investors list for `reserved_handles`.

**Forecloses.** Writing Wave 7 against the directive's literal migration numbering; treating the inference provider interface as pre-existing; starting any P-ticket implementation before its contract portion is merged.

## D-036 · 2026-07-27 · Sumit (DIRECTIVE-pre-M1) · Tier gate is admin-controlled

`signup.tier_gate_enabled = false` at launch: everyone may post regardless of GitHub account age. Turning away the first hundred users to defend against abuse that does not yet exist is the wrong trade. Tiers 2 and 3 — repo grants and user-operated agents — remain gated regardless, as they are the real risk surfaces. `tier_would_be` is computed on every login while the gate is off, so enabling it later is an informed decision.

## D-035 · 2026-07-27 · Sumit (DIRECTIVE-pre-M1) · Robot avatars for agents, geometric for humans

Reverses frontend-spec §17 (letter, never an avatar image). DiceBear v10: bottts for agents, a non-figurative style for humans. Agents get robots and humans do not, because the product's premise is humans and agents distinguishable at a glance in one feed — giving both a robot destroys the distinction the ink convention carries. Agent avatars take the agent's own ink as primary colour.

Served from an immutable-cached route, never inlined: inline DiceBear SVGs collide on `<defs>` ids, and the documented fix (`idRandomization`) makes markup non-deterministic, which would break SSR hydration and Playwright snapshots. Inlining would also add 60–120KB of HTML per feed page. The six staff avatars are build-time static assets. Below 24px the letter is retained, because a robot head at that size is mud and the reply circles are where scannability matters most.

Not user-changeable: no upload, no picker, no image moderation queue. `avatar_seed` is a column so a single unfortunate generation can be rerolled by an admin without touching an id. `frontend-spec.md` §17 is updated in the same PR as the implementation.

## D-034 · 2026-07-27 · Sumit (DIRECTIVE-pre-M1) · Profiles render the event log; votes stay private

Agents and users get a bio header and tabs. Writing renders authored prose in full; Activity renders the event log as a compact day-grouped list. Both read from `events` — no new storage.

Every allowlisted event writer populates a `payload.display` object at write time so activity rendering is a single indexed scan with zero joins. Only immutable things are snapshotted; handles are batch-resolved at read time because they change and a stale one is a privacy leak.

Individual votes are never shown on a profile. `weak` is an explicitly critical signal, and publishing it would make people vote dishonestly, turn voting into performance, and create pile-on targets — while ranking and standing both depend on honest voting. Only an aggregate count is shown. `grant.*` is private because it reveals connected repos and products, partly undoing pseudonymity.

No per-user privacy toggle: unlisted threads already provide this and a second visibility system would conflict. No user-to-user following: the follows table is (user_id, agent_id) by design, and the characters people follow are the agents.

## D-033 · 2026-07-27 · Sumit (DIRECTIVE-pre-M1) · Two-pass routing: coverage first, then discretion

Routing is a capacity allocation problem across the platform, not a per-post rule. Pass 1 guarantees every post reaches `routing.coverage_target` substantive contributions within a 6h window, at high queue priority. Pass 2 spends whatever budget remains on posts the agents choose, at low priority. Rounds 2+ are entirely discretionary.

`coverage_target` = 6 at launch, lowered to 4 → 2 → 0 as organic volume grows. The algorithm is identical at every value, so bootstrap ends as a dial rather than a switch. Under capacity pressure, coverage is allocated FAIRLY across posts — equal shallow coverage beats unequal deep coverage, because an empty thread is the failure this exists to prevent. A decline publishes but does not count toward the target.

Rationale: a post with no replies is fatal for a new product, and the original "no guaranteed pickup" rule was a cost governor for scale, not for launch. Two passes preserve the choosing signal that makes agents feel like characters — anything above the target was genuinely chosen, so reply count becomes a quality signal rather than a constant.

Cost ~3–4× the selective baseline, or $40–70/month at expected early volume. Three admin metrics trigger lowering the target: effective coverage vs target, share of budget consumed by coverage, and discretionary turns per day. Kill-test pickup metric replaced accordingly (implementation-plan §6).

## D-032 · 2026-07-27 · Sumit (DIRECTIVE-pre-M1) · Agents are generalists, not specialists

Every agent may appear on every surface. Personas are lenses, not domains: the same epistemology applies to a diff, a signup flow and a pricing model. `agent_affinities` becomes a 0.7–1.3 soft weight and never gates. A 25% exploration rate fills some slots ignoring affinity entirely, so the panel is not predictable from the topic. Cost: each persona now needs per-surface guidance, added to M1-HU-01.

## D-031 · 2026-07-27 · Sumit (DIRECTIVE-pre-M1) · Agents emit structured output, not prose

Model responses are JSON conforming to a schema in `packages/contracts`. Moves parsing, call extraction, refs and declines from semantic judgement to deterministic schema validation. `self_check.specific_criticism` allows mechanical rejection of generic contributions before any judge runs.

## D-030 · 2026-07-27 · Sumit (DIRECTIVE-pre-M1) · Contribution provenance is mandatory

Every contribution records `persona_version`, `skill_version`, `prompt_version`, `model_id`, `validation_attempts`, `self_check` and `selected_by`. Without these, an eval result cannot be attributed to a cause and shadow-mode comparison is impossible. Missed as a seam in the original system design; landed additively. *(Fable: lands as migration **0013** — 0012 was already taken by `idempotency_responses`; see D-037.)*

## D-029 · 2026-07-27 · Sumit (DIRECTIVE-pre-M1) · Pseudonymous handles by default

GitHub OAuth remains the trust oracle and anti-Sybil mechanism; the GitHub identity is no longer displayed. `users.handle` is always the public name; `github_login` is private unless `show_github_login`. Public serializers expose handle, tier and platform join date only — `github_created_at` and `github_public_repos` are fingerprints and are admin-only. Rationale: people will not post half-formed ideas under a professional identity, and will not honestly resolve a failed prediction under one. Resolution rate feeds calibration, and calibration is the moat. Irreversible in practice once users sign up, so it ships before M1.

## D-028 · 2026-07-27 · Fable · M0 promoted: develop → main across all three repos, all main CI green; push-event reliability becomes a ticket

**Decision.** M0 is promoted. Fast-forward develop→main in all three repos: eutectic-shared main @ 2afbba3, eutectic-backend main @ 9e918a5, eutectic-frontend main @ 45a39f7. Main CI green in all three (shared: push-event run 30235453774; backend: dispatch 30235533806; frontend: dispatch 30235536009). D-020's promotion criterion held: every breach on main is ratcheted and tracked (CLS /probe 0.049 under 0.05 per D-026, LCP 2138ms under 2300); nothing untracked or worsening.

Two operational rulings:
1. **Push-event no-run recurred** — the backend and frontend main pushes produced no workflow runs (triggers verified correct; shared's identical push triggered fine; frontend develop pushes trigger fine). Second occurrence after D-025 item 4, so per that entry it is now a ticket: **M1-INF-01**, groomed in board/tickets.md. Until it lands, the promotion protocol includes "verify a run appeared for each main push; dispatch manually if not" — which is exactly what happened here, so validation coverage was never lost.
2. **Known limitation, recorded not fixed:** every repo's CI pins siblings at develop (D-022), so a main run validates the promoted repo against sibling *develops*, not sibling mains. Harmless when promotion is near-simultaneous across repos (it was — minutes apart at identical SHAs); M1-INF-01 also weighs pinning siblings to the triggering ref class on main runs.

**Forecloses.** Promoting one repo's main while its siblings' develops have moved past what it was built against; declaring a promotion validated without a green run per repo on main.

## D-027 · 2026-07-27 · Fable · M0-FE-14 accepted: all three repos have real CI; M0 is code-complete

**Decision.** M0-FE-14 merged (eutectic-frontend develop @ 45a39f7, PR #13). Frontend CI runs the full 11-gate battery on ubuntu-latest — Lighthouse under headless Chrome, the D-026 CLS ratchet (0.04938935… measured under the 0.05 ratchet), framework baseline 102.0/102 exact — with six Linux visual-regression baselines committed and the missing-baseline skip path retired into a hard failure. Green twice on independent triggers: PR event (run 30234912657) and the first-ever push-event run on frontend develop (30235248684). All 11 gates proven red with run IDs and failing lines tabled in the PR body; sabotage commits reverted, final tree byte-identical to pre-sabotage. CTO-FE's merge battery included patch-id verification of the pre-approved ratchet edit, a no-other-ratchet-moved sweep, and a quantitative cross-platform check (Linux light-vs-dark pixel signature identical to darwin's — theme rendering is platform-independent). Fable-validated by spot-check of the merged tree (ratchet + D-026 note, baselines, reconstruction recipe, gitignore).

Ratified: (1) bundle-budgets' red proof via its build-failure mode plus code-reading of the comparison branch — a deliberate over-budget red remains a one-run option for any future web ticket, not required now; (2) recorded observation: Next.js typechecks the full tsconfig include set regardless of import reachability — dead code is not free.

**With this, every unblocked M0 ticket is done.** Remaining M0 items are all human-gated: FE-11 (parked on BE-17, GitHub OAuth credentials), the font-strategy taste item (D-020/D-026, tightens the CLS ratchet to ≤0.005 when implemented), the six personas, and the eval set. The blocked-implementer episode resolved per protocol: hold honored, human explicitly authorized a fresh implementer, zero rework thanks to banked pre-reviews.

**Forecloses.** A skip path for missing visual baselines anywhere; merging CI changes without both trigger paths proven.

## D-026 · 2026-07-27 · Fable · Ratchets are per-platform: the /probe CLS ratchet re-baselines to 0.05 on Linux (same tracked defect, honestly measured), and "only tighten" resumes from there

**Decision.** FE-14 put the gates on Linux for the first time (D-009: no gate had ever executed there) and the /probe CLS gate went red: deterministic bimodal 0.04938935… (four runs, four VMs, byte-identical float) or 0 when the font wins the race. Verified mechanism, same defect D-020 ratcheted at 0.026 on macOS: webfont swap reflow — the prose fallbacks (Georgia/Iowan Old Style) don't exist on Linux, fontconfig substitutes DejaVu/Liberation metrics, the swap moves more pixels. Every other Linux number is inside budget (LCP / 2138ms vs 2300; framework 102.0/102; CLS /probe/entry ≈ 0).

**Ruling: Option A — ratchet becomes 0.05, recorded as the Linux measurement of the same tracked defect, not a waiver.** Principle now standing: **a ratchet is a measurement, and a measurement is tied to the platform it was taken on.** When the measuring platform changes, the ratchet re-baselines to an honest measurement on the new platform, then "may only tighten" (D-020) resumes per-platform. 0.026 described a platform CI no longer runs on. Known residual risks, accepted and recorded: headroom above the deterministic value is ~0.0006 (tight is good), and the one-in-five 0-runs mean a regression can hide under a lucky race — a bimodality that exists at any threshold and is eliminated only by the real fix.

**The real fix is human-gated and now scheduled, not just noted:** eliminating the swap reflow (`display: 'optional'` vs tuned size-adjusted fallbacks) is a §6.1 product-behavior/taste choice — it joins the existing font-strategy item (D-020: kerning + CLS, ONE item) on the human's list, and the ticket that implements the chosen strategy MUST tighten this ratchet to ≤0.005 in the same PR. That converts the tracked breach into scheduled work with a measurable exit.

Also ratified from the FE-14 review so far: the explicit shared-packages build step as the sanctioned D-025 alternative; visual.spec.ts's skip retired into a hard throw; the regenerate-baselines job's missing web build caught by CTO-FE diagnostics (ruling-independent fix). CLS-gate red proof satisfied by the three diagnostic runs.

**Forecloses.** Treating a platform re-baseline as precedent for loosening a ratchet on an unchanged platform; shipping the font-strategy fix without tightening this ratchet in the same PR; cross-platform comparison of ratchet values as if they measured the same thing.

## D-025 · 2026-07-27 · Fable · M0-BE-24 accepted: backend CI is real; the D-023 protocol ran end-to-end; serialization over isolation for the test step

**Decision.** M0-BE-24 merged (eutectic-backend develop @ 9e918a5, PR #22). Backend CI now reconstructs the workspace per D-022, runs all 13 migrations against a fresh postgres:16, backs cache/api integration suites with a real redis:7 (never mocked around), and runs build/typecheck/test filtered to backend packages — the rule-9 premium-neutrality guard and the worker suite now run in CI. Green on branch (run 30223716226), on develop (30223925048), and the D-023 superseding dispatch on shared develop (30223955727) closed the lockstep window green.

**The rule-12 gate demonstrably works:** the first run (30222801365) failed `ERR_PNPM_OUTDATED_LOCKFILE` precisely because the PR changed dependencies before the mirror landed — the red-gate evidence and the enforcement proof are the same run.

Rulings from the four-red-run fix chain (51abd44→644476e), recorded so nobody rediscovers them:
1. **pnpm directory filters need braces to pull workspace dependencies**: `--filter "{./eutectic-backend/**}..."` builds @eutectic/contracts before apps/api; the unbraced `**...` form is silently a plain glob. Always sanity-check the "Scope: N of 14" log line.
2. **Test step is serialized** (`--workspace-concurrency=1`) rather than per-suite database isolation: the worker smoke test's drain timeout came from suites sharing one DATABASE_URL concurrently. Serialization costs ~2 min wall clock and removes the whole interference class; per-suite databases are the upgrade path if CI wall-clock ever matters. Raising the timeout was rejected — a rarer flake is worse than a fixed cause.
3. **D-023 amendment (supersedes its foreclosure line):** while a lockstep window is open (mirror landed, domain PR unmerged), `[skip ci]` is permitted on ANY shared commit — every push in the window false-reds for the same structural reason — provided the commit message says so and the superseding dispatch follows the domain merge.
4. **Observation, not yet a defect:** the merge push to backend develop produced no push-triggered run (triggers verified correct; the manual dispatch covered it). If it recurs, it becomes a ticket.

**Forecloses.** Unbraced dependency filters in any workflow; mocking around Redis/Postgres in integration suites; parallel test steps sharing one database without isolation; timeout inflation as a flake fix.

## D-024 · 2026-07-27 · Fable · M0-FE-13 accepted: the local-tokens block is gone; consolidation ratified, plus a known limit of the visual gate

**Decision.** M0-FE-13 merged (eutectic-frontend develop @ 8146082, PR #12; implementer commits d75d0b1 + 6662bff, CTO-FE review with one rejection cycle). apps/web's local-tokens block is deleted whole (globals.css 277→83 lines); `check-token-lint` is inverted — any local-tokens marker anywhere now fails, and px font-size/duration literals are banned unconditionally; gutter.tsx runs on `leading-initial` (§7.4's .85, D-021) and container-relative `@eu-sm:`. Fable-validated: spot-checked the merged tree (no markers, lint retirement text, gutter classes) on top of CTO-FE's independently reproduced battery (11/11 ci-gates at the merge SHA, ratchets untouched at CLS 0.02474/LCP 2146ms, framework 102.0/102 kB).

Ratified from the review:
1. **`@eu-sm:` is the canonical spelling** for the 480px container threshold (not the ticket's `@min-eu-sm:`) — identical compiled rule, and meter.tsx already uses it. One spelling per threshold.
2. **The `sm:`→`@eu-sm:` shift is behavioral and accepted**: a Gutter with no `@container` ancestor stays xs regardless of viewport. That is §7.2's "components use container queries" direction, and it fails safe.
3. **probe-shells-reading is not a coverage gap**: that probe renders shell chrome only (no EntryShell/Gutter); entry-in-shell composition is exactly what /probe/entry snapshots. Complementary, not redundant.
4. **Known limit of the visual gate, recorded:** a real change whose diff ratio is under `maxDiffPixelRatio` 0.002 passes silently, and `--update-snapshots` default "changed" mode never refreshes a passing baseline — FE-13's ~0.0014 gutter change slipped exactly this way until CTO-FE's A/B caught it. Protocol: when a PR *intends* a visual change, baselines are force-regenerated with `--update-snapshots=all` and the old-vs-new diff is confined to the intended region in review. "Changed" mode stays the daily default. FE-14 documents this in the CI gate notes (acceptance line added).

**Forecloses.** Reintroducing a local-tokens block or marker pair in any app; `@min-eu-sm:` as an alternate spelling; treating a passing visual snapshot as proof of pixel-identity for sub-threshold changes.

## D-023 · 2026-07-27 · Fable · The D-022 lockstep window: how a dependency-changing mirror update lands without a false-red on shared develop

**Decision.** First execution of the D-022 lockfile flow (BE-24's pre-approved `@types/node ^22`) surfaced an inherent ordering window: the mirror lockfile must land in eutectic-shared *before* the domain PR can go green, but eutectic-shared's own CI reconstructs with siblings pinned at `develop` — where the domain package.json change hasn't merged yet — so the frozen install on the mirror-landing push *must* fail until the domain PR merges. The failure would be by design, not a defect, and a red run on develop's history is a false alarm.

**Protocol, standing for every dependency change:**
1. Fable verifies the live-root lockfile diff against the approved package.json diff (only the approved dep and its dedupe consequences), syncs via `check-workspace-root.mjs --write`, and lands the mirror commit on shared develop with `[skip ci]`, citing this entry in the commit message.
2. The domain CTO's PR CI (self at PR ref + mirror lockfile) is the run that actually validates the pairing — it must be green before merge, as usual.
3. Immediately after the domain PR merges to its develop, Fable dispatches `workflow_dispatch` on eutectic-shared develop; that run must be green and supersedes the skipped one.

Incidental ruling: pnpm deduped the pre-existing transitive `@types/node@26.1.1` (via `@types/pg`, `graphile-config`, `chrome-launcher`, `jest-worker`, `speedline-core`, `@types/interpret` — all accept any version) down to the workspace's declared 22.20.1. Accepted deliberately: type declarations now match the Node 22 runtime floor instead of leading it by four majors.

**Forecloses.** `[skip ci]` on any shared commit other than a mirror-landing in this protocol; merging a dependency-changing domain PR before its own CI is green against the landed mirror; leaving the post-merge dispatch run unrun.

## D-022 · 2026-07-27 · Fable · M0-SH-05: real CI via workspace reconstruction; the workspace root and the governance record are finally under version control

**Decision.** The pnpm workspace root (package.json, pnpm-workspace.yaml, pnpm-lock.yaml, tsconfig.base.json, turbo.json, .nvmrc) lives one level above the three repos and was tracked by NO git repo — and so were `docs/` (including this file), `board/`, and `CLAUDE.md`. M0-SH-05 fixes both:

1. **`workspace-root/` mirror in eutectic-shared** — byte-exact tracked copies of the six root files, synced by `scripts/check-workspace-root.mjs` (`--write` to sync, bare to verify; skipped in CI where the mirror IS the root, detected via a `.synthesized-from-mirror` marker). Drift fails shared CI. **The lockfile mirror is where CLAUDE.md rule 12 is enforced:** a backend/frontend PR that changes dependencies cannot go green until Fable lands the lockfile change in eutectic-shared first.
2. **CI by workspace reconstruction.** A lone clone cannot `pnpm install` (`workspace:*` deps and lockfile importers span all three repos), so every repo's CI checks out all three as siblings, copies the mirror files up one level, and does a frozen install. Siblings pin `develop`. eutectic-shared's ci.yml is live (push to develop/main + PRs): build (contrast gate), typecheck, test (artefact byte-sync), and generated-file staleness.
3. **Governance record tracked.** `docs/`, `board/`, `CLAUDE.md` are committed to eutectic-shared (Fable-owned repo, Fable-owned files — ownership matches). The live workspace root keeps them as symlinks into the repo working tree, so there is exactly one copy on disk and every future edit lands in a git working tree. The six workspace-root files stay REAL files at the root (pnpm rewrites the lockfile in place; a symlink could be silently replaced) — the mirror + check covers them instead.
4. **`.gitignore` trailing-slash fix** (the D-018 hazard two implementers hit): `node_modules/` matches only real directories, so symlinked node_modules/dist slipped through. Patterns lose the slash in eutectic-shared; BE-24/FE-14 carry the same fix to the other repos.
5. **Node floor declared everywhere:** `.nvmrc` and root `engines` → 22.12 (FE-10's floor; the dev-machine upgrade stays on the human's missing-inputs list).

Companion tickets groomed: **M0-BE-24** (backend ci.yml with Postgres service, migration-up, reconstruction recipe; retires the BE-15 hand-declared Node ambient shims — `@types/node` ^22 dev-only is PRE-APPROVED under rule 12, lockfile lands via the mirror flow) and **M0-FE-14** (frontend ci.yml running the 11 §19 gates on Linux, Linux Playwright baselines, after FE-13).

**Forecloses.** Dependency changes that bypass the lockfile mirror; a repo CI that installs without reconstructing the workspace; trailing-slash directory patterns in any repo's .gitignore; editing docs/board anywhere but the tracked copies.

## D-021 · 2026-07-27 · Fable · M0-SH-13 landed: packages/tokens emits the frozen D-018 consolidation list; apps/web's local-tokens block is now deletable

**Decision.** M0-SH-13 merged (eutectic-shared develop @ 716835c, Fable — shared lane, single-threaded). `packages/tokens` now emits everything D-018 froze: §7.2 breakpoints (480/780/1180, Tailwind defaults cleared), §7.1 shell columns (236/300/720/640) + `shell-grid-3`/`shell-grid-2`/`shell-column`/`shell-column-private`, `--container-eu-sm` 480, §11 shimmer (1.4s, opacity-only keyframes), §11 sheet backdrop (`rgb(22 23 26/.32)`, absolute, never theme-relative), §9.1 tooltip delay 400ms, §13 touch target 44px + the `sheet-backdrop`/`delay-tooltip`/`touch-target`/`block-lh` utilities, and §7.4's **`leading-initial` (0.85)**. New source modules `layout.ts` and `interaction.ts`; `leadingInitial` sits in `type-scale.ts` with the other line-heights. All values reach all three artefacts (tokens.css / theme.ts / tokens.json — `touchTarget` is genuinely native per §13, the rest kept for parity like `measure`). 22/22 tokens tests (7 new, including a no-`var()` check on query-side values and a no-gradient check on the shimmer keyframes); full workspace green.

Rulings made in the ticket:
1. **Query-side values are literals, by necessity — a documented exception to the two-layer `--eu-*`/`var()` naming.** A media or container query condition cannot contain `var()`, so `--breakpoint-*` and `--container-eu-sm` are emitted as literals in a plain `@theme` block with no `--eu-` indirection (dead vars would only invite someone to reference them where they cannot work). A test pins this.
2. **`leading-initial` maps into Tailwind's `--leading-*` namespace**, so the class `leading-initial` compiles natively — gutter.tsx's documented `leading-none` (~4px slack) workaround becomes a one-class change.
3. **`--container-eu-sm` stays prefixed** (not `--container-sm`): Tailwind's default container scale also backs `max-w-*`, which existing call sites read. Same reasoning as FE-05, now permanent.
4. **`block-lh` is emitted from tokens although `1lh` is not token-backed** — it lived inside the block, and the block's deletion contract requires every call site to be a no-op.

Until the frontend deletes its local block, apps/web carries same-valued duplicates of these declarations — harmless (identical values, last-wins `@utility` semantics) and short-lived: the deletion ticket (M0-FE-13) is groomed alongside this entry and dispatched immediately.

**Forecloses.** A `var()`-indirected breakpoint or container threshold; re-declaring any consolidated value locally in an app (D-017's single-block rule now has an empty block to hold); `leading-*` values below 1 other than `leading-initial` without a new D-entry.

## D-020 · 2026-07-27 · Fable · Wave 4 accepted (BE-23, FE-10, FE-12); §14 breaches ratcheted, not waived; the gates are live

**Decision.** BE-23 (eutectic-backend @ 69fed95: free-tier constants now 5/3/4 per capabilities §16 with a spec-citing test; `not_implemented` stubs; SUCCESS_STATUS table deleted in favour of the contract's `successStatus`) and FE-10 + FE-12 (eutectic-frontend @ aae8fe2) all merged and Fable-validated. I reproduced the full `pnpm ci-gates` run green (11 gates) under a Node 22.12 binary; on the machine's stock 22.9.0 the Node-floor gate correctly refuses to run — the refusal message is the design.

**§14 breaches: ratcheted, not waived.** Two measured breaches ship with ratchets that may only tighten; the §14 numbers stand as targets and every run prints the breach loudly under "NOT YET SATISFIED":
1. `/probe` CLS 0.0247 vs 0.02 — webfont swap reflow (`size-adjust` fixes vertical metrics, not advance widths). Ratchet 0.026. The fix is font-strategy work (§6.1/§14) and **joins the kerning question as ONE font-strategy item for the human's weekly note** — both trade bytes against typographic quality, and both are taste.
2. `/` LCP ~2.1s vs 1.8s under Lighthouse's simulated slow-4G — the throttling model over the 102KB framework baseline + 65KB fonts; zero app-authored JS to cut. Ratchet 2300ms; re-measure when the real feed lands (M1).
**Promotion ruling:** D-015 item 7 demanded the CLS check exist and run before develop→main; it does. A *ratcheted, tracked* breach does not block promotion — an untracked or worsening one does.

Ratified without amendment: FE-12's static `data-theme="light"` until a shared theme seam exists; admin font-asset duplication as tracked debt (next/font requires in-app files); exactly eight admin routes (no `/`); minimal next.config. FE-10's Lighthouse-13 budget enforcement in a repo-owned `lighthouse-budgets.json` (CLI `--budget-path` verified silently dropped); `EUTECTIC_TOKENS_JSON` test seam; per-route client-component ceiling 4 with total ratchet 6; premium-neutrality XFAIL that already hard-fails on entitlement branches/badges/ordering hints. BE-23's review calls: drift test converted to bind `successStatus` against an independent raw-YAML parse (non-circular); no 501 in `STATUS_TO_CODE` (the contract declares none; the map coerces framework statuses only).

**Security line for the future admin wiring (BE-21/admin contract ticket acceptance):** Next serializes the blocked page's RSC flight payload even when a guard doesn't render children — the real session guard must short-circuit with `redirect()`, never conditionally render, or unauthenticated responses carry page data. FE-12's scaffold is inert today (static copy only).

Known gaps carried into SH-05: ci.yml has never executed (child-clone `workspace:*` install, D-009); Linux Playwright baselines pending (skips loudly); root `.gitignore` symlink pattern. Incidental: `/favicon.ico` 404 — one line in any future web ticket.

**Forecloses.** Waiving a §14 number instead of ratcheting; a ratchet that loosens; admin guards that conditionally render instead of redirecting.

## D-019 · 2026-07-27 · Fable · Backend wave 3 accepted (BE-15/16/18/19/20/22); FREE_PLAN_DEFAULTS rejected as delivered; contract gaps closed (M0-SH-12); FE wave 3 closed with FE-07

**Decision.** Backend wave 3 merged (eutectic-backend develop @ 05576b0, migrations 0000–0012) and Fable-validated on a clean checkout: db 110 / api 66 / worker 7 / events 14 / cache 25, all green. Frontend wave 3 closed with FE-07 (eutectic-frontend develop @ c2b48d8, 50 stories, additions-only, framework baseline now 102KB — the D-012 ratchet is a ceiling and this moves DOWN; new ceiling 102KB).

**REJECTED, one item: `FREE_PLAN_DEFAULTS` as delivered (1 post/day, 1 round, 1 agent response).** Copied from a BE-02 test fixture; capabilities.md §16 says the free tier is **5 posts/day, 3 rounds/chapter, up to 4 agents/thread**. Correct values: `maxPostsPerDay: 5, maxRounds: 3, maxAgentResponses: 4`, booleans/residencies unchanged. Fix ticket M0-BE-23 (with a test asserting the constants against §16's numbers). This is exactly why defaults get validated against the product spec, not fixtures.

Backend rulings ratified:
1. **BE-16 idempotency semantics:** contract beat ticket text — same-key-different-body is **409 `idempotency_conflict`** (my 422 in the ticket was wrong; openapi.yaml said 409 all along, rule 1 held). Race loser waits bounded then 429 + Retry-After (a 409 would teach clients to mint fresh keys and double-post). **Only 2xx responses are recorded**; everything else releases the claim. Body stored as text for byte-identical replay; PK `(scope, idempotency_key)` with `scope='anonymous'` until BE-17; 60s stale-claim takeover. Known seam: the claim row commits outside the handler's transaction — **the first real mutation ticket must pull it into its transaction** (goes in that ticket's acceptance).
2. **BE-19:** `packages/cache` as a separate package (dependency-graph policeability; `@eutectic/db` may never import it); rate limiter **fails open** — rule 6's money gate stays fail-closed in Postgres and is untouched; ioredis; 250/1000ms timeouts.
3. **BE-18:** explicit `bustEntitlement` (no pubsub) — the Dodo webhook writer MUST call it, staleness bounded by 60s TTL; user-scoped cache key; ISO-string dates in the cached shape; rule-9 guard markers `rank|feed|projection` (extend-only, planted-violation self-test).
4. **BE-20:** trace context rides a reserved `_trace` payload field injected by `withJob`, stripped before typed handlers — `_trace` is now a **reserved payload key product-wide**; `@opentelemetry/api` in packages/db (interface-only); console exporter default, exporter injectable; `/readyz` degrades (not fails) on Redis per D-001.
5. **BE-15 restated rulings** (stub policy, request-id sanitisation, strict Accept, FSTDEP024, no `@types/node` until SH-05) stand as reported.

**M0-SH-12** (eutectic-shared develop @ f5e5515, Fable): `ErrorCode` gains `not_implemented`; the generator emits `RouteDescriptor.successStatus` (lowest declared 2xx/3xx, throws when absent) — apps/api's hand-maintained `SUCCESS_STATUS` table dies in a small BE cleanup alongside BE-23's stub-code switch to `not_implemented`.

Environment findings (FE-07): dev machine Node 22.9.0 < Storybook's 22.12 floor — **human's machine, on the missing-inputs list**; FE-10 CI pins Node ≥22.12. The "malformed apps/api package.json" report was transient mid-merge state — parses clean at 05576b0; a root `pnpm install` is hygienic again.

Debt registered: `idempotency_responses` retention sweep (grooms with D-016 item 6d, the `event_idempotency` retention job).

**Forecloses.** Recording non-2xx idempotent responses; ranking code importing entitlements (guard is live); `_trace` as a user payload key; framework baseline above 102KB without a D-entry.

## D-018 · 2026-07-27 · Fable · FE-05/06/08/09 accepted; sideEffects declared in shared packages (M0-SH-11); consolidation-ticket scope frozen

**Decision.** Four wave-3 frontend tickets merged (eutectic-frontend develop @ a26a3de) and Fable-validated: 13 routes, `/probe/api` 14.3KB and `/probe/primitives` 2.5KB app-authored (both under D-012 ceilings), everything else zero; six real `'use client'` files, all justified leaves; no markdown engine or `dangerouslySetInnerHTML` anywhere (grep hits are doc comments); font gate 77,812/102,400; 17/17 web tests. FE-07 (Storybook) still in flight.

Ratified implementer/CTO judgment calls:
1. **FE-09 theme:** vocabulary `light|dark|system`; `system` clears the cookie rather than storing a value; Critical-CH covers the first-request gap instead of a CSS `prefers-color-scheme` fallback; `resolveTheme()` is the single seam for M1 profile persistence; open-redirect guard on the POST.
2. **FE-06 prose rendering:** `strong` renders weight 500 (600 stays names-only per §6.3); link schemes allow-listed (`/`, `#`, `http`, `https`) — everything else, including `javascript:`, degrades to plain text; unknown span/block kinds render their text and are never dropped (grow-only contract, D-017); bylines unlinked until §9.7 Nav. **`CiteRef` is a temporary LOCAL type** mirroring `diary_refs.ref_type` — replaced when the Diary contract lands (tracked for the diary contract ticket).
3. **FE-05:** UA `dialog:modal { inset: 0 }` needed explicit insets for side sheets (found by measurement, kept); Skeleton heights are token names + `1lh`; Tooltip is CSS-only RSC with content always in the a11y tree.
4. **FE-08:** dev base URL has no `/v1` (Prism mounts at root — asserted in a test); write-free contract-freshness gate (regenerates in memory, byte-compares); QueryClientProvider mounted only in the `/probe/api` subtree until real data routes exist.

**M0-SH-11** (eutectic-shared develop @ 4a6322e, Fable): `sideEffects` declared in all three shared packages — `false` for core and contracts (pure), `["**/*.css"]` for tokens so bundlers can never drop an import-for-effect of `tokens.css`. Removes the per-consumer `optimizePackageImports` workaround (FE-08's app-side knob stays; harmless).

**Consolidation-ticket scope, frozen here** (the D-015 item 3 sweep, to run in the shared lane before develop→main): §7.2 breakpoints + §7.1 column constants; z/dur/measure locals (D-010/D-012); FE-05's literals (`--container-eu-sm` 480, shimmer 1.4s opacity-only, sheet backdrop, tooltip delay 400, touch-target 44); a **leading-initial (.85)** token for §7.4's gutter initial (currently `leading-none` + documented ~4px slack); a container-threshold emission from packages/tokens. Root `.gitignore` trailing-slash/symlink hazard is confirmed in SH-05 scope — two implementers hit it.

**Forecloses.** Module-scope side effects in core/contracts (the declaration is now a promise); new additions to the consolidation list without a D-entry.

## D-017 · 2026-07-27 · Fable · Structured prose is a contract shape (M0-SH-10); FE-05 spec literals join the single local-tokens block

**Decision.** FE-06 hit its stop-condition correctly: FE §9.2's "structured token array" had no type anywhere. Ruled: it is a **wire shape, owned by contracts** (eutectic-shared develop @ 7760b5a), not a rendering helper in core — the API returns it, the server is its only writer, no client ever parses text into structure.

Shape (grow-only): `ProseSpan` = flat inline unit, `kind: text|code|em|strong|link` + `text` (+ `href` for links) — **spans never nest**; `ProseBlock` = `ProseParagraph {kind:'paragraph', spans[]}` | `ProseCodeBlock {kind:'code', text, lang?}`. `Contribution.body` (response) becomes `ProseBlock[] | null`; `ContributionCreate.body` stays plain text ≤4000 — humans type text, the server converts once at write time. Flatness is deliberate: no em-inside-link, no nesting depth to fuzz, renderers stay a single map. OpenAPI `discriminator` dropped after openapi-typescript mangled the kind literals to schema names — the enums already discriminate the union.

Consequences: backend's eventual Contribution serializer converts stored text → ProseBlock[] at write time (a BE ticket when contributions get a real handler); BE-15's stub payloads must match the new generated types (CTO-BE notified — stub-level impact only).

Also ratified: **FE-05's four spec literals** the tokens package doesn't emit (sheet backdrop, skeleton shimmer 1.4s, tooltip delay 400ms, Meter's container threshold) append to the ONE existing local-tokens block in apps/web with spec citations — CTO-FE's ruling stands; it remains a single debt consolidated in one sweep (D-015 item 3). No fourth block, ever.

**Forecloses.** A markdown engine anywhere; clients parsing prose; nested spans without a D-entry; a second local-tokens block in apps/web.

## D-016 · 2026-07-27 · Fable · Backend batch 2 accepted (BE-08…BE-14); events idempotency redesigned for partitioning; M0 backend substrate complete

**Decision.** M0-BE-08 … M0-BE-14 merged (eutectic-backend develop @ 66a640c). Fable re-verified independently: migrations 0000–0011 contiguous, 56 tables, db 96/96 · events 14/14 · worker 3/3 on a clean checkout, Bell-island FKs resolve to `users` only, `feed_entries` carries no entitlement column (rule 9 structurally safe), idempotency trigger present on `events`.

1. **BE-12 (the flagged risk): SD §4's verbatim `idempotency_key UNIQUE` is unimplementable** on a range-partitioned table — Postgres requires the partition key in every unique constraint. Ratified design: `events` PK becomes `(id, occurred_at)`; global uniqueness enforced by non-partitioned `event_idempotency` (PK = bare key), populated by an AFTER INSERT trigger; soft pointer (no FK) so 13-month partition DETACH survives; **no DEFAULT partition — loud failure preferred**; monthly partitions pre-created through 2026-09 plus idempotent `events_ensure_partition(date)`. Rejected alternatives: composite unique (invariant in name only), key-in-partition-key (destroys time partitioning), writer-only dedupe (convention, not constraint). SD §4 amended in this same change (rule 13). Cross-month duplicate verified to raise 23505.
2. **BE-09** rebased onto develop rather than leaving a contiguity gap, and added three read-path indexes (`grants_user_id_idx`, `findings_product_id_idx`, `finding_events_finding_id_created_at_idx`) — ratified per the batch-1 `diary_refs_diary_id_idx` precedent (D-013).
3. **BE-11** ledger append-only is service-layer per D-013; a DB-level backstop (REVOKE UPDATE/DELETE or trigger) is deferred to an optional follow-up ticket, pre-M1 hardening.
4. **BE-13** payload typing is minimal and grow-only (44/48 events empty payloads, 4 state-change shapes); `subject_type` = singular table name of the row created/changed; unkeyed writes skip the savepoint; the hand-declared `node-builtins.d.ts` (D-010 pattern) dies at SH-05.
5. **BE-14** job registry seeded with exactly `projection.contribution` and `partition.ensure_ahead` under the rule **"a name lands when its handler lands"**, enforced at compile time in both packages/db and apps/worker; `withJob` opts surface limited to `jobKey`/`runAt`/`schema`; graphile-worker owns its own `pg` pool (postgres.js pool handed to handlers as context) — "wired to packages/db pool" means same database, same `requireDatabaseUrl()` contract, not same pool object; `graphile-worker` in apps/worker's manifest is D-001's queue declared where used, not a rule-12 event.
6. **Debt tickets opened, not fixed silently:** (a) test-helper `${JSON.stringify(payload)}::jsonb` double-encode fix → `sql.json(...)`; (b) **scheduler deployable for `partition.ensure_ahead` — runway ends 2026-09-30 and INSERTs then fail hard; this is an M1 slot, not M2**; (c) real `projection.contribution` handler; (d) `event_idempotency` retention job; (e) optional ledger backstop.
7. CTO-Backend deleted its merged remote branch `m0-be-14-withjob-worker` — predates the D-015 pruning rule (batch was in flight when it was written); content preserved in merge commits. The D-015 rule now binds both CTOs; no further action.

**Forecloses.** A DEFAULT partition on `events`; job-registry names without handlers; entitlement columns on `feed_entries`.

## D-015 · 2026-07-27 · Fable · FE-02/03/04 accepted; kerning dropped for the font budget; branch pruning is Fable-only

**Decision.** M0-FE-02/03/04 merged (eutectic-frontend develop @ a9f392f) and Fable-validated: 9 routes all at the ratcheted 103KB framework baseline with ZERO app-authored client JS, fonts 77.8KB/100KB gate green, primitives fixture exercising every state. Rulings on the CTO's escalations:

1. **Kerning dropped from all three subset fonts** — with `kern` the trio is 116KB vs the 100KB budget. Ratified per D-010's gate-as-arbiter principle. Flagged as a TASTE item for the human's weekly note: restoring Newsreader-only kern (~100–110KB) needs a budget raise, which is theirs to grant. Revisit at M1 typography polish.
2. `--eu-font-*` overridden once in apps/web to next/font's hashed family vars — ratified; tokens stay the only read surface for consumers.
3. §7.2 breakpoints and §7.1 column constants live locally in apps/web behind `@theme`/`@utility` — third local-tokens debt (after D-010 z/dur, D-012 measure). All migrate in one tokens ticket; groomed into SH-05's prep or a micro SH ticket.
4. Plain `<a>` instead of `next/link` in shells — ratified: next/link's ~3KB client runtime would break the ratchet for zero M0 value. Client-side transitions are the §9.7 Nav ticket's explicit scope.
5. Button's internal Spinner may use radius.full — it is a glyph, not a component; Chip keeps component-level exclusivity. The future radius CI gate encodes this exemption.
6. SH-05 scope grows: Tailwind default-animation namespace reset + off-token grep; root .gitignore worktree fix.
7. A real-browser CLS trace (Playwright) on /probe is REQUIRED before the first develop→main promotion — lands with M0-FE-07/FE-10 gates.
8. **Process: deleting remote branches is Fable-only from now on.** The CTO pruned its merged ticket branches — content safe in merge commits, but destructive ops on shared remotes belong to one role. CTOs leave branches; Fable prunes at promotion time.

**Forecloses.** Client-side navigation entering apps/web outside the Nav ticket; any non-Fable remote-branch deletion; a fourth local-tokens debt without a consolidation ticket.

## D-014 · 2026-07-26 · Fable · packages/core landed (SH-04); zod 4 approved; shared lane M0 substrate complete

**Decision.** M0-SH-09 (PR #3) and M0-SH-04 (PR #4) merged to eutectic-shared develop @ 0e97fe0, both Fable-reviewed. zod ^4 is the approved validation dependency workspace-wide (spec-named in FE §3; rule-12 approval recorded here). Ratified SH-04 judgment calls: `relativeTime` uses `Intl.RelativeTimeFormat.formatToParts` for locale numerals but emits FE §15's literal compact copy ("2h", "3d", absolute past 7d) — RTF's own "ago" text is deliberately discarded; `now` is always an explicit parameter, never an internal `Date.now()`; `workspace:*` references to sibling shared packages are not "new dependencies" under rule 12. Known gap carried forward: implementer worktrees sit outside the pnpm workspace globs, so package-local verification with explicit tool paths is the accepted worktree pattern until M0-SH-05 wires CI (which runs per-repo and makes this moot).

**Forecloses.** A second validation library; relative-time copy that drifts from §15; hidden clock reads in pure functions.

## D-013 · 2026-07-26 · Fable · Schema wave batch 1 accepted; merge-order rule; DDL conventions ratified

**Decision.** M0-BE-02…07 (migrations 0001–0006) merged and validated: 45/45 tests on develop @ 7b2380b, dev DB migrated through 0006, 25 tables, seams verified. Fable-ratified the CTO-Backend conventions applied uniformly across the wave — these now bind batch 2 and every future migration:
- `updated_at` only where rows mutate in place; immutable rows (sessions, diaries, diary_refs, addenda) omit it.
- SD §5's explicit composite PKs stand — no surrogate `id` where the spec names the key.
- No CHECK constraints beyond those SD §5 writes explicitly; enum-like text columns get comments, validity lives in the service layer (extends D-011's ink reasoning).
- Anonymous SD indexes get deterministic names; FK ON DELETE defaults to RESTRICT unless SD writes CASCADE.
- **Operational rule: PRs merge in migration-number order** — develop's contiguity gate (numbers unique, contiguous, ascending) enforces it. Implementation parallelises; merges serialise.

Corrections from batch-1 findings: M0-BE-05's DEPENDS ON gains M0-BE-04 (threads.post_id → posts; CTO held the ticket correctly); SD §8's pg_trgm index on tags.slug had no owning ticket → assigned to M0-BE-08/0007. Remote ticket branches left on origin; pruning deferred (harmless).

**Forecloses.** Out-of-order migration merges; surrogate keys over spec-named composite PKs; DB-level enums for service-layer vocabularies.

## D-012 · 2026-07-26 · Fable · FE §14 JS budgets count app-authored JS; framework baseline ratcheted at 103KB; M0-FE-01 rulings

**Decision.** M0-FE-01's measurement: a zero-client-component RSC page on Next 15.5 ships **103KB gz** first-load — §14's "React + Next runtime ~45KB" indication was stale, and `/thread/[id]`'s 95KB *total* ceiling sat below the framework floor (impossible as written). Same spec-vs-measurement shape as D-010, no invariant, reversible → Fable's call. §14 amended: budgets now count **app-authored JS** (total minus framework baseline) — `/` ≤ 65KB, `/thread/[id]` ≤ 40KB — and the framework baseline is tracked and ratcheted in CI (M0-SH-05): a PR may not raise it; a framework upgrade that does needs a DECISIONS entry. Discipline intent preserved: still no room for a fourth library.

Rulings on M0-FE-01 review escalations:
- `@utility measure { max-inline-size: 64ch }` in apps/web blessed locally (same shape as D-010's z/dur ruling). A `measure` token lands in `packages/tokens` at the next tokens-touching shared ticket; the local utility then dies (deletion comment in place).
- Tailwind's default palette still *permits* off-token utilities even though the tokens `@theme` is wired. A `--color-*: initial`-style reset in the tokens package plus a CI grep gate → folded into M0-SH-05 scope.
- Theme seam accepted: `theme` cookie → `Sec-CH-Prefers-Color-Scheme` → light, all server-side; cookie is the documented stand-in until M0-FE-09.
- Root `turbo.json` build.outputs gains `.next/**` (workspace glue, Fable-owned) so web builds cache.

**Forecloses.** Silent framework-baseline growth; any total-first-load budget arithmetic that ignores the measured runtime.

## D-011 · 2026-07-26 · Fable · `agents.ink` stores the token name, never hex; M0 backend wave groomed

**Decision.** system-design §5 had `agents.ink text -- hex`, contradicting frontend-spec §5.2 ("the API sends `agent.ink` as a token name, never a hex") and the merged contract, which already types ink as a name enum. SD §5 comment amended: ink is the token name (`bricklayer`…`neutral`). New inks are added in `packages/tokens` first; a DB CHECK is deliberately omitted (adding an agent must not need a migration) — validity is enforced in the service layer against the tokens package.

Also in this grooming pass: migration tickets M0-BE-02…12 carry a shared numbering protocol (drizzle-kit journals its own sequence and will re-emit `0000_*`; generated files are renumbered to the ticket's assigned NNNN before commit — surfaced by CTO-Backend in M0-BE-01 review). Auth `sessions` table shape (absent from SD §5) is specified in ticket M0-BE-02: opaque token hash, not JWT, per SD §11's httpOnly-cookie session.

**Forecloses.** Hex values in any API payload or DB row for agent identity.

## D-010 · 2026-07-26 · Fable · `bricklayer.light` = `#A6640F`; token-package review rulings

**Decision.** frontend-spec §5.2's original `bricklayer.light` `#A9660F` measured **4.4491:1** against `paper` in light theme — failing §13's own WCAG AA 4.5:1 requirement, caught by M0-SH-02's contrast gate. Amended to `#A6640F` (4.59:1, one perceptual step, margin retained). The spec contradiction made this Fable's call, not a §6 escalation: no invariant touched, reversible, visually indistinguishable.

Rulings on M0-SH-02 implementation judgments, accepted as precedent:
- `--eu-` prefix on raw CSS custom properties; `@theme inline` maps them into Tailwind namespaces (theme flip = cascade change, never rebuild).
- `@utility` output for `z`/`dur` scales (Tailwind v4 lacks those namespaces; keeps rule 2 satisfiable without arbitrary values).
- `generated/` artefacts are committed and staleness-checked by a byte-for-byte sync test; the contrast gate reads `tokens.json` (checks what ships).
- `@types/node` NOT added; hand-declared six-function surface in `node-builtins.d.ts`. Revisit at M0-SH-05 — approving `@types/node` workspace-wide there is expected.
- Process: concurrent implementers in one repo get **a git worktree per ticket** from now on (two agents shared one checkout this round; harmless but fragile).

**Forecloses.** Any ink value that fails AA against paper in either theme — the gate is now the arbiter, spec follows measurement.

## D-009 · 2026-07-26 · Human · GitHub remotes exist: `Sumit-07/eutectic-{shared,backend,frontend}`

**Decision.** The human created all three repos (public, empty) under the personal account `Sumit-07` — no org yet, may move later. This retires D-004's "no remotes" clause: from now on the real PR flow applies (branch → PR → owning role reviews and merges to `develop` → Fable promotes `develop` → `main`). `gh` CLI is authorized. The older private repo `Sumit-07/eutectic` is not ours to touch.

**Why.** Human's action mid-bootstrap.

**Forecloses.** Local-only merges once remotes are wired; every merge from here goes through a PR.

## D-008 · 2026-07-26 · Human · Staffing: agent-swarm, 4–5-engineer schedule governs

**Decision.** Team size is "as many agents as the CTOs can spawn in parallel." The 4–5-engineer week plan (implementation-plan §3) is the governing schedule. The cap of **max 3 concurrent implementers per CTO** and single-threaded lanes (implementation-plan §8) still hold — they exist for correctness, not headcount.

**Why.** Human's call; human keeps the books and credits.

**Forecloses.** Nothing.

## D-007 · 2026-07-26 · Human · Model providers: OpenAI, Anthropic, OpenRouter

**Decision.** `packages/inference` routes across exactly three providers: OpenAI, Anthropic, OpenRouter. API keys are supplied by the human as env vars; nothing else is provisioned. Startup credits are the human's job.

**Why.** Human's call. Three providers also serves capabilities §8 ("different base models where possible" against mode collapse).

**Forecloses.** Direct Google/other SDK integrations for now — reachable via OpenRouter if needed.

## D-006 · 2026-07-26 · Human+Fable · Local-first: no hosting accounts until further notice

**Decision.** Everything runs locally: Postgres and Redis via Docker Compose, api/worker/web as local processes. No Neon/Supabase, Upstash, Fly/Railway, Vercel, or R2 accounts yet — the D-001 or-choices stay open. Deploy-dependent tickets (M0-SH-06 preview envs, M0-SH-08 secrets mgmt beyond `.env`) are deferred, not deleted. **M0 exit criteria amended:** "a deployed skeleton" → "a locally running skeleton"; the CI gates run in GitHub Actions once remotes exist, as local scripts until then.

**Why.** Human's call: "your first job is to make everything work locally."

**Still needed from human (not blocking the first five tickets):** GitHub OAuth app credentials before M0-BE-17 (auth); model API keys before M1-BE-01 (inference).

**Forecloses.** Nothing — SD §14's no-proprietary-primitive rule means local ↔ hosted is a config change.

## D-005 · 2026-07-26 · Human · Native stays (Option B); PWA quality comes first

**Decision.** The Expo native app remains in scope per implementation-plan (M0-NA, M1-NA) and CLAUDE.md's CTO-Native split at M5. Priority order within frontend: **web + PWA polished first** — installability, offline shell, Web Push — before native tickets are picked up in any milestone. system-design §0 amended in this change.

**Why.** Human's call, resolving the SD §0 ("no native app") vs implementation-plan conflict flagged at bootstrap.

**Forecloses.** Cutting native from the plan without a new decision; starting NA tickets in a milestone whose PWA acceptance isn't met.

## D-004 · 2026-07-26 · Human+Fable · Repo topology: three repos in one local pnpm workspace

**Decision.** Supersedes the monorepo line of D-001 and operating-model §3 (amended in this change). Human chose split repos: `eutectic-backend`, `eutectic-frontend`, and invited more if needed. Fable adds **`eutectic-shared`** because contracts, tokens, and core are consumed by both sides and must merge before either (OM §4).

```
Staff-Room-Development/          ← workspace root: pnpm-workspace.yaml, turbo.json,
  CLAUDE.md  docs/  board/          process layer (moves into eutectic-shared at push time)
  eutectic-shared/     (git)     packages/ contracts  tokens  core        — Fable
  eutectic-backend/    (git)     apps/ api  worker · packages/ db  inference  agents  events — CTO-BE
  eutectic-frontend/   (git)     apps/ web  admin  native                 — CTO-FE
```

Each repo has its own git history (`main` + `develop`), its own CODEOWNERS. The parent directory is **not** a git repo; it carries only the pnpm workspace glue so local dev keeps monorepo ergonomics. No GitHub org/remotes yet (human buys later); until then "PR" = branch reviewed by the owning role and merged to `develop` locally; Fable promotes `develop` → `main`.

**Why.** Human's explicit call. The OM §3 warning (atomic contract+consumer changes) is mitigated, not refuted: contract-first already forces shared to merge before consumers, so cross-repo atomicity is only lost where process was already forbidding it.

**Forecloses.** Single-PR changes spanning contract and consumers. A shared merge now requires a version-note in the shared repo's log that consumer repos reference.

## D-003 · 2026-07-26 · Fable · Full ticket specs live in `board/tickets.md`

**Decision.** Board cards (`board/index.html`) stay compact — id, title, state, lane, owner, flags. The full §8-format ticket (acceptance criteria, dependencies, model tier) for every open ticket lives in `board/tickets.md`, one section per ticket, keyed by id.

**Why.** CLAUDE.md §8 defines a ticket format richer than a board card can carry, but names no home for it. Implementers need one file to read. Until the monorepo exists (M0-SH-01 moves all of this into the repo), `board/` is the only process surface we have.

**Forecloses.** Nothing. When M0-SH-01 lands, tickets may move to GitHub issues; this file then records that migration.

## D-002 · 2026-07-26 · Fable · Spec docs renamed to canonical names

**Decision.** The six delivered spec documents were renamed to the names CLAUDE.md §1 and operating-model §3 reference: `capabilities.md`, `implementation-plan.md`, `system-design.md`, `frontend-spec.md`, `operating-model.md`, `budget.md` (dropping the `staff-room-` / `eutectic-` prefixes). Content untouched.

**Why.** Every session ritual and cross-reference uses the canonical names. Two naming schemes for one source of truth guarantees a future agent reads the wrong thing or nothing.

**Forecloses.** Nothing; pure rename. Note: internal cross-references inside the docs (e.g. "companion to `staff-room-capabilities.md`") still use old names — fix opportunistically in the next PR touching each doc, per rule 13.

## D-001 · 2026-07-26 · Fable · Stack, as fixed by system-design §0 and §14

Recorded here so the choice is citable without re-deriving it. Source: `system-design.md` §0, §2, §3, §14.

| Concern | Choice | Constraint that holds it |
|---|---|---|
| Language | TypeScript everywhere | one team, one type system across contract/client/server |
| Monorepo | pnpm + Turborepo; `apps/` web·native·admin·api·worker, `packages/` contracts·tokens·core·db·inference·agents·events | OM §3; two repos would break atomic contract changes |
| Web / admin | Next.js 15+ App Router, React 19, RSC-default, Tailwind v4 consuming `@theme` from `packages/tokens` | FE §4; web never touches Postgres |
| API | Fastify, OpenAPI-bound routes, versioned `Accept` header | SD §2 |
| Contract | `packages/contracts/openapi.yaml`, hand-authored, codegen client + server types; Prism mock for frontend | contract-first, OM §4 |
| DB | Postgres (Neon **or** Supabase — pending human's hosting answer), Drizzle ORM | only OSS extensions; portable by construction |
| Queue | **In Postgres** — `graphile-worker`, transactional enqueue | SD §3: the single most important reliability decision; Redis is never the queue |
| Cache / counters / rate limit | Redis (Upstash), lossy-tolerant only | failure degrades latency, never correctness |
| Objects | Cloudflare R2 (S3-compatible) | cold transcripts |
| api/worker hosting | Fly.io **or** Railway — pending human's hosting answer | plain Docker, no platform runtime APIs |
| web/admin hosting | Vercel | no Vercel-only primitives in the API layer |
| Payments | Dodo Payments (merchant of record) | SD §0 |
| Fonts | Newsreader / Instrument Sans / Commit Mono, self-hosted, ≤100KB | FE §6.1 |
| Governing rule | **No proprietary primitive on any critical path** — everything swappable in a week | SD §14 |

**Open inside this decision** (not blocking M0-SH-01, blocking deploy tickets): Neon vs Supabase; Fly vs Railway. Both are on the human's input list.

**Forecloses.** Redis-as-queue; separate frontend/backend repos; any state-management, chart, animation, date, or general-utility dependency (CLAUDE.md rule 12).
