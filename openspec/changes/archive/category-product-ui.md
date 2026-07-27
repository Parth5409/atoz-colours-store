# Archived OpenSpec - Category & Product Pages UI Redesign (Completed)

## Context
The user requested a premium frontend redesign of category list pages and product detail pages, ensuring they display properties, options, prices, quantity selectors, and adhere to the project's light-minimalist aesthetic.

## Status: Completed & Resolved
- Redesigned Variant Buttons in `option-select.tsx` to use sharp corners (`rounded-none`), crisp borders, and obsidian black highlights.
- Implemented stateful client-side Quantity Selector in `product-actions/index.tsx` passing quantities to `addToCart`.
- Created a Paint Specifications table under the product description inside `product-info/index.tsx` presenting color swatches, mix ratios, and hazard classifications.
- Restructured Category headers/breadcrumbs in `categories/templates/index.tsx` with thin crisp margins.
- Displayed color swatches and mix ratio specs on individual product listing cards in `product-preview/index.tsx`.
