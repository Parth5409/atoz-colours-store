## Context

AtoZ Colours runs Medusa v2 on the backend. Razorpay is the primary INR payment gateway. The upstream `@sgftech/payment-razorpay` package ships a `RazorpayProviderService` whose `initiatePayment` method double-multiplies the cart total by 100: it first calls `getAmountFromSmallestUnit(amount)` (converting paise → rupees) then multiplies again by `100 * 100`, resulting in a 100× overcharge (₹10 becomes ₹1000). This is documented in `decisions/0001`.

The backend `medusa-config.ts` currently has no payment module block configured — the module integration is net-new. The module system follows Medusa v2's `Module()` export pattern where providers are registered as array entries under `providers` in the `@medusajs/medusa/payment` module options.

## Goals / Non-Goals

**Goals:**
- Install `@sgftech/payment-razorpay` as a named backend dependency so its types and base class are importable.
- Create `src/modules/payment-razorpay-patched/index.ts` that subclasses `RazorpayProviderService` and overrides `initiatePayment` to correctly compute `amount * 100` (paise) without the upstream double-multiply.
- Register the patched provider via Medusa v2's `Module()` export so Medusa's provider loader resolves it correctly.
- Wire the patched provider into `medusa-config.ts` under `@medusajs/medusa/payment`.
- Document required env vars in `.env.template` and populate them in `.env` for local ngrok-based webhook testing.

**Non-Goals:**
- UI or storefront changes — payment capture is backend-only.
- Webhook handler customisation beyond the standard Razorpay webhook verification the upstream provider already implements.
- Adding support for currencies other than INR in this change.

## Decisions

### Decision 1 — Subclass over fork

**Chosen:** Subclass `RazorpayProviderService` in-repo at `src/modules/payment-razorpay-patched/index.ts` and override only `initiatePayment`.

**Rejected alternatives:**
- *Direct `node_modules` edit* — overwritten on every `npm install`. Zero durability.
- *Private npm fork* — requires an external publish pipeline and ongoing maintenance for a one-method fix.
- *Monkey-patch at startup* — fragile, invisible in module graph, untyped.

The subclass approach keeps the fix versioned in source, fully typed via the upstream package, and easy to remove when the upstream bug is fixed.

### Decision 2 — Amount calculation override

The upstream bug path: `initiatePayment` receives `amount` already in **paise** (Medusa's smallest-unit representation). The upstream code calls `getAmountFromSmallestUnit(amount)` → `amount / 100` (converts to rupees), then multiplies by `100 * 100` instead of `100`. Net result: `amount * 100` extra factor.

**Fix:** Override `initiatePayment`. Before calling `super.initiatePayment()`, divide `context.amount` by 100 so the upstream's erroneous `× 100` results in the correct paise value. Alternatively, override the full `initiatePayment` body. Given the upstream method may call private helpers, dividing `context.amount` by 100 before delegation is the smallest-surface fix; if private methods are inaccessible, replicate the corrected body.

**Safety gate:** Any future upgrade to `@sgftech/payment-razorpay` requires re-verifying this code path against the installed source and running a real test-mode transaction (see `decisions/0001`).

### Decision 3 — Module registration

Medusa v2 requires providers exported via `Module(PAYMENT_MODULE, { service: PatchedService })`. The `medusa-config.ts` `modules` array entry for `@medusajs/medusa/payment` accepts a `providers` array. Each provider entry needs the module identifier matching the `Module()` export.

The patched module identifier will be `razorpay-patched` (set as the static `identifier` on the class, overriding the upstream `razorpay`).

### Decision 4 — Env var placement

- `.env.template` — committed, placeholder values, documents required vars for any deployer.
- `.env` — not committed (gitignored), real local ngrok values for development webhook testing.

## Risks / Trade-offs

- **Upstream fix lands silently** → The override will remain active but harmless (amount is divided and then upstream multiplies back correctly — net effect: the override becomes a no-op only if upstream changes *both* the `getAmountFromSmallestUnit` call AND the multiplier simultaneously). Mitigation: pin `@sgftech/payment-razorpay` version in `package.json` and treat minor/patch upgrades as requiring a financial smoke-test.
- **Private method inaccessibility** → If `initiatePayment` relies on private fields, a full method body replica may be needed. Mitigation: inspect installed source at `node_modules/@sgftech/payment-razorpay/dist/` before writing the override; if private fields are unavailable, use the pre-divide approach.
- **Missing env vars at boot** → Medusa's payment module will throw at startup if `RAZORPAY_ID`/`RAZORPAY_SECRET` are not set. Mitigation: validate in `.env.template` documentation and note in deploy runbook.
- **ngrok URL rotation** → Webhook URLs change on every ngrok restart. Mitigation: document this in `.env` comments; update Razorpay dashboard webhook on each dev session.

## Migration Plan

1. `npm install @sgftech/payment-razorpay` in `apps/backend/`.
2. Write `src/modules/payment-razorpay-patched/index.ts`.
3. Update `medusa-config.ts`.
4. Populate `.env.template` and `.env`.
5. Start backend locally, verify provider registers without error in boot logs.
6. Trigger a test payment in Razorpay test mode; confirm `amount` in the Razorpay dashboard matches the cart total in paise (not 100×).
7. Register ngrok webhook URL in Razorpay test dashboard.

**Rollback:** Remove the provider entry from `medusa-config.ts` and revert `medusa-config.ts` — no database migrations involved.
