# ADR 0002: Standardization on `hazmat_class` for Paint Product Metadata

## Status
Accepted

## Context
During the implementation of the `lab-workflow` feature for automotive paint data structures, there was a discrepancy identified in `ARCHITECTURE.md` §3 regarding the metadata key used to track hazardous material classifications. The legacy/discrepant usages included both `hazmat` and `hazmat_class`. A standardized key is required for the Medusa validation hooks to reliably verify incoming product payloads.

## Decision
We will exclusively use `hazmat_class` as the canonical metadata key for hazardous material classifications. All validation hooks, including `createProductsWorkflow.hooks.productsCreated`, enforce the presence and non-emptiness of `metadata.hazmat_class`. The key `hazmat` is officially deprecated and will cause validation errors if used in place of `hazmat_class`.

## Consequences
- Paint products created via the Admin or custom seeding scripts must specify `hazmat_class` within their metadata.
- Attempts to use the `hazmat` key without `hazmat_class` will be rejected by the validation hook with a `MedusaError.Types.INVALID_DATA`.
- Front-end and downstream integrations that check for hazardous materials must query `metadata.hazmat_class`.
