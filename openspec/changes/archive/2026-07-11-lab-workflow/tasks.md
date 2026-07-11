## 1. Seed Script — Structure & Scaffold

- [x]  Create directory `apps/backend/src/scripts/` if it does not exist
- [x]  Create file `apps/backend/src/scripts/seed-paints.ts` with a typed default-export function accepting `MedusaContainer`
- [x]  Resolve `IProductModuleService` from the container using `Modules.PRODUCT`
- [x]  Resolve `IPricingModuleService` from the container using `Modules.PRICING`

## 2. Seed Script — Categories

- [x]  Implement idempotent category upsert: list existing categories by handle; create only those missing from the set `["candy-neon-basecoats", "pearl-shift-coatings", "gloss-clears"]`
- [x]  Define category display names and descriptions for each handle
- [x]  Verify that all three category records exist (with correct handles) after upsert step

## 3. Seed Script — Products & Variants

- [x]  Define the product catalogue as a typed array: name, handle, category handle, `color_hex`, `mix_ratio`, `hazmat_class`, and INR base prices for each of the three volume options
  - Candy Neon Basecoats: Candy Apple Red, Lime Neon Green, Electric Orange
  - Pearl & Shift Coatings: Amethyst Flip Pearl, Diamond Blue Flake
  - Gloss & Clears: Pitch Black Solid Gloss, High Solid Clear Coat
- [x]  For each product definition: check if a product with the given handle already exists; skip if found
- [x]  Create products with `options: [{ title: "Volume" }]` and three variants with `option_values` of `250ml Aerosol`, `500ml Tin`, `1L Tin`
- [x]  Set `metadata` on each product to include `color_hex`, `mix_ratio`, and `hazmat_class` so the product passes the validation hook
- [x]  Link each created product to its corresponding category using the product module's category association API
- [x]  Create a `PriceSet` for each variant and attach INR prices using `IPricingModuleService`
- [x]  Link each PriceSet to its variant using the Product → Pricing module link

## 4. Seed Script — Verification

- [x]  Run `npx medusa exec ./src/scripts/seed-paints.ts` from `apps/backend/` on a local dev database and confirm all three categories appear in the Medusa Admin
- [x]  Confirm at least 8 products are created with the correct Volume option values and INR variant prices
- [x]  Run the script a second time and confirm no duplicate categories or products are created

## 5. Validation Hook — Structure & Registration

- [x]  Create directory `apps/backend/src/workflows/hooks/` if it does not exist
- [x]  Create file `apps/backend/src/workflows/hooks/product-validation-hook.ts`
- [x]  Import `createProductsWorkflow` from `@medusajs/medusa/core-flows`
- [x]  Define the set of paint category handles as a `Set<string>`: `{"candy-neon-basecoats", "pearl-shift-coatings", "gloss-clears"}`
- [x]  Call `createProductsWorkflow.hooks.productsCreated(...)` with an async handler function; confirm the hook is registered (no TypeScript errors)

## 6. Validation Hook — Core Logic

- [x]  In the hook handler, iterate over the incoming `products` array
- [x]  For each product, check whether `product.categories` contains any handle in the paint handle set; skip products with no paint category
- [x]  For paint products, collect all missing fields from `["color_hex", "mix_ratio", "hazmat_class"]` by inspecting `product.metadata`
- [x]  If any fields are missing, throw a `MedusaError` (type `MedusaErrorTypes.INVALID_DATA`) with a message listing all missing field names in a single error (e.g. `"Paint product 'Candy Apple Red' is missing required metadata: mix_ratio, hazmat_class"`)
- [x]  Confirm that throwing inside the hook rolls back the `createProductsWorkflow` transaction (test manually or with a unit test)

## 7. Validation Hook — Testing

- [x]  Test happy path: create a paint product via the Admin API with all three metadata fields present — product is saved successfully
- [x]  Test missing `color_hex`: create a paint product without `color_hex` — API returns a 422 error with a message identifying `color_hex` as missing
- [x]  Test missing `mix_ratio`: create a paint product without `mix_ratio` — API returns a 422 error with `mix_ratio` in the message
- [x]  Test missing `hazmat_class`: create a paint product without `hazmat_class` — API returns a 422 error with `hazmat_class` in the message
- [x]  Test `hazmat` ≠ `hazmat_class`: create a paint product with `metadata.hazmat` set but `metadata.hazmat_class` absent — product is rejected (confirms canonical key enforcement)
- [x]  Test non-paint product: create a product with no categories — product is saved with no metadata without triggering the hook
- [x]  Test multiple missing fields produce a single error: create a paint product with only `color_hex` set — one `MedusaError` names both `mix_ratio` and `hazmat_class`

## 8. Type Safety & Linting

- [x]  Run `npm run build` (or `tsc --noEmit`) from `apps/backend/` and resolve any TypeScript errors in the new files
- [x]  Ensure no `any` types are used in the hook or seed script; use Medusa's typed module service interfaces throughout
- [x]  Run `npm run lint` from the monorepo root and fix any ESLint violations
