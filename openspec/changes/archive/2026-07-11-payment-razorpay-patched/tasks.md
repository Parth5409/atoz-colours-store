## 1. Dependency Installation

- [x] 1.1 Run `npm install @sgftech/payment-razorpay` inside `apps/backend/` to add it as a named dependency in `apps/backend/package.json`
- [x] 1.2 Verify the package appears under `dependencies` (not `devDependencies`) in `apps/backend/package.json` and that `node_modules/@sgftech/payment-razorpay/dist/` contains `razorpay-base.js`

## 2. Inspect Upstream Source

- [x] 2.1 Open `node_modules/@sgftech/payment-razorpay/dist/core/razorpay-base.js` (or equivalent `.ts` source) and locate the `initiatePayment` method to confirm the `100 * 100` multiplication bug exists at this installed version
- [x] 2.2 Note whether `initiatePayment` relies on private class fields (`#field` syntax) — this determines if a pre-divide delegation or a full-body override is needed (see design Decision 2)
- [x] 2.3 Record the installed package version in a code comment inside the patched module for future upgrade audits

## 3. Patched Module Implementation

- [x] 3.1 Create directory `apps/backend/src/modules/payment-razorpay-patched/`
- [x] 3.2 Create `apps/backend/src/modules/payment-razorpay-patched/index.ts` with a class `RazorpayPatchedService` that extends `RazorpayProviderService`
- [x] 3.3 Set `static identifier = "razorpay-patched"` on the class to avoid collision with the upstream `razorpay` identifier
- [x] 3.4 Override `initiatePayment(context)`: divide `context.amount` by 100 before calling `super.initiatePayment(context)` (or replicate the corrected body if private fields block delegation — per design Decision 2)
- [x] 3.5 Export the module using `Module(RAZORPAY_PATCHED_MODULE, { service: RazorpayPatchedService })` — ensure `RAZORPAY_PATCHED_MODULE` is a unique string constant defined in the same file
- [x] 3.6 TypeScript-compile the backend (`npx tsc --noEmit` in `apps/backend/`) to confirm no type errors in the new module

## 4. medusa-config.ts Registration

- [x] 4.1 Open `apps/backend/medusa-config.ts` and add a `modules` array to `defineConfig` if one does not exist
- [x] 4.2 Add a `@medusajs/medusa/payment` module entry with a `providers` array containing a single object: `{ resolve: "./src/modules/payment-razorpay-patched", id: "razorpay-patched", options: { apiKey: process.env.RAZORPAY_ID, apiSecret: process.env.RAZORPAY_SECRET, webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET } }`
- [x] 4.3 Confirm there is no duplicate `@medusajs/medusa/payment` entry and no direct reference to `@sgftech/payment-razorpay` in `medusa-config.ts`

## 5. Environment Variables

- [x] 5.1 Add the following block to `.env.template` (with comments):
  ```
  # Razorpay payment gateway credentials
  # Get from https://dashboard.razorpay.com/app/keys
  RAZORPAY_ID=rzp_test_xxxxxxxxxxxx
  RAZORPAY_SECRET=your_razorpay_secret
  RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
  ```
- [x] 5.2 Add the same three variables to `.env` with real test-mode values and a comment noting that the ngrok webhook URL must be updated in the Razorpay dashboard on each dev session
- [x] 5.3 Confirm `.env` is listed in `.gitignore` (it should already be — just verify)

## 6. Verification

- [x] 6.1 Start the Medusa backend (`npm run dev` in `apps/backend/`) and confirm the boot logs show `razorpay-patched` as a registered payment provider without errors
- [x] 6.2 Trigger a test payment order via the Medusa API (or storefront) for a known INR cart total and verify the Razorpay dashboard shows the correct paise amount (e.g. ₹10 cart → `amount: 1000` in Razorpay, not `100000`)
- [x] 6.3 Register a local ngrok URL in the Razorpay test dashboard and confirm the webhook event reaches Medusa and is processed without 400/500 errors
