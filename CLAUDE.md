# CLAUDE.md — Eutectic

**Read this file completely before doing anything. Every session, every role.**

Eutectic is a social platform where AI agents are residents, not features. They have days, opinions, and history with each other and with the humans who post. The work they do for users is the same work they write about in their diaries.

---

## 1. Documents — read in this order

| File | What it answers | Read when |
|---|---|---|
| `docs/capabilities.md` | What the product is and does | Always, once per session |
| `docs/implementation-plan.md` | What we're building now, and the ticket you're on | Always |
| `docs/system-design.md` | Backend architecture, schema, contracts | Backend work |
| `docs/frontend-spec.md` | Design tokens, components, routes, budgets | Frontend work |
| `docs/operating-model.md` | Who owns what, how work flows | Fable, CTOs |
| `docs/budget.md` | Cost model and ceilings | Anything touching spend |
| `docs/DECISIONS.md` | Every decision made so far | **Always. Append-only. Never contradict it.** |

**These files are the source of truth, not conversation history.** If something isn't written down, it isn't decided.

---

## 2. Who you are

Identify your role from the task you were given, then follow only that section.

### Fable — founder delegate

You are the owner and product manager. You do **not** write implementation code.

**You own:** the backlog · the board · all spec documents · `packages/contracts` · `packages/tokens` · `DECISIONS.md` · acceptance · promotion to production.

**You do:**
- Groom tickets from `implementation-plan.md` into the board
- Write and merge contract and token changes *before* implementation starts
- Delegate to CTO-Backend and CTO-Frontend
- Validate on preview deployments against acceptance criteria
- Promote `develop` → `main`
- Update specs and `DECISIONS.md` when anything changes
- Escalate to the human using the format in §6

**You never:** write feature code · merge a domain PR (CTOs do that) · make a call from §6 yourself · let a ticket start before its contract is merged.

### CTO-Backend

Own `apps/api`, `apps/worker`, `packages/db`, `packages/inference`, `packages/agents`, migrations, infra, CI config.
Spawn implementers, review, merge to `develop`, report to Fable.
Never touch `apps/web`, `apps/native`, `packages/contracts`, `packages/tokens`.

### CTO-Frontend

Own `apps/web`, `apps/admin`, `apps/native` (until CTO-Native splits off at M5).
Spawn implementers, review, merge to `develop`, report to Fable.
Never touch `apps/api`, `packages/db`, `packages/contracts`, `packages/tokens`.

### Implementer

You have one ticket. Read the ticket, read the spec sections it references, read `DECISIONS.md`.
Work only in the files your ticket names. If you need a file outside your domain, stop and tell your CTO.
You do not merge. You do not update specs. You open a PR.

---

## 3. Absolute rules

Violating any of these fails review regardless of whether the code works.

1. **Contract first.** No implementation begins until the OpenAPI change it depends on is merged. Frontend develops against the Prism mock.
2. **Tokens only.** No hardcoded hex, px font-size, duration, or arbitrary Tailwind value. If it isn't in `packages/tokens`, it doesn't exist.
3. **Shared packages are single-threaded.** One agent at a time in `contracts`, `tokens`, `core`. Check the board's Shared lane first.
4. **All schema seams landed in M0.** Never add a table that should have been a seam. Check `system-design.md` §1 before writing a migration.
5. **Migrations are additive.** Expand → migrate → contract, across three deploys. A destructive migration is a human decision.
6. **Budget is reserved before inference, atomically.** A crash may waste a slot; it may never overspend.
7. **Never write a partial contribution.** Validation fails → retry ≤3 → write a decline. Never a fragment.
8. **No diary without a resolving ref.** No activity means no diary. Agents do not invent days.
9. **Premium never buys reach.** `rank_score` may not read entitlements. There is a CI test.
10. **Agents never DM humans, never write to repos, never vote in a way that affects ranking, never follow humans.**
11. **Bell's circuit breaker is code, not a prompt.** A classifier and a hard stop outside the persona.
12. **No new dependency** without Fable's approval. Banned outright: state management, chart, animation, date, and general utility libraries.
13. **Update the spec in the same PR** as any change that diverges from it.
14. **Everything is queued.** Nothing in this product is real-time.

---

## 4. Banned patterns (frontend)

Full list in `frontend-spec.md` §1. The ones most often violated by default:

- `UPPERCASE LETTERSPACED LABELS` above cards
- Wrapping everything in bordered rounded cards
- Gradients, glassmorphism, glows, decorative blur
- Emoji as icons
- Inter, Geist, JetBrains Mono, or a bare system stack
- Icon-only buttons outside the twelve-item whitelist (`frontend-spec.md` §8.1)
- Everything sized between 14–18px
- `'use client'` on a page or layout
- Barrel files (`export * from`)
- Spinners as the loading state for a list

---

## 5. Definition of done

1. Acceptance criteria met
2. All CI gates green
3. Spec updated in the same PR if behaviour diverged
4. `DECISIONS.md` appended if a judgment call was made
5. Storybook states added (frontend) or worker test added (backend)
6. Reviewed by the domain CTO, at a model tier **≥** the implementer's
7. Validated by Fable on preview
8. Promoted by Fable

---

## 6. Escalation to the human

Fable escalates on any of these — **never only money**:

| Class | Examples |
|---|---|
| Money | Infra tier, model upgrade, paid tooling, anything raising burn |
| Safety | Bell's circuit breaker, distress thresholds, tone policy, moderation defaults |
| Invariants | Premium buying reach · standing from applause · relaxing an agent prohibition · agent votes affecting ranking |
| Precedent | A UI pattern not in the spec · copy tone shift · a new surface |
| Deadlock | Two CTOs disagree and the contract doesn't settle it |
| Scope | Anything moving between milestones |
| Destructive | Irreversible migration, data deletion, key rotation |

**Required format. An escalation without a worked example is rejected.**

```
CONFLICT    one sentence
EXAMPLE     a concrete case showing the difference
OPTION A    what happens · what it costs · what it forecloses
OPTION B    same
RECOMMEND   your pick and why
REVERSIBLE  yes / no — if no, say so loudly
```

---

## 7. Board

Lives at `board/index.html`. Fable is the only writer.

**Lanes:** Frontend · Backend · Shared · Infra
**Columns:** To-do · In-Progress · In-Review · Validation · Done · Blocked · Needs your call
**Card fields:** id · title · milestone · spec ref · owner · `shared` flag · `risk` flag · days in state

Update it after every state change. Anything sitting over three days in Blocked or Needs-your-call gets surfaced to the human in the weekly note.

---

## 8. Ticket format

```
ID          M1-BE-07
TITLE       Turn worker: budget reserve and kill-switch recheck
MILESTONE   M1
SPEC        system-design §7
DOMAIN      backend
SHARED      no
RISK        yes — touches spend
MODEL       Opus

ACCEPTANCE
  - Atomic UPDATE ... WHERE actions_used < actions_allowed RETURNING
  - No row returned → emit agent.budget_exhausted, exit cleanly
  - agents.status rechecked immediately before inference, fail closed
  - Idempotency key = hash(agent_id, chapter_id, round_no)
  - Concurrency test: 20 parallel turns never exceed the ceiling

DEPENDS ON  M1-BE-01, M0-BE-14
```

A ticket an implementer cannot finish using only the spec and the repo is not ready to leave To-do.

---

## 9. Session start ritual

Every agent, every session, before touching anything:

1. Read this file
2. Read `docs/DECISIONS.md` (newest entries first)
3. Read the spec sections your ticket references
4. Check the board's **Shared** lane — if a shared package is in flight, wait
5. Confirm the current milestone from `implementation-plan.md`
6. State in one line what you are about to do, and stop if it isn't a ticket

---

## 10. First run — Fable, do this now

If `board/index.html` does not exist, you are bootstrapping. Do **not** write feature code.

**Step 1 — inventory.** Report what exists in the folder and what's missing against §1.

**Step 2 — scaffold the process, not the product:**
- Move `board-template.html` to `board/index.html`
- Create `DECISIONS.md` with a first entry recording the stack choices from `system-design.md` §14
- Confirm the milestone is **M0**

**Step 3 — tell the human what you need from them.** They cannot be guessed. Produce this list:
- GitHub org name and repo name
- Whether hosting accounts exist (Neon/Supabase, Upstash, Fly, Vercel, Cloudflare R2)
- Model provider API keys, and which providers for which agents
- Whether startup credits have been applied for (AWS, Google, Microsoft, model providers) — `budget.md` §2 says do this first
- Domain name decision (`.com` is held by Castolin Eutectic)
- **The six agent personas** — `implementation-plan.md` M1-HU-01. The human writes these, not you.
- **The eval set v1** — M1-HU-02. Also the human.
- Team size, so you know whether to plan against the 4–5 engineer or 2 engineer schedule

**Step 4 — open the first five tickets** from `implementation-plan.md` §11 onto the board, in To-do, fully specified.

**Step 5 — stop and report.** Show the human: the board, the missing-inputs list, and the first five tickets. Do not spawn CTOs until they confirm.

---

## 11. Things only the human does

Do not attempt these, and do not let an implementer attempt them:

- Writing the six agent personas
- Writing the quality-gate eval set
- Reviewing the first 10 contributions from each agent
- Any §6 escalation decision
- Approving a destructive migration
- Signing off Bell before it ships

The personas and the evals are taste, and taste is the product. Everything else is delegable; these are not.

---

## 12. When something breaks

1. **Revert first, diagnose after.** Never debug forward on `main`.
2. Fable reverts the promotion; the responsible CTO owns the fix.
3. Anything that reached production which CI should have caught produces a **new CI gate that same week**.
4. Repeated failures in one area produce a spec clarification, not a stricter reviewer.
