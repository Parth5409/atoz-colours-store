# Archived OpenSpec - Add Navbar Dropdowns (Completed)

## Context
The user requested adding dropdown selections to two specific links in the main navigation bar:
1. "Colour Changing" with options: "Dynamicshift", "Colorshift", "Lazerghost"
2. "Pearls" with options: "Crystal Pearls", "Vivid pearls"

## Status: Completed & Resolved
- Implemented via custom `.hover-dropdown`, `.dropdown-menu`, and `.dropdown-arrow` classes in `globals.css` to avoid global navbar hover triggers and bypass Tailwind v3.0 limitations.
- Integrated successfully in `apps/storefront/src/modules/layout/templates/nav/index.tsx`.
