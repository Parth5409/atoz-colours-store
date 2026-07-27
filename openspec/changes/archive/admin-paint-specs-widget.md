# Archived OpenSpec - Medusa Admin Paint Specs Widget (Completed)

## Context
The user requested that we outline a plan and implement the backend/admin changes so that store managers can add paint specifications (Color Hex, Mix Ratio, Hazmat Class) directly in the Medusa Admin portal and have them reflect on the customer storefront.

## Status: Completed & Resolved
- Created a React admin widget inside `apps/backend/src/admin/widgets/product-paint-specs.tsx` injected after product details.
- Integrated the fields with the Medusa Admin API `POST /admin/products/:id` to mutate the metadata schema.
