# Home Page Frontend Update

## Context
We are implementing the new frontend design for the home page of the AtoZ Colours store. This replaces the default Medusa Next.js starter layout with the custom branding and layout shown in the provided mockups.

## Architecture & Module Boundaries
This change is strictly isolated to the presentation layer (`apps/storefront`). It does not modify any core Medusa backend services, API routes, or RBAC boundaries.
- **Nav & Footer**: Updated in `src/modules/layout/templates` to use the new logo, links, and footer design.
- **Home Page Layout**: Re-arranged in `src/app/[countryCode]/(main)/page.tsx` to include new modular sections (Categories, Hero, Top Picks, Why Choose Us, Featured Blogs, FAQ).
- **Home Components**: Added to `src/modules/home/components/`.

## Data Sources
For now, missing dynamic content (Blogs, FAQ, Categories) will be stubbed with static representations matching the design structure. Later, these can be linked to the Medusa backend.

## Security & Performance
- All images will use Next.js `Image` components where appropriate for optimization.
- No changes to RBAC or sensitive data endpoints.
