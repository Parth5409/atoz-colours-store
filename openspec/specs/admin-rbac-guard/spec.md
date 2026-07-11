## ADDED Requirements

### Requirement: Role guard resolves user metadata from auth context
The system SHALL extract `actor_id` from `req.auth_context` on every guarded request, resolve the Medusa `USER` module service from the DI container (`req.scope`), and retrieve the user's `metadata.role` field. If `actor_id` is absent or the user record cannot be found, the request SHALL be rejected with a `403 MedusaError(NOT_ALLOWED)`.

#### Scenario: Authenticated super_admin writes to a protected endpoint
- **WHEN** a `POST /admin/store` request arrives with a valid JWT for a user whose `metadata.role` is `"super_admin"`
- **THEN** the middleware SHALL call `next()` and allow the request to proceed to the route handler

#### Scenario: Authenticated shop_manager writes to a protected endpoint
- **WHEN** a `POST /admin/store` request arrives with a valid JWT for a user whose `metadata.role` is `"shop_manager"`
- **THEN** the middleware SHALL throw `MedusaError(MedusaErrorTypes.NOT_ALLOWED, "Forbidden")` resulting in a `403` HTTP response

#### Scenario: Authenticated user with missing role metadata writes to a protected endpoint
- **WHEN** a `DELETE /admin/api-keys/some-id` request arrives for a user whose `metadata` does not contain a `role` key
- **THEN** the middleware SHALL throw `MedusaError(MedusaErrorTypes.NOT_ALLOWED, "Forbidden")` resulting in a `403` HTTP response

#### Scenario: Unauthenticated request reaches a protected endpoint
- **WHEN** a request arrives on `/admin/store` with no `actor_id` in `auth_context`
- **THEN** the middleware SHALL throw `MedusaError(MedusaErrorTypes.NOT_ALLOWED, "Forbidden")` (Medusa's native auth guard will typically have rejected this earlier with a `401`, but the role guard SHALL also reject if `actor_id` is absent)

---

### Requirement: shop_manager retains full read access to all admin endpoints
The system SHALL NOT apply the role guard to HTTP `GET` requests on any admin route, ensuring `shop_manager` users can read store settings, region lists, API key names, payment provider lists, and all other admin resources without restriction.

#### Scenario: shop_manager reads store settings
- **WHEN** a `GET /admin/store` request arrives with a valid JWT for a user whose `metadata.role` is `"shop_manager"`
- **THEN** the middleware SHALL call `next()` and allow the request to proceed unhindered

#### Scenario: shop_manager reads API key list
- **WHEN** a `GET /admin/api-keys` request arrives with a valid JWT for a `shop_manager`
- **THEN** the system SHALL return the API key list with a `200` response; no `403` is thrown

---

### Requirement: shop_manager retains full write access to non-sensitive admin endpoints
The system SHALL NOT apply the `super_admin` role guard to product, variant, collection, order, inventory, and fulfillment write endpoints, ensuring `shop_manager` users can manage catalogue and orders without restriction.

#### Scenario: shop_manager creates a product
- **WHEN** a `POST /admin/products` request arrives with a valid JWT for a `shop_manager`
- **THEN** the middleware SHALL not intercept this route and the request proceeds normally

#### Scenario: shop_manager updates an order
- **WHEN** a `PUT /admin/orders/:id` request arrives with a valid JWT for a `shop_manager`
- **THEN** the request proceeds normally with no role check

---

### Requirement: Sensitive admin write endpoints are exclusively accessible to super_admin
The system SHALL apply the `requireRole("super_admin")` middleware to `POST`, `PUT`, and `DELETE` methods on the following route prefixes:
- `/admin/store*`
- `/admin/api-keys*`
- `/admin/regions*`
- `/admin/payment-providers*`
- `/admin/settings*`

#### Scenario: super_admin deletes a region
- **WHEN** a `DELETE /admin/regions/reg_123` request arrives with a valid JWT for a `super_admin`
- **THEN** the request SHALL proceed to the Medusa handler and the region SHALL be deleted

#### Scenario: shop_manager attempts to delete a region
- **WHEN** a `DELETE /admin/regions/reg_123` request arrives with a valid JWT for a `shop_manager`
- **THEN** the system SHALL respond with `403 Forbidden` and no region is deleted

#### Scenario: shop_manager attempts to create an API key
- **WHEN** a `POST /admin/api-keys` request arrives with a valid JWT for a `shop_manager`
- **THEN** the system SHALL respond with `403 Forbidden` and no API key is created

#### Scenario: shop_manager attempts to reconfigure a payment provider
- **WHEN** a `POST /admin/payment-providers` request arrives with a valid JWT for a `shop_manager`
- **THEN** the system SHALL respond with `403 Forbidden`, protecting the Razorpay provider configuration from unauthorized changes

---

### Requirement: Role comparison is case-insensitive and fault-tolerant
The middleware SHALL normalize the `metadata.role` value using `String(role).toLowerCase()` before comparison to prevent typos in seed data (`"Shop_Manager"`, `"SUPER_ADMIN"`) from accidentally bypassing or blocking access.

#### Scenario: Role value has unexpected casing
- **WHEN** a user's `metadata.role` is stored as `"Super_Admin"` and a `POST /admin/store` request arrives
- **THEN** the middleware SHALL treat this as `"super_admin"` and allow the request through

#### Scenario: Role value is entirely uppercase
- **WHEN** a user's `metadata.role` is `"SHOP_MANAGER"` and a `DELETE /admin/regions/reg_123` request arrives
- **THEN** the middleware SHALL treat this as `"shop_manager"` and reject with `403 Forbidden`
