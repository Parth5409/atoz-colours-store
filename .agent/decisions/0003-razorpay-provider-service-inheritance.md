# 0003 — RazorpayProviderService Inheritance for Patched Module

- **Date:** 2026-07-11
- **Status:** Accepted

## Context

When implementing the Razorpay patch (as designed in `0001-razorpay-amount-bug-patch.md`), the initial approach was to have `RazorpayPatchedService` extend `RazorpayBase` from `@sgftech/payment-razorpay/dist/core/razorpay-base`.

However, TypeScript compilation failed because:
1. `RazorpayBase` defines `paymentIntentOptions` as an abstract property which `RazorpayPatchedService` did not implement.
2. The `RazorpayBase` constructor is protected, preventing Medusa's provider loader from instantiating it directly since it expects a constructor signature compatible with public instantiation.

## Options Considered

1. Implement `paymentIntentOptions` and a public constructor manually on `RazorpayPatchedService` while extending `RazorpayBase`.
2. Extend `RazorpayProviderService` (from `dist/services/razorpay-provider`) instead, which already implements the missing members and provides a public constructor that Medusa expects.

## Decision

Extend `RazorpayProviderService` directly instead of `RazorpayBase`. This is the exact class that the upstream module exports as its provider service, meaning it natively resolves all TypeScript abstract requirements and constructor visibility expectations set by the Medusa plugin loader.

## Consequences

- The patched module's index file imports from `dist/services/razorpay-provider` instead of `dist/core/razorpay-base`.
- Future upgrades to `@sgftech/payment-razorpay` require checking the structure of `RazorpayProviderService` to ensure it still serves as the entrypoint provider class.

## Related Files

- `apps/backend/src/modules/payment-razorpay-patched/index.ts`
- `decisions/0001-razorpay-amount-bug-patch.md`
