# OpenSpec Change: Category-Wise Storefront Navigation & Store Page Transformation

## Context
The user requested to remove the generic all-product `/store` page dump and display products categorized section-by-section across the client side storefront.

## Architectural Changes
1. **Nav Header (`apps/storefront/src/modules/layout/templates/nav/index.tsx`)**:
   - Update all navigation links (Paint Shop, Colour Changing, Pearls, Candy, Neons, Metal Flake, Premix) to target explicit category handles (`/categories/candy`, `/categories/colour-changing`, etc.).
   - Replace any links pointing to `/store` with category URLs.

2. **Categorized Store Layout (`apps/storefront/src/modules/store/templates/index.tsx`)**:
   - Replace the single flat product list with a structured **Category-Wise Showcase**.
   - Fetch main categories via `listCategories()` and render distinct sections for each category (Colour Changing, Pearls, Candy, Neons, Metal Flake, Premix).
   - Display product cards belonging to each category, complete with category headers, description tags, color swatches, and "Explore Category" quick action buttons.

3. **Store Page Route (`apps/storefront/src/app/[countryCode]/(main)/store/page.tsx`)**:
   - Pass category data down to render the categorized view instead of an uncategorized flat grid.

## Verification
- Test navigation dropdowns to confirm category links route to `/categories/...`.
- Load `/store` and verify products are neatly grouped under category headers.
