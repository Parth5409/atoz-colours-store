# OpenSpec Change: Product Image Differentiation & Dynamic Swatch Support

## Context
The user reported that all products currently display the exact same cover image and gallery images across the storefront and admin dashboard.

## Root Cause Analysis
1. `color-form.tsx` hardcoded a single Unsplash sports car URL (`photo-1617814076367-b759c7d7e738`) as the default state for `coverImageUrl`.
2. `sanitizeUrl()` in `color-form.tsx` indiscriminately converted all `data:` URLs to that same hardcoded Unsplash URL to prevent PostgreSQL B-Tree 8191-byte index errors.
3. Every product created or edited without an explicit `http://` URL inherited this identical cover image.

## Solution Architecture
1. **Dynamic SVG Swatch Graphic Generator**:
   - For products without an external image URL, generate a clean SVG data URI (`data:image/svg+xml;utf8,...`) incorporating the product's `hexColor`, `title`, and `brand`.
   - SVG data URIs are ~300 bytes (well below PostgreSQL's 8191-byte index limit), eliminating 500 errors while providing each product with a distinct color visual.
2. **URL Preserving Sanitize Logic (`color-form.tsx`)**:
   - If the user provides a valid `http://` or `https://` URL, preserve it.
   - If the user provides a short `data:` URI (< 6,000 bytes), preserve it.
   - If a `data:` URI exceeds 6,000 bytes or is omitted, fall back to the color-matched SVG graphic for that specific product instead of a shared static image.
3. **Database Image Backfill Script (`apps/backend/src/scripts/update-product-images.ts`)**:
   - Update all existing products in the Medusa backend database with distinct, color-specific image URLs and SVG graphics.

## Verification
- Run script to update database product thumbnails.
- Edit existing product in Admin Dashboard and assign unique image URL / swatch.
- Inspect Storefront `/store` and PDP (`/products/[handle]`) to verify distinct images for each product.
