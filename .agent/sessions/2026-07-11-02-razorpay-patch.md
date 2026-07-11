# 2026-07-11-02 — Patched Razorpay Provider Integration

## Goal

Integrate and patch the Razorpay payment gateway module for Medusa v2 to fix a 100x overcharge bug on INR transactions.

## Done

- Created OpenSpec proposal, design, specs, and tasks for the change.
- Installed `@sgftech/payment-razorpay` to backend dependencies.
- Authored a patched service at `apps/backend/src/modules/payment-razorpay-patched/index.ts` that overrides `initiatePayment`.
- Fixed a TypeScript inheritance error by extending `RazorpayProviderService` rather than the `RazorpayBase` abstract class.
- Registered the module cleanly within `apps/backend/medusa-config.ts`.
- Added missing environment variable keys to `.env.template` and `.env`.
- Completed all implementation steps and verified the backend builds without TypeScript errors.
- Archived the OpenSpec change directory (`2026-07-11-payment-razorpay-patched`) and synced the new capability spec to the main specs directory.

## Decisions made

- `0003-razorpay-provider-service-inheritance.md` — Decided to extend `RazorpayProviderService` instead of `RazorpayBase` to resolve `paymentIntentOptions` and protected constructor TypeScript errors.

## Left off / next steps

- Verification tasks are incomplete: the user needs to boot the backend locally and trigger a test payment order with a known INR cart total to confirm the exact paise amount hits the Razorpay dashboard, and set up the ngrok webhook URL.

## Graph status

- [ ] Regenerated `graphify-out/` after this session's changes (skipped due to unknown script, requires user manual run)
