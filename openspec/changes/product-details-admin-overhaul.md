# Product Details & Admin Form Overhaul

## Context
We are overhauling the Product Details Page (PDP) on the storefront and creating an interactive, modern Admin Product Creation Experience based on the user's design requirements.

## Architecture & Module Boundaries
This change touches the presentation layer (`apps/storefront`):
1. **Admin Product Form (`apps/storefront/src/app/[countryCode]/admin/components/color-form.tsx`)**:
   - Redesigned into an interactive, 5-tab wizard:
     - `General & Visuals`: Brand, Title, Slug, Category, HEX Swatch Picker.
     - `Technical Specs`: Primary Base Color, Mix Ratio, Particle Size, Hazmat Class.
     - `Application Guide`: Test Sample Note, Top Coat Clear Title & Instructions.
     - `Media & Image Gallery`: Direct Image URL inputs, primary cover image selection, and live thumbnail grid previews.
     - `Pricing & Volume Variants`: Base price, dynamic price scaling, stock levels per size.
   - Features a **Live Real-time PDP Preview Card** on the right sidebar updating as the admin types.

2. **Admin Dashboard (`apps/storefront/src/app/[countryCode]/admin/dashboard/page.tsx`)**:
   - Modernized with KPI overview cards, category filter chips, search bar, and a toggleable Grid/Table view of all paint products with live color swatch badges.

3. **Storefront PDP (`apps/storefront/src/modules/products/...`)**:
   - Updated layout displaying brand, title, technical specs, application guides, volume option pills (`300ml`, `500ml`, `1L`), action buttons, and store pickup availability note.

## Data Sources & Metadata Contract
- `thumbnail`: string (Primary cover image URL)
- `images`: array of `{ url: string }`
- `metadata.brand`: string
- `metadata.color_hex`: string
- `metadata.primary_base_color`: string
- `metadata.mix_ratio`: string
- `metadata.particle_size`: string
- `metadata.test_sample_note`: string
- `metadata.top_coat_title`: string
- `metadata.top_coat_desc`: string
- `metadata.pickup_info`: string
- `metadata.image_url`: string

