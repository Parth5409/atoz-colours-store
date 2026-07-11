# 0001 — Patch Razorpay 100x Amount Bug via Service Subclass

- **Date:** 2026-07-11
- **Status:** Accepted

## Context

`@sgftech/payment-razorpay`'s `initiatePayment` (in `dist/core/razorpay-base.js`)
converts the cart amount from smallest-unit (paise) to standard unit (rupees)
via `getAmountFromSmallestUnit`, then re-multiplies by `100 * 100` for INR
instead of just `100`. Net effect: a ₹10 (1000 paise) cart is charged as
₹1000 (100000 paise) — a 100x overcharge. Verified directly against the
installed package source, not just the changelog/issues.

## Options Considered

1. Edit `node_modules` directly — rejected, overwritten on every clean install.
2. Fork the package on npm — more control, but adds an external publish/maintenance
   burden for a one-line fix.
3. Subclass `RazorpayProviderService`, override `initiatePayment` to divide the
   final amount back down to `toPay * 100` — chosen.

## Decision

Subclass approach, implemented in `src/modules/payment-razorpay-patched/`.
The module must export a proper `Module()`-wrapped service (not a bare class)
for Medusa's provider loader to resolve it — see `ARCHITECTURE.md`.

## Consequences

- Upgrading `@sgftech/payment-razorpay` in the future requires re-checking
  this override still applies to the same code path — the upstream bug could
  be fixed or the multiplication logic could move.
- Any change to this file needs a real-money test transaction in Razorpay
  test mode before merging, not just a unit test.

## Related Files

- `src/modules/payment-razorpay-patched/index.ts`
- `medusa-config.ts`
