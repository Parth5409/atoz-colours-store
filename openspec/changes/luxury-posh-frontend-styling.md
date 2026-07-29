# OpenSpec Change: Premium Luxury Posh CSS Styling Overhaul

## Context
The user requested to overhaul the frontend CSS styling to make the website visually stunning, attractive, luxurious, and "posh", while keeping all existing component logic, backend APIs, data structures, and functionality unchanged.

## Architectural Scope
This change modifies strictly CSS styling assets and Tailwind configuration (`apps/storefront`):
1. **Tailwind Configuration (`apps/storefront/tailwind.config.js`)**:
   - Restore smooth luxury border radius tokens (`soft: 8px`, `base: 12px`, `rounded: 16px`, `large: 24px`).
   - Restore rich elevation shadows (`sm`, `md`, `lg`, `xl`, `2xl`, `glow`) with subtle dark ambient lighting.
   - Add luxury color palette extensions (Obsidian Midnight, Metallic Gold, Cyan Neon, Deep Emerald).
2. **Global CSS & Luxury Design System (`apps/storefront/src/styles/globals.css`)**:
   - Remove aggressive `!important` 0px border-radius and shadow-stripping overrides.
   - Introduce Google Fonts (`Outfit` & `Plus Jakarta Sans`) for modern luxury typography.
   - Add CSS utility classes for **Glassmorphism**, **Metallic Gradient Text**, **Glowing Badges**, and **Card Hover Elevation**.
3. **Storefront Layouts & Components Styling Touchups**:
   - Apply glassmorphic backdrop filters, smooth hover card animations, ambient glow highlights, and posh badge styling across header nav, category sections, product cards, and footers.

## Verification
- Run `npx tsc --noEmit` on storefront to ensure zero build errors.
- Visual inspection via browser subagent to verify high-end luxury aesthetic.
