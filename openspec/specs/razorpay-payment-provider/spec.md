## ADDED Requirements

### Requirement: Correct INR paise conversion on payment initiation
The patched Razorpay provider module SHALL convert the Medusa cart `amount` (already in paise, the INR smallest unit) to the correct Razorpay `amount` field value by multiplying by exactly 100 — never by 10,000 — so that the amount charged through Razorpay's API equals the cart total.

#### Scenario: INR payment initiated with correct paise amount
- **WHEN** a checkout initiates payment for a cart totalling ₹10.00 (amount = 1000 paise in Medusa)
- **THEN** the Razorpay order is created with `amount: 1000` (paise), not `100000`

#### Scenario: Amount override is isolated to INR currency
- **WHEN** the provider receives a payment context with `currency_code` of `inr`
- **THEN** the amount forwarded to Razorpay equals `context.amount` in paise (Medusa's smallest unit representation)

---

### Requirement: Patched provider registers as a valid Medusa v2 payment provider
The module at `src/modules/payment-razorpay-patched/index.ts` SHALL export a `Module()`-wrapped service that Medusa v2's provider loader can resolve, with a unique provider identifier distinct from the upstream `razorpay` identifier.

#### Scenario: Provider is resolvable at backend startup
- **WHEN** the Medusa backend starts with the patched module listed under `@medusajs/medusa/payment` providers
- **THEN** the backend boots without errors and logs the patched provider as registered

#### Scenario: Provider identifier is unique
- **WHEN** both `@sgftech/payment-razorpay` and the patched module are present in the project
- **THEN** no identifier collision occurs, and only the patched provider is registered in `medusa-config.ts`

---

### Requirement: Required environment variables are declared
The project SHALL declare `RAZORPAY_ID`, `RAZORPAY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET` in `.env.template` with placeholder values and documentation comments so that any developer or deployer knows which credentials are required for the payment module to load.

#### Scenario: .env.template contains all three Razorpay vars
- **WHEN** a developer clones the repo and inspects `.env.template`
- **THEN** they find `RAZORPAY_ID`, `RAZORPAY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET` with placeholder values and an explanatory comment

#### Scenario: Missing env var causes explicit boot failure
- **WHEN** `RAZORPAY_ID` is absent from the environment at backend startup
- **THEN** Medusa's payment module fails to initialise with a clear error referencing the missing credential (upstream provider behaviour — no custom handling required)

---

### Requirement: medusa-config.ts wires the patched provider under the payment module
`apps/backend/medusa-config.ts` SHALL include a `@medusajs/medusa/payment` module entry whose `providers` array contains a single entry pointing to the patched Razorpay module with its `id` and options block (`apiKey`, `apiSecret`, `webhookSecret` read from env vars).

#### Scenario: Payment module block is present and valid
- **WHEN** `medusa-config.ts` is loaded by Medusa at startup
- **THEN** the `modules` array contains an entry for `@medusajs/medusa/payment` with a non-empty `providers` array referencing `payment-razorpay-patched`

#### Scenario: No duplicate or conflicting payment provider entries
- **WHEN** `medusa-config.ts` is inspected
- **THEN** there is exactly one payment provider entry and it references the patched module, not the upstream `@sgftech/payment-razorpay` module directly
