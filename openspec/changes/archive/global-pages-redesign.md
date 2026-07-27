# Archived OpenSpec - Global Storefront Pages Redesign (Completed)

## Context
The user requested that we extend the premium light-minimalist aesthetic (sharp corners, zero shadows, stark high-contrast borders) to all remaining pages (Cart, Checkout, Collections, and Account).

## Status: Completed & Resolved
- Enforced zero border-radius (`0px`) and disabled shadows globally in `tailwind.config.js`.
- Appended global CSS element rules in `globals.css` to override third-party UI widgets and default component margins.
- Restructured `CollectionTemplate` header elements in `collections/templates/index.tsx` to match redesigned categories.
