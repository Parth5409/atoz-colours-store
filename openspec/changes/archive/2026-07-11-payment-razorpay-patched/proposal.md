## Why

`@sgftech/payment-razorpay`'s `initiatePayment` converts the cart amount from smallest-unit (paise) to rupees via `getAmountFromSmallestUnit`, then re-multiplies by `100 * 100` for INR instead of the correct `100`. This causes a 100x overcharge on every INR transaction (e.g. ₹10 becomes ₹1000). Editing `node_modules` directly is not durable; the fix must live in the project as a versioned, tested module.

## What Changes

- Install `@sgftech/payment-razorpay` as a backend dependency (the package the patched provider subclasses).
- Author `src/modules/payment-razorpay-patched/index.ts` — a `RazorpayProviderService` subclass that overrides `initiatePayment` to apply the correct `amount * 100` paise conversion (instead of the upstream `getAmountFromSmallestUnit(amount) * 100 * 100`).
- Register the patched provider in `apps/backend/medusa-config.ts` under the `@medusajs/medusa/payment` module options, replacing any direct reference to the upstream provider.
- Add `RAZORPAY_ID`, `RAZORPAY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET` to `.env.template` (documented placeholders) and `.env` (local ngrok testing values). **BREAKING** for any environment missing these vars — the payment module will fail to load.

## Capabilities

### New Capabilities

- `razorpay-payment-provider`: Patched Razorpay payment provider module that correctly converts INR amounts to paise and registers cleanly with Medusa v2's payment module system.

### Modified Capabilities

<!-- No existing specs require requirement-level changes; this is a net-new integration. -->

## Impact

- **Backend package.json** — adds `@sgftech/payment-razorpay` dependency.
- **`src/modules/payment-razorpay-patched/index.ts`** — new module file (net-new, no prior source).
- **`medusa-config.ts`** — adds provider entry inside the `@medusajs/medusa/payment` module block.
- **`.env.template` / `.env`** — three new environment variable declarations.
- No storefront or admin UI changes required; this is a backend/payment-infra change only.
- Future upgrades to `@sgftech/payment-razorpay` must re-verify the amount multiplication code path before removing the override (see `decisions/0001`).
