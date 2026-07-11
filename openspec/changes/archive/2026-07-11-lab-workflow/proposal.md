## Why

AtoZ Colours sells domain-specific automotive paint products (Candy Neons, Pearl & Shift Coatings, Gloss & Clears) that require paint-lab metadata (mix ratios, colour codes, hazmat classification) to be present and correct on every product record from the moment it is created. Without a seeded catalogue and enforced validation at write-time, the backend can accumulate incomplete product records that break the downstream lab-slip subscriber and expose customers to listings with missing safety information. Both gaps need to be closed before any paint SKU goes live.

## What Changes

- **New seeding script** `apps/backend/src/scripts/seed-paints.ts` — populates three paint categories (Candy Neon Basecoats, Pearl & Shift Coatings, Gloss & Clears) with representative SKUs matrixed across volume options (250ml, 500ml, 1L) at accurate INR base prices; invocable via `npx medusa exec ./src/scripts/seed-paints.ts`.
- **New workflow hook** `apps/backend/src/workflows/hooks/product-validation-hook.ts` — registers on `createProductsWorkflow.hooks.productsCreated` and synchronously validates that any product in a paint category carries all three mandatory metadata fields: `color_hex`, `mix_ratio`, and `hazmat_class`; throws a structured `MedusaError` and rolls back the enclosing transaction if any field is absent.
- **Metadata field standardisation** — adopts `hazmat_class` (not `hazmat`) as the canonical metadata key name, resolving the naming discrepancy flagged in `ARCHITECTURE.md §3`.

## Capabilities

### New Capabilities

- `paint-catalogue-seed`: Seeding script that inserts canonical paint categories and volume-variant product data into the Medusa database for local dev and staging environments.
- `paint-product-validation`: Synchronous workflow hook that enforces the required paint metadata schema (`color_hex`, `mix_ratio`, `hazmat_class`) on every product creation event targeting paint categories, rolling back on failure.

### Modified Capabilities

<!-- No existing spec-level requirement changes. -->

## Impact

- **`apps/backend/src/scripts/`** — new directory; `seed-paints.ts` added.
- **`apps/backend/src/workflows/hooks/`** — new directory under the existing `workflows/` stub; `product-validation-hook.ts` added.
- **Medusa workflow layer** — `createProductsWorkflow` (from `@medusajs/medusa/core-flows`) gains a hook registration; no modification to the workflow itself.
- **Product data model** — three new `ProductCategory` records; products with `options` (Volume) and variants with INR prices; all managed via Medusa's Product and Pricing modules — no schema migrations required.
- **`hazmat_class` naming** — downstream code reading `hazmat` on variant metadata (e.g. the order-placed lab-slip subscriber) will need to be updated to use `hazmat_class`; flagged as a follow-up for that subscriber's own change.
- **Dependencies** — no new npm packages needed; uses `@medusajs/framework`, `@medusajs/medusa/core-flows`, and the Medusa container pattern already present in the project.
