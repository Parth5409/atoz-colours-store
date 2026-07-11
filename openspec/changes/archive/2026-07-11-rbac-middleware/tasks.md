## 1. Guard Implementation

- [x] 1.1 Create `apps/backend/src/api/middlewares/` directory (if it doesn't exist)
- [x] 1.2 Create `apps/backend/src/api/middlewares/require-role.ts` — implement the `requireRole(allowedRole: string)` factory function that returns a Medusa-compatible middleware
- [x] 1.3 In `requireRole`: extract `actor_id` from `req.auth_context`; if absent, throw `MedusaError(MedusaErrorTypes.NOT_ALLOWED, "Forbidden")`
- [x] 1.4 In `requireRole`: resolve the User Module via `req.scope.resolve(Modules.USER)` and call `userService.retrieveUser(actor_id, { select: ["id", "metadata"] })`
- [x] 1.5 In `requireRole`: compare `String(user.metadata?.role).toLowerCase()` against `allowedRole.toLowerCase()`; throw `MedusaError(NOT_ALLOWED, "Forbidden")` if they don't match
- [x] 1.6 Import `MedusaError`, `MedusaErrorTypes`, and `Modules` from `@medusajs/framework/utils`; import `MedusaRequest`, `MedusaNextFunction` from `@medusajs/framework/http`

## 2. Middleware Registration

- [x] 2.1 Create `apps/backend/src/api/middlewares.ts` — the central Medusa middleware router file
- [x] 2.2 Import `defineMiddlewares` from `@medusajs/medusa` and `requireRole` from `./middlewares/require-role`
- [x] 2.3 Register `requireRole("super_admin")` on `POST`, `PUT`, `DELETE` for matcher `/admin/store*`
- [x] 2.4 Register `requireRole("super_admin")` on `POST`, `PUT`, `DELETE` for matcher `/admin/api-keys*`
- [x] 2.5 Register `requireRole("super_admin")` on `POST`, `PUT`, `DELETE` for matcher `/admin/regions*`
- [x] 2.6 Register `requireRole("super_admin")` on `POST`, `PUT`, `DELETE` for matcher `/admin/payment-providers*`
- [x] 2.7 Register `requireRole("super_admin")` on `POST`, `PUT`, `DELETE` for matcher `/admin/settings*`
- [x] 2.8 Export the `defineMiddlewares(...)` call as the default export from `middlewares.ts`

## 3. Verification

- [x] 3.1 Start the backend with `npm run dev` from `apps/backend` and confirm no TypeScript errors on startup
- [x] 3.2 Authenticate as a `super_admin` user (seeded with `metadata: { role: "super_admin" }`) and confirm `POST /admin/store` returns `200`
- [x] 3.3 Authenticate as a `shop_manager` user (seeded with `metadata: { role: "shop_manager" }`) and confirm `POST /admin/store` returns `403 Forbidden`
- [x] 3.4 Confirm `GET /admin/store` returns `200` for `shop_manager` (read access unblocked)
- [x] 3.5 Confirm `POST /admin/products` returns `200` for `shop_manager` (non-sensitive write unblocked)
- [x] 3.6 Confirm `DELETE /admin/api-keys/:id` returns `403` for `shop_manager`
- [x] 3.7 Confirm `DELETE /admin/regions/:id` returns `403` for `shop_manager`
- [x] 3.8 Verify a user with `metadata: { role: "SHOP_MANAGER" }` (uppercase) also receives `403` on restricted endpoints (case-insensitive check)
