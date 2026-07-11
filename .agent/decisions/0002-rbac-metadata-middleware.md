# 0002 — Admin RBAC via User Metadata and Native Auth Context

- **Date:** 2026-07-11
- **Status:** Accepted

## Context

AtoZ Colours requires two distinct admin roles: `super_admin` (full access including store settings, regions, API keys, and payment provider config) and `shop_manager` (access to products, variants, orders, and fulfillment, but restricted from structural configuration). Medusa v2 allows for custom modules and link tables, but we need the simplest, most maintainable solution that respects the framework's native `auth_context`.

## Options Considered

1. **Option A: Custom Role Module and Link Table** — pros: strict typings, robust foreign keys. cons: requires a new Medusa module, database migrations, and extending the authentication flow. Overkill for a two-role store.
2. **Option B: User Metadata Field (`user.metadata.role`)** — pros: zero migrations, native Medusa feature, simple middleware intercept. cons: untyped JSONB field, requires careful seed data.

## Decision

We chose **Option B**. We implemented a custom middleware factory `requireRole(role)` that intercepts `req.auth_context.actor_id`, resolves the User Module via DI container, and reads `metadata.role`. The role is normalized to lowercase for comparison, making it fault-tolerant against seed typos.

We also explicitly chose to only restrict mutating verbs (`POST`, `PUT`, `DELETE`), allowing `shop_manager` to read settings (`GET`), which maintains dashboard functionality without compromising security.

## Consequences

- Easy setup and no custom Postgres schema.
- Creating users via the API or seed script requires explicitly setting `metadata: { role: "super_admin" | "shop_manager" }`.
- Typo-safe due to `.toLowerCase()` normalizations, but if `metadata.role` is missing entirely, the middleware safely defaults to throwing a `403 Forbidden`.

## Related Files

- `apps/backend/src/api/middlewares/require-role.ts`
- `apps/backend/src/api/middlewares.ts`
