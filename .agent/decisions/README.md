# Decisions

Lightweight ADRs (Architecture Decision Records). One file per real decision
— not per task. A "decision" is anywhere you picked one approach over a
genuinely viable alternative, especially anything touching money, auth, or
data shape.

## Naming

`NNNN-short-kebab-title.md`, zero-padded, sequential across the whole
project (not per-folder). Example: `0001-razorpay-amount-bug-patch.md`.

## When to write one

- Fixing the Razorpay amount bug via subclass vs. patch-package vs. fork ✅
- Choosing the RBAC matcher/regex strategy ✅
- Picking a seed data structure for paint variants ✅
- Renaming a CSS variable ❌ (not a decision, just do it)

## Template

Copy `0000-template.md` for each new record.
