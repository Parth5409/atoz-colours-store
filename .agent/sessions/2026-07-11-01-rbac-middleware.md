# 2026-07-11-01 — RBAC Middleware Guard

## Goal

Implement Role-Based Access Control in the Medusa v2 backend to protect sensitive `/admin` endpoints (store settings, regions, API keys, payment providers) such that only users with `metadata.role === "super_admin"` can write to them.

## Done

- Implemented `requireRole` middleware factory in `apps/backend/src/api/middlewares/require-role.ts`.
- Extracts `actor_id` from `req.auth_context` and resolves `Modules.USER` to fetch user metadata.
- Matches lowercase roles (case-insensitive) and blocks unprivileged access with a standard `403 MedusaError`.
- Created central middleware router `apps/backend/src/api/middlewares.ts`.
- Guarded `POST`, `PUT`, `DELETE` methods for `/admin/store*`, `/admin/api-keys*`, `/admin/regions*`, `/admin/payment-providers*`, and `/admin/settings*`.
- Left `GET` requests open for `shop_manager` read-only visibility.
- Verified backend build passes with type assertions.
- Archived the `rbac-middleware` OpenSpec change and synced delta specs to `openspec/specs/`.

## Decisions made

- [0002-rbac-metadata-middleware.md](../decisions/0002-rbac-metadata-middleware.md)

## Left off / next steps

- We need the custom seed script to insert sample `super_admin` and `shop_manager` users to manually test the RBAC in the live environment. (Tracked in `AtoZPlan.md`).
- We can now safely implement the Razorpay fix on the backend, knowing that the configuration endpoints are guarded.

## Graph status

- [x] Regenerated `graphify-out/` after this session's changes
