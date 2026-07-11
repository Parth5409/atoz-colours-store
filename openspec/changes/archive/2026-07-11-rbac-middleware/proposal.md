## Why

The AtoZ Colours Admin currently has no access boundary between a `super_admin` and a `shop_manager`. Any authenticated admin user can mutate global store settings, create API keys, and reconfigure payment providers — capabilities that should only ever be touched by `super_admin`. Without a middleware guard, a misconfigured or compromised `shop_manager` account can cause store-wide outages or financial misconfiguration (e.g. detaching the Razorpay provider). Medusa v2's native `req.auth_context` and User Module make it possible to enforce this boundary purely in server-side middleware, with no custom module required.

## What Changes

- **NEW** `apps/backend/src/api/middlewares/require-role.ts` — A reusable middleware factory `requireRole(allowedRole)` that reads `req.auth_context.actor_id`, resolves the Medusa `USER` module from the DI container, fetches the user's `metadata.role`, and throws a `403 MedusaError(NOT_ALLOWED)` if the caller's role does not satisfy the requirement.
- **NEW** `apps/backend/src/api/middlewares.ts` — The central middleware router registered via `defineMiddlewares`. Applies `requireRole("super_admin")` to write (`POST`, `PUT`, `DELETE`) operations on the following sensitive admin route prefixes: `/admin/store*`, `/admin/api-keys*`, `/admin/regions*`, `/admin/payment-providers*`, `/admin/settings*`.
- **NO BREAKING CHANGE** to existing admin read (`GET`) paths — `shop_manager` retains full read access and full write access to products, variants, collections, orders, inventory, and fulfillment.
- **NO custom auth module** — relies entirely on Medusa v2's built-in `req.auth_context` and `Modules.USER` from `@medusajs/framework/utils`.

## Capabilities

### New Capabilities

- `admin-rbac-guard`: Route-level RBAC enforcement for Medusa v2 admin API. Intercepts write requests to sensitive `/admin/*` sub-paths and enforces a `super_admin`-only policy by reading `metadata.role` from the authenticated user's record via the User Module. Returns `403 Forbidden` on policy violation.

### Modified Capabilities

_(none — no existing specs are affected)_

## Impact

| Area | Impact |
|---|---|
| `apps/backend/src/api/middlewares.ts` | **New file** — replaces the missing central middleware registration; must be at the `src/api/` root for Medusa's file-based router to pick it up automatically |
| `apps/backend/src/api/middlewares/require-role.ts` | **New file** — the guard implementation; isolated, testable, no side effects on other routes |
| `@medusajs/framework/utils` | Consumes `Modules.USER`, `MedusaError`, `MedusaErrorTypes` — already present as a framework dep, no new installs |
| `@medusajs/framework/http` | Consumes `MedusaRequest`, `MedusaNextFunction` types — already in scope |
| Admin UI / storefront | No change — restriction is server-side only; admin UI will receive standard `403` and surface it normally |
| Seed script (`src/scripts/seed.ts`) | Relies on users seeded with `metadata: { role: "super_admin" }` or `metadata: { role: "shop_manager" }` — seed script must set these values (tracked in a separate change) |
| Razorpay provider (`payment-razorpay-patched`) | Indirectly protected — `/admin/payment-providers*` writes are now `super_admin` only |
