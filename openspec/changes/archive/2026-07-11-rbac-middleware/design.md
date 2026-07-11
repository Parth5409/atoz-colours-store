## Context

The AtoZ Colours Medusa v2 backend (`apps/backend`) currently has no `src/api/middlewares.ts` file and no access differentiation between admin user roles. Any authenticated admin user — regardless of whether their `metadata.role` is `super_admin` or `shop_manager` — can call any admin API endpoint.

Medusa v2's built-in auth pipeline attaches an `auth_context` object to every request passing through the admin JWT guard. This context includes `actor_id` (the user's ID) and `actor_type` (`"user"`). The framework's User Module can be resolved from the DI container (`req.scope.resolve(Modules.USER)`) and used to retrieve the full user record — including its `metadata` field — without any additional database queries beyond what Medusa already makes.

The sensitive endpoints that must be restricted are those that directly affect system configuration and financial infrastructure:
- `/admin/store*` — store name, default currency, default region
- `/admin/api-keys*` — publishable and secret key management
- `/admin/regions*` — region creation, tax rate overrides, currency mapping
- `/admin/payment-providers*` — enabling/disabling payment providers (guards Razorpay config)
- `/admin/settings*` — catch-all settings namespace

`shop_manager` users retain full read access (all `GET` requests pass unhindered) and full write access to product, order, inventory, and fulfillment endpoints.

## Goals / Non-Goals

**Goals:**
- Implement a reusable `requireRole(role)` middleware factory that evaluates `req.auth_context` and enforces a role requirement
- Register route-specific middleware rules in `src/api/middlewares.ts` using Medusa's `defineMiddlewares` API
- Restrict writes to the five sensitive admin route prefixes to `super_admin` only
- Use zero new npm dependencies — rely entirely on `@medusajs/framework/utils` and `@medusajs/framework/http` which are already installed

**Non-Goals:**
- Implementing row-level or resource-level permission checks (e.g. "can this shop_manager edit _this_ product?")
- Restricting `GET` (read) endpoints — reads remain open to all authenticated admin users
- Building a UI-level permission system in the admin panel
- Implementing a full-blown permission table or database-backed ACL
- Handling the `shop_manager` user seeding — tracked separately
- Restricting storefront API (`/store/*`) endpoints

## Decisions

### Decision 1: Middleware factory pattern over per-route inline functions

**Chosen:** `requireRole("super_admin")` factory returns a `MedusaNextFunction`-compatible middleware.

**Rationale:** A factory allows the same guard to be reused across multiple route matchers with different role requirements in one import, keeping `middlewares.ts` declarative. A flat inline function would need to be duplicated or require a shared variable for the role string, making future extension (e.g. adding `"brand_admin"`) harder.

**Alternative considered:** A single `adminRoleGuard` function that reads a hardcoded list of allowed roles from config — rejected as over-engineering for current two-role setup.

---

### Decision 2: Read user role from `metadata` field, not a custom table

**Chosen:** `user.metadata.role` string comparison (`"super_admin"` | `"shop_manager"`).

**Rationale:** Medusa v2's User entity already has a `metadata: Record<string, unknown>` column. Using it avoids a custom migration, a custom module, and a custom link table. This is exactly the pattern described in the AtoZPlan's RBAC section. The tradeoff is that `metadata` is untyped at the DB level — mitigated by explicit runtime string checks and a clear typing convention.

**Alternative considered:** A dedicated `user_roles` join table via a custom Medusa module — rejected as disproportionate complexity for a two-role system on a single-team store.

---

### Decision 3: Throw `MedusaError(NOT_ALLOWED)` rather than calling `res.status(403).json(...)`

**Chosen:** `throw new MedusaError(MedusaErrorTypes.NOT_ALLOWED, "Forbidden")`

**Rationale:** Medusa v2's error handling middleware (`@medusajs/framework/http`) catches `MedusaError` instances and converts them to the correct JSON error response format with the right HTTP status. Calling `res.status(403)` directly bypasses the error normalization layer, producing inconsistent response shapes that differ from all other Medusa errors.

**Alternative considered:** `res.status(403).json({ message: "Forbidden" })` and calling `next()` — rejected because it produces a non-standard response shape.

---

### Decision 4: Apply middleware only to mutating HTTP verbs

**Chosen:** `method: ["POST", "PUT", "DELETE"]` on each route matcher.

**Rationale:** Read access (`GET`) to store settings, regions, and API key lists is considered safe for `shop_manager` (they need visibility into configurations, just not write access). Restricting reads would degrade the admin UX without security benefit since the data is not sensitive to view.

**Alternative considered:** Restrict all verbs — rejected as unnecessarily aggressive and would break the admin dashboard's settings views for `shop_manager`.

---

### Decision 5: File location at `apps/backend/src/api/middlewares.ts`

**Chosen:** `apps/backend/src/api/middlewares.ts` (matches the monorepo layout where `apps/backend` is the Medusa app root).

**Rationale:** Medusa v2's file-based router auto-discovers `middlewares.ts` at the `src/api/` root. The helper module lives at `src/api/middlewares/require-role.ts` (a subfolder), which is not auto-loaded as a route — only `middlewares.ts` at the root is.

**Alternative considered:** Placing the factory in `src/modules/` — rejected because this is API-layer logic, not a Medusa module with a service/repository boundary.

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| `req.auth_context` is `undefined` on unauthenticated requests | Guard checks `auth_context?.actor_id` — if absent, the native Medusa auth middleware will have already rejected the request with a `401` before this guard runs on protected admin routes |
| `metadata.role` typo in seed data (e.g. `"shop_Manager"`) bypasses restriction | Normalize comparison to lowercase: `String(metadata.role).toLowerCase()` |
| New admin route prefixes added later are not guarded | Document the pattern in `middlewares.ts` — new prefix additions require a PR review that checks this file |
| `listUsers` call adds one extra DB query per guarded request | Acceptable for admin-only paths (low traffic). The User Module's service uses the same connection pool — no N+1, single record lookup by ID |
| Medusa v2 upgrade changes `auth_context` shape | Pinned to `@medusajs/framework` version in `package.json`; breaking changes tracked via Medusa changelog |

## Migration Plan

1. **Deploy** — both new files (`middlewares.ts`, `middlewares/require-role.ts`) are additive. No schema migration required.
2. **Seed** — ensure at least one user has `metadata: { role: "super_admin" }` before deploying, otherwise all admin mutation endpoints become inaccessible. The seed script covers this.
3. **Rollback** — delete or comment out the `middlewares.ts` registration. The guard is self-contained with no database side effects.
4. **Verify** — use the manual test in the tasks (`RBAC Guard` test case from AtoZPlan §Verification).

## Open Questions

_(none — design is fully determined by the constraints above)_
