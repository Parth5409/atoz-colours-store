## Context

The AtoZ Colours backend (Medusa v2, monorepo at `apps/backend/`) currently has no paint-specific product data or validation. The `createProductsWorkflow` is used out of the box without any hook registrations. A lab-slip subscriber (`order-placed-lab-slip.ts`) exists as a planned feature that expects paint metadata to be present on product variants, but nothing guarantees those fields are actually populated. The `src/workflows/` directory is stubbed with only a `README.md`.

The naming discrepancy between `hazmat` and `hazmat_class` (flagged in `ARCHITECTURE.md §3`) must be resolved before this hook ships — this design canonicalises `hazmat_class`.

## Goals / Non-Goals

**Goals:**
- Provide a one-command seed script (`npx medusa exec ./src/scripts/seed-paints.ts`) that creates three paint categories and representative products with volume variants at accurate INR prices.
- Enforce at product-creation time that any product in a paint category carries `color_hex`, `mix_ratio`, and `hazmat_class` in its metadata; roll back and surface a structured error if they are missing.
- Standardise the `hazmat_class` metadata key name across all new code.

**Non-Goals:**
- Updating the existing `order-placed-lab-slip.ts` subscriber to use `hazmat_class` (flagged as a follow-up task).
- Storefront UI changes.
- Product update validation (only creation is in scope per the request).
- Seeding admin users (covered by the earlier `seed.ts`).

## Decisions

### Decision 1 — Hook registration location: standalone file vs. inline in a workflow file

**Choice:** A dedicated file `apps/backend/src/workflows/hooks/product-validation-hook.ts` that is imported at application startup via Medusa's auto-discovery of files under `src/workflows/`.

**Rationale:** Medusa v2's file-system loader auto-discovers and executes any module exported from `src/workflows/**`. A standalone hook file keeps the registration concern isolated from any particular workflow definition, and matches the pattern used in Medusa's own examples. Inline registration inside a copied workflow file would require forking core code.

**Alternative considered:** Registering the hook inside a custom workflow that wraps `createProductsWorkflow` — rejected because it would bypass the standard product creation API path used by the Admin UI and storefront.

---

### Decision 2 — Validation error type: `MedusaError` vs. throwing plain `Error`

**Choice:** `MedusaError` with `MedusaErrorTypes.INVALID_DATA`.

**Rationale:** Medusa's error middleware maps `MedusaError` instances to structured JSON responses with the correct HTTP status code (422). A plain `Error` would produce a 500, which is misleading and harder to handle on the client. Using the framework's own error class also ensures the error is logged consistently.

---

### Decision 3 — Seed script: using Medusa exec vs. a standalone Node script

**Choice:** Medusa exec (`npx medusa exec`) with the Medusa container injected.

**Rationale:** The seed script needs to call Medusa's Product and Pricing modules through the IoC container to stay within the framework's transaction model and avoid raw SQL. `medusa exec` bootstraps the container and passes it to the script's default export function, which is exactly the pattern Medusa v2 documents for seeding. A standalone Node script would require duplicating the connection setup and bypassing the module abstraction layer.

---

### Decision 4 — Category matching strategy in the hook: category slug vs. category title

**Choice:** Match on the product category's `handle` (slug) using a known set of paint category handles: `candy-neon-basecoats`, `pearl-shift-coatings`, `gloss-clears`.

**Rationale:** Handles are URL-safe, stable identifiers that the seed script controls. Title matching is fragile to capitalisation changes or internationalisation. The hook will retrieve the product's categories from the resolved product object and check if any handle intersects the paint handle set.

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| Hook fires on products created before the seed script runs (no categories yet) | The hook checks `product.categories`; if empty or not in the paint handle set, validation is skipped — safe. |
| `createProductsWorkflow` hook API changes between Medusa minor versions | Pin Medusa version in `package.json`; document in `decisions/`. |
| Seed script run multiple times creates duplicate categories/products | Use `upsert`-style logic: check for existing category by handle before creating; skip products whose `handle` already exists. |
| `hazmat_class` rename breaks the future lab-slip subscriber | Flagged as explicit follow-up; the subscriber is not yet implemented, so no runtime breakage today. |
| Metadata is stored as free-form JSON — `color_hex` format is not strongly typed | The hook validates *presence* only; format validation (e.g. hex regex) is left as a future enhancement to avoid over-constraining initial data entry. |

## Migration Plan

1. Run `npx medusa exec ./src/scripts/seed-paints.ts` once after deploying to populate categories and products.
2. Hook file is auto-discovered at server startup — no manual registration step.
3. No database migrations required (categories and products use existing Medusa schema).
4. Rollback: delete the hook file and restart the server; the seed data is inert without the hook.

## Open Questions

- **Minimum price floor**: The brief says "accurate base INR pricing". Should the seed script use the exact prices from the AtoZPlan.md description or are there updated price sheets to reference? *(Proceeding with representative prices based on project context; easily changed in `seed-paints.ts`.)*
- **Aerosol vs. Tin distinction**: The existing plan distinguishes 250ml Aerosol vs. 500ml/1L Tin as separate option values. Should the Volume option encode the container type (e.g. `250ml Aerosol`) or should container type be a separate option? *(Proceeding with combined Volume+Type labels matching `AtoZPlan.md`.)*
