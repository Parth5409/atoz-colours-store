## ADDED Requirements

### Requirement: Seed script creates paint categories
The seed script SHALL create three top-level product categories with stable handles: `candy-neon-basecoats`, `pearl-shift-coatings`, and `gloss-clears`. If a category with a given handle already exists, the script SHALL skip creation and reuse the existing record.

#### Scenario: First-time seed run
- **WHEN** the seed script is executed via `npx medusa exec ./src/scripts/seed-paints.ts` on a database with no existing paint categories
- **THEN** three ProductCategory records are created with the handles `candy-neon-basecoats`, `pearl-shift-coatings`, and `gloss-clears`

#### Scenario: Idempotent re-run
- **WHEN** the seed script is executed a second time on a database that already contains the paint categories
- **THEN** no duplicate categories are created and the script exits successfully

---

### Requirement: Seed script creates paint products with volume variants
For each paint category the seed script SHALL create at least one representative product. Each product SHALL have a single option named `Volume` with values `250ml Aerosol`, `500ml Tin`, and `1L Tin`. Each variant SHALL have a price in INR (currency code `inr`). If a product with the given handle already exists the script SHALL skip creation.

#### Scenario: Candy Neon Basecoat products seeded
- **WHEN** the seed script runs on an empty database
- **THEN** at least three Candy Neon Basecoat products are created (e.g. Candy Apple Red, Lime Neon Green, Electric Orange) under the `candy-neon-basecoats` category, each with three volume variants priced in INR

#### Scenario: Pearl & Shift Coating products seeded
- **WHEN** the seed script runs on an empty database
- **THEN** at least two Pearl & Shift Coating products are created (e.g. Amethyst Flip Pearl, Diamond Blue Flake) under the `pearl-shift-coatings` category, each with three volume variants priced in INR

#### Scenario: Gloss & Clear products seeded
- **WHEN** the seed script runs on an empty database
- **THEN** at least two Gloss & Clear products are created (e.g. Pitch Black Solid Gloss, High Solid Clear Coat) under the `gloss-clears` category, each with three volume variants priced in INR

#### Scenario: Duplicate product handle skipped
- **WHEN** the seed script runs and a product handle (e.g. `candy-apple-red`) already exists in the database
- **THEN** that product is not duplicated and the script continues seeding remaining products

---

### Requirement: Seed script is invocable via Medusa exec
The seed script SHALL export a default async function that accepts the MedusaContainer as its sole argument. It SHALL use container-resolved module services (Product module, Pricing module) to perform all database operations within the framework's transaction model.

#### Scenario: Medusa exec bootstrap
- **WHEN** `npx medusa exec ./src/scripts/seed-paints.ts` is run from `apps/backend/`
- **THEN** the Medusa container is injected, module services resolve successfully, and the script completes without error
