# Eutectic — Development Operating Model

*How the work gets planned, built, reviewed and shipped. Companion to the capabilities, system design, frontend spec and budget documents.*

---

## 1. The org

| Role | Model | Does | Never does |
|---|---|---|---|
| **You** | human | Money. Safety design. Product invariants. Precedent-setting calls. Writes the six agent personas. | Day-to-day review |
| **Fable** — founder delegate | Opus | Owns backlog, board, specs, contract, tokens, acceptance, promotion to production | Implementation |
| **CTO-Backend** | Opus | api, worker, scheduler, db, migrations, infra, MCP gateway | Frontend, contract changes |
| **CTO-Frontend** | Opus | web, admin, native (until split) | Backend, contract changes |
| **Implementers** | Opus or Sonnet | Ticketed work under a CTO | Merge, spec changes, cross-domain edits |

**Split native off as CTO-Native around phase 5.** Web plus Expo plus admin is too much surface for one owner once the native app has real feature parity.

### Model selection rule

| Work | Model |
|---|---|
| Well-specified mechanical work — a component with exact tokens, a CRUD endpoint from the contract | Sonnet |
| Judgment work — agent routing algorithm, quality-gate evals, Bell's circuit breaker, cost controls, anything touching a product invariant | Opus |
| Review | **Always ≥ the implementer's model.** Never Sonnet reviewing Opus. |

### What you do not delegate

Write the six agent personas yourself, and write the first version of the quality-gate eval set yourself. That is taste, taste is the product, and it is the one thing that cannot be recovered later by better engineering. Everything else is delegable.

---

## 2. Ownership map

| Asset | Owner | Change rule |
|---|---|---|
| `packages/contracts/openapi.yaml` | **Fable** | Contract-first. Both CTOs acknowledge before implementation starts. |
| `packages/tokens` | **Fable** | Same. A token change is a design decision. |
| `packages/core` | Fable | Either CTO may PR; Fable merges. |
| `apps/api`, `apps/worker`, `packages/db` | CTO-Backend | |
| `apps/web`, `apps/admin` | CTO-Frontend | |
| `apps/native` | CTO-Frontend → CTO-Native at p5 | |
| Migrations | CTO-Backend | §8 rules apply |
| Infra, CI config, secrets | CTO-Backend | Cost changes escalate to you |
| The four spec docs | **Fable** | Updated in the same PR as the change that altered them |
| `DECISIONS.md` | Fable | Append-only ADR log |
| Agent personas, eval set | **You** | |

Enforced by `CODEOWNERS`. A PR touching a file outside the author's domain cannot merge without the owner's approval.

---

## 3. One repo, two domains

```
<workspace root>/                ← pnpm-workspace.yaml, turbo.json; NOT a git repo
  CLAUDE.md  docs/  board/         process layer (moves into eutectic-shared at push time)
  eutectic-shared/     (git)       packages/ contracts  tokens  core            — Fable
  eutectic-backend/    (git)       apps/ api  worker · packages/ db  inference  agents  events — CTO-BE
  eutectic-frontend/   (git)       apps/ web  admin  native                     — CTO-FE
```

*(Amended per D-004: the human chose split repos over the original monorepo. Original rationale — atomic contract+consumer changes — is preserved by discipline instead of topology: contract-first (§4) already forces `eutectic-shared` to merge before either consumer starts. Each repo carries `main` + `develop` and its own CODEOWNERS; until GitHub remotes exist, "PR" = locally reviewed branch merged to `develop` by the owning role, and Fable promotes `develop` → `main`.)*

`CLAUDE.md` is load-bearing: it tells every fresh agent session where the specs are, which files it may touch, the banned patterns, and the definition of done. Agents work from files, never from remembered conversation.

---

## 4. The contract-first rule

The most important process rule in this document.

**No implementation ticket starts until the contract it depends on is merged.**

```
1. Ticket needs a new/changed endpoint
2. Fable writes the OpenAPI change → PR
3. Both CTOs acknowledge (are the shapes right, is anything missing)
4. Merge → client and server types regenerate
5. Now both sides implement in parallel, against a frozen shape
6. Frontend develops against a Prism mock until the backend lands
```

This eliminates the entire class of "the API returns something different from what the UI expected," which is otherwise 60% of what a founder-delegate would spend their time adjudicating.

Same rule for tokens: a new agent ink, a new type size, a new spacing value — Fable merges it first, both sides consume it.

---

## 5. Lifecycle

```
Backlog → To-do → In-Progress → In-Review → Validation → Done
                       ↓             ↓            ↓
                    Blocked    Needs your call
```

| Stage | Who | Exit condition |
|---|---|---|
| **To-do** | Fable | Ticket has spec ref, acceptance criteria, phase tag, shared-package flag |
| **In-Progress** | CTO → implementer | Branch pushed, CI green |
| **In-Review** | CTO | CTO reviews, all gates pass, merged to `develop` |
| **Validation** | Fable | Preview deploy checked against acceptance criteria only |
| **Done** | Fable | Promoted to `main`, deployed, spec/ADR updated if anything changed |
| **Blocked** | anyone | States what unblocks it and who owns that |
| **Needs your call** | Fable | Has a written conflict summary with a worked example |

### Promotion, not a second push

```
feature branch → PR → CI gates → CTO merge → develop → preview deploy
   → Fable validates → promote to main → production
```

Fable never re-pushes code. Fable promotes an environment. If validation fails, the card goes back to In-Progress with a note — it does not get fixed by Fable.

---

## 6. Board

Simple HTML, one file, served from the repo. Two swimlane axes.

- **Rows:** Frontend · Backend · Shared (contract, tokens, core) · Infra
- **Columns:** the six lifecycle states
- **Card tags:** phase (`p0`–`p9`) · spec ref (`FE §9.3`, `SD §7`) · capability (`validate`, `diaries`, `bell`) · `shared` if it touches a shared package · `risk` if it touches safety or an invariant

A **Shared** lane matters: it makes visible the work that neither CTO owns and that everything else waits on. That lane is single-threaded by rule (§7).

Card front: title, phase, spec ref, owner, age in state.
Card back: acceptance criteria, dependencies, the PR link.

**Age-in-state is the metric to watch.** Anything over three days in Blocked or Needs-your-call is the real cost of the whole system.

---

## 7. Parallelism rules

Where agent teams actually break.

| Rule | Why |
|---|---|
| **Shared packages are single-threaded.** One agent touches `contracts`, `tokens` or `core` at a time. | Merge conflicts in the contract poison both domains at once |
| Parallelise across **modules**, not across **layers of one feature** | Two agents on the same feature's API and UI simultaneously guarantees rework |
| One migration in flight at a time | Ordering conflicts are unrecoverable in a shared dev DB |
| Max 3 concurrent implementers per CTO | Beyond that, review becomes the bottleneck and quality drops |
| Branches live ≤ 2 days | Long branches diverge and the merge becomes a rewrite |

Good parallel splits: six independent primitives; five surface entry components; api endpoints across different resources; native screens that mirror shipped web routes.

Bad parallel splits: the routing algorithm and the budget enforcement it depends on; a token change and its consumers; two people on the composer.

---

## 8. Migrations

Highest-risk shared resource. Backend CTO owns; these rules are absolute.

1. **Additive only.** Expand → migrate → contract, across three deploys. Never drop a column in the same release that stops writing to it.
2. **All phase-0 seams land in the first migration** (system design §1), even unused. That is the entire anti-rework strategy.
3. Every migration is reversible or explicitly marked irreversible with a reason.
4. Dry-run against a production-shaped snapshot in CI.
5. A destructive migration is a **Needs your call**, always.

---

## 9. CI does the checking, agents do the judging

Automate everything in this list. What remains for a human or Fable is genuinely a judgment call.

| Gate | Blocks merge |
|---|---|
| Typecheck, lint, unit tests | ✔ |
| OpenAPI ↔ generated client drift | ✔ |
| Hardcoded hex / px / arbitrary value outside `tokens` | ✔ |
| Agent ink contrast, both themes | ✔ |
| Web bundle budgets, per route | ✔ |
| Client-component count per route | ✔ |
| Native bundle size | ✔ |
| Lighthouse on `/` and `/thread/[id]` | ✔ |
| Playwright visual regression, seed dataset | ✔ |
| **Premium neutrality** (identical markup) | ✔ |
| Missing accessible name / img dimensions / non-whitelisted icon-only button | ✔ |
| Banned imports (state, chart, animation, date, utility libs) | ✔ |
| Migration dry-run | ✔ |
| Agent quality-gate eval suite (on any persona or prompt change) | ✔ |

Fable's validation is then only: *does this do what the ticket said, and does it feel right?* Not: *is it correct?*

---

## 10. Escalation classes

Fable involves you on any of these, never only money.

| Class | Examples |
|---|---|
| **Money** | Infra tier change, model upgrade, paid tooling, anything raising monthly burn |
| **Safety** | Bell's circuit breaker, distress classifier thresholds, forum tone policy, moderation defaults, anything touching a user in distress |
| **Invariants** | Premium buying reach; standing earned from applause; an agent prohibition being relaxed; agent votes affecting ranking |
| **Precedent** | A new UI pattern not in the spec, a copy tone shift, a new surface |
| **Deadlock** | Two CTOs disagree and the contract doesn't settle it |
| **Scope** | Anything moving between phases |
| **Destructive** | Irreversible migration, data deletion, key rotation |

### Escalation format — required

Fable never asks an open question. Every escalation is:

```
CONFLICT   one sentence
EXAMPLE    a concrete case showing the difference
OPTION A   what happens, what it costs, what it forecloses
OPTION B   same
RECOMMEND  Fable's pick and why
REVERSIBLE yes/no — and if no, say so loudly
```

An escalation without a worked example goes back to Fable.

---

## 11. Ticket format

```
TITLE      Build ValidateEntry component
PHASE      p1
SPEC       frontend-spec §9.3, §5.2 (inks), §6.2 (voices)
DOMAIN     frontend
SHARED     no
RISK       none

ACCEPTANCE
  - Renders idea at `idea` size in prose face, 58ch measure
  - Spec strip shows For / Today with hairline rows
  - RoundTrack shows n of max with closes-in time
  - Nested replies use 22px ring in agent ink
  - Disagreement tag renders when disagrees_with is present
  - All six states in Storybook: 0/1/many replies, closed, blocked, loading

DEPENDS ON  #12 (EntryShell), #14 (tokens)
```

A ticket an implementer cannot complete with only the spec and the repo is not ready to leave To-do.

---

## 12. Keeping context alive

The failure mode that kills long agent projects: agent #47 doesn't know a decision made in week two.

| Artifact | Rule |
|---|---|
| `docs/DECISIONS.md` | Append-only. Every escalated decision: date, question, choice, reason, reversible? Read by every agent session. |
| The four spec docs | Updated **in the same PR** as the change. A PR that contradicts a spec without updating it fails review. |
| `CLAUDE.md` | Working agreement, file ownership, banned patterns, definition of done. Kept short enough that it is actually read. |
| Weekly spec-drift check | Fable diffs the shipped product against the specs and files tickets for the gaps. |

Never rely on conversation history. Everything an agent needs is a file in the repo.

---

## 13. When something breaks

1. **Revert first, diagnose after.** Never debug forward on `main`.
2. Fable reverts the promotion; the responsible CTO owns the fix.
3. Anything reaching production that CI should have caught produces a new CI gate, in the same week. That is how the gate list in §9 grows.
4. Repeat failures in one area produce a spec clarification, not a stricter reviewer.

---

## 14. Cadence

**Daily** — Fable: clear Validation, promote what passes, refill To-do to ~2 days per CTO, post board state, surface anything aged >3 days.

**Weekly** — Fable to you: shipped, blocked, decisions needed, spec drift, spend vs budget, next week's slice. Fifteen minutes of your time.

**Per phase** — you review against acceptance for the phase, spend an hour with the actual product, and explicitly sign off before the next phase opens.

---

## 15. Phase 0 setup checklist

Before any feature work:

- [ ] Monorepo, `CODEOWNERS`, `CLAUDE.md`, `DECISIONS.md`
- [ ] All four spec docs committed to `docs/`
- [ ] `packages/tokens` with light + dark + all six inks; emits css/ts/json
- [ ] `packages/contracts` with the v1 OpenAPI surface; client generation wired
- [ ] Full phase-0 migration including **every seam** from system design §1
- [ ] All CI gates from §9, failing loudly, on day one
- [ ] Preview environments per PR
- [ ] `develop` → `main` promotion flow
- [ ] Board deployed and reachable
- [ ] Startup credits applied for (AWS, Google, Microsoft, model providers)
- [ ] Six agent personas written **by you**
- [ ] Quality-gate eval set v1 written **by you**

Setting up CI gates before the first feature feels slow and is the highest-return hour in the project. Every gate you add later has to be retrofitted against code that already violates it.

---

## 16. What I would still watch

| Risk | Signal | Response |
|---|---|---|
| Spec rot | A PR contradicts a spec without updating it | Hard-fail review |
| Fable becomes a bottleneck | Validation column ages past 2 days | Move more checks into CI |
| CTOs mark their own homework | Bugs found in Validation, not review | Tighten gates, not people |
| Parallelism thrash | Merge conflicts in shared packages | Enforce single-threading |
| Scope creep across phases | Tickets without a phase tag | Fable rejects untagged tickets |
| Taste drift in agent output | `weak` vote rate climbing | You re-review the eval set personally |
| Cost drift | Inference $/active user | Monthly, against the budget doc |
```
