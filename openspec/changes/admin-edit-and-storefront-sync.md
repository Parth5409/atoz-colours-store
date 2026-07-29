# OpenSpec Change: Admin Edit Functionality & Storefront Real-time Reflection

## Context
The user requested two critical capabilities:
1. Admin Panel changes/additions must reflect dynamically on the client-side website (storefront home, store list, PDP).
2. Admin Panel must include an Edit functionality to update existing paint products and their technical specs/variants.

## Architecture & Scope
This change modifies `@lib/data/admin.ts`, `ColorForm`, `AdminDashboardPage`, and `FeaturedProducts` in `apps/storefront`:

1. **Admin Data Layer (`apps/storefront/src/lib/data/admin.ts`)**:
   - Add `updateAdminProduct(productId: string, payload: any)` server action.
   - Ensure `createAdminProduct` and `updateAdminProduct` properly trigger revalidation tags and paths (`revalidateTag("products")`, `revalidatePath`).
   - Automatically assign products to the store's sales channels if necessary.

2. **Admin Form Component (`apps/storefront/src/app/[countryCode]/admin/components/color-form.tsx`)**:
   - Enhance `ColorForm` to support dual modes: **Add Product** vs **Edit Product**.
   - Pre-fill state when `productToEdit` prop is supplied (Title, Handle, Description, Brand, Color HEX, Tech Specs, Application Guides, Base Price, Cover Image, Gallery URLs).
   - Execute `updateAdminProduct` on submit when editing, or `createAdminProduct` when creating.

3. **Admin Dashboard (`apps/storefront/src/app/[countryCode]/admin/dashboard/page.tsx`)**:
   - Add Edit buttons to product grid cards and table view rows.
   - Add `editingProduct` state to manage the active edit modal context.

4. **Storefront Featured Products (`apps/storefront/src/modules/home/components/featured-products/index.tsx`)**:
   - Connect homepage top picks section to fetch real products from `listProducts` instead of static mock data.

## Verification Plan
- Create/Edit paint product via Admin Dashboard.
- Verify changes are persisted in Medusa backend.
- Verify live reflection on `/store`, homepage top picks, and PDP (`/products/[handle]`).
