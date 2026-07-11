## ADDED Requirements

### Requirement: Hook registers on productsCreated
The system SHALL register a synchronous workflow hook on `createProductsWorkflow.hooks.productsCreated`. The hook file SHALL be auto-discovered by Medusa's file-system loader from `apps/backend/src/workflows/hooks/product-validation-hook.ts`.

#### Scenario: Hook registration at server startup
- **WHEN** the Medusa backend server starts
- **THEN** the `productsCreated` hook on `createProductsWorkflow` has at least one registered handler (the paint validation handler)

---

### Requirement: Hook validates paint metadata on product creation
For any product created whose categories include a handle from the paint category set (`candy-neon-basecoats`, `pearl-shift-coatings`, `gloss-clears`), the hook SHALL verify that the product's `metadata` object contains all three mandatory fields: `color_hex`, `mix_ratio`, and `hazmat_class`. Each field SHALL be a non-null, non-empty string.

#### Scenario: Valid paint product passes validation
- **WHEN** a product is created with category handle `candy-neon-basecoats` and `metadata` containing `color_hex`, `mix_ratio`, and `hazmat_class` as non-empty strings
- **THEN** the hook completes without error and the product is persisted

#### Scenario: Paint product missing color_hex is rejected
- **WHEN** a product is created with a paint category handle and `metadata` that lacks `color_hex`
- **THEN** the hook throws a `MedusaError` of type `INVALID_DATA`, the message identifies `color_hex` as missing, and the product creation transaction is rolled back

#### Scenario: Paint product missing mix_ratio is rejected
- **WHEN** a product is created with a paint category handle and `metadata` that lacks `mix_ratio`
- **THEN** the hook throws a `MedusaError` of type `INVALID_DATA`, the message identifies `mix_ratio` as missing, and the product creation transaction is rolled back

#### Scenario: Paint product missing hazmat_class is rejected
- **WHEN** a product is created with a paint category handle and `metadata` that lacks `hazmat_class`
- **THEN** the hook throws a `MedusaError` of type `INVALID_DATA`, the message identifies `hazmat_class` as missing, and the product creation transaction is rolled back

#### Scenario: Non-paint product bypasses validation
- **WHEN** a product is created with no categories, or with categories that do not include any paint handle
- **THEN** the hook completes without error regardless of the product's metadata content

---

### Requirement: Hook uses hazmat_class as the canonical metadata key
All paint metadata validation and documentation SHALL use `hazmat_class` as the field name, not `hazmat`. This resolves the naming ambiguity flagged in the architecture documentation.

#### Scenario: hazmat_class key is checked, not hazmat
- **WHEN** a paint product is created with `metadata.hazmat` set but `metadata.hazmat_class` absent
- **THEN** the hook treats `hazmat_class` as missing and rejects the product creation

#### Scenario: hazmat_class present satisfies validation
- **WHEN** a paint product is created with `metadata.hazmat_class` set to a non-empty string (e.g. `"Class 3 Flammable"`)
- **THEN** the hook accepts the record without error

---

### Requirement: Validation error is a structured MedusaError
The hook SHALL throw a `MedusaError` (from `@medusajs/framework/utils`) with type `MedusaErrorTypes.INVALID_DATA`. The error message SHALL list all missing fields in a single error, not one error per missing field.

#### Scenario: Multiple missing fields produce one error
- **WHEN** a paint product is created with `metadata` missing both `mix_ratio` and `hazmat_class`
- **THEN** a single `MedusaError` is thrown with a message naming both missing fields (e.g. `"Paint product is missing required metadata: mix_ratio, hazmat_class"`)
