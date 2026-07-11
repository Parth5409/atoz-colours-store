# AtoZ Colours — Agent Entrypoint

This file is intentionally minimal. It exists to orient any agent (human or
AI) in under 30 seconds and point to the right file for everything else. Do
not add project detail here — add it to the file it belongs in and link it
below.

## What this project is

AtoZ Colours is a premium automotive paint e-commerce store (dynamic colors,
pearls, candy neons) built on MedusaJS v2 + Next.js 15, deployed across
Cloudflare/Vercel/Railway. Full details → [`PROJECT.md`](./PROJECT.md).
Full system topology → [`ARCHITECTURE.md`](./ARCHITECTURE.md).

## Mandatory workflow — two gates, in order

This repo enforces two AI guardrails together. Neither is skippable, and
they run in this order: **understand via Graphify → propose via OpenSpec →
only then write code.**

### Gate 1 — Read the graph before touching anything

**Before opening, editing, or grepping any source file, query the codebase
graph at [`graphify-out/graph.json`](./graphify-out/graph.json).** Never
speculatively grep or `find` your way around the repo — the graph already
encodes the AST-level dependency chains (e.g. exactly how the Razorpay
provider module relates to the Cart API). Grep/search is a fallback for when
the graph doesn't have an answer, not a first move.

```
<FILL IN: exact graphify query command/CLI syntax once confirmed, e.g.
`graphify query "razorpay payment provider"` — the output file itself is
confirmed to be graphify-out/graph.json>
```

If the graph is stale (missing a file/symbol you know exists), regenerate it
before trusting it further:

```
<FILL IN: exact graphify regenerate/index command>
```

### Gate 2 — Propose before you code (OpenSpec)

**Before writing a single line of executable TypeScript**, write or update a
Markdown proposal in `openspec/changes/` describing the architectural intent
— what you're changing, why, and which module boundaries it touches. This
exists specifically to stop hallucinated approaches and keep Medusa v2's
module isolation intact. Do not treat this as optional for "small" changes —
small changes to `payment-razorpay-patched/` or the RBAC middleware are
exactly the ones most likely to cause quiet, expensive damage.

```
<FILL IN: openspec proposal command/template location once confirmed,
e.g. `openspec propose <change-name>`>
```

## Where everything else lives

| Need to know...                                   | Go to                                      |
|-----------------------------------------------------|---------------------------------------------|
| Business model, stack, environment, deploy targets   | [`PROJECT.md`](./PROJECT.md)               |
| Full system topology, data model, event chains, RBAC  | [`ARCHITECTURE.md`](./ARCHITECTURE.md)   |
| Design system, coding style, naming conventions      | [`CONVENTIONS.md`](./CONVENTIONS.md)       |
| Why something was built a certain way                | [`decisions/`](./decisions/)               |
| What happened in a past session                      | [`sessions/`](./sessions/)                 |
| Domain-specific terms (paint/finish/variant jargon)   | [`GLOSSARY.md`](./GLOSSARY.md)             |
| The current codebase graph                             | [`graphify-out/`](./graphify-out/)         |
| Proposal-first specs (required before coding)           | `openspec/changes/` (repo root, not in `.agent/`) |

## End-of-session protocol

Every session, before ending:

1. **Regenerate/refresh `graphify-out/graph.json`** if you touched code.
2. **Resolve or archive the OpenSpec proposal** in `openspec/changes/` that
   covered this session's work — don't leave it open-ended for the next
   session to guess at.
3. **Write a session summary** in `sessions/` using the template — one file
   per session, dated and numbered.
4. **Log any real decision** (not just "did the task") in `decisions/` using
   the ADR template — anything where you picked one approach over a viable
   alternative, especially anything touching payments, RBAC, or data models.
5. Keep this file (`AGENTS.md`) unchanged unless the *workflow itself*
   changes. Project facts go in `PROJECT.md` / `ARCHITECTURE.md`, not here.

## Non-negotiables

- Never touch `src/modules/payment-razorpay-patched/` amount-calculation
  logic without re-reading `decisions/0001` first — this is a financial
  correctness fix, not a style choice.
- Never loosen the `super_admin` / `shop_manager` RBAC boundary without an
  OpenSpec proposal *and* a decision record explaining why.
- Before implementing paint-variant validation, resolve the `hazmat` vs.
  `hazmat_class` naming discrepancy flagged in `ARCHITECTURE.md` §3 — don't
  guess which one is real.
- Aesthetic is a hard constraint, not a suggestion — see `CONVENTIONS.md`
  before writing any UI.
