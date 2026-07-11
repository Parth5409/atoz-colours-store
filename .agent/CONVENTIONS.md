# Conventions

## Design System (non-negotiable)

- **Palette:** crisp white (`#FFFFFF`), off-whites (`#F9F9F9`, `#F5F5F5`),
  obsidian black (`#0B0B0B`), neutral border grey (`#E5E5E5`), muted text
  (`#666666`). No other accent colors unless explicitly approved.
- **Corners:** sharp. Tailwind config enforces `rounded-none` project-wide —
  no `rounded-lg`, no soft cards, no exceptions for "just this one component."
- **Shadows:** `shadow-none` enforced project-wide. No drop shadows on
  cards, buttons, or modals.
- **Borders:** thin and crisp (`border-neutral-200` default, `border-black`
  on active/selected states).
- **Typography:** clean, editorial, high-contrast. Avoid anything that reads
  as a generic Tailwind/shadcn template.
- **Motion:** subtle micro-animations only (hover border-color transitions,
  etc.) — never decorative or attention-grabbing.
- If a UI choice feels "safe/generic e-commerce," it's wrong for this brand.
  Reference: obsidian + white editorial luxury aesthetic — the paint colors
  are the visual focus, the UI chrome should recede.

## Interaction Patterns

- **PDP variant selection (volume/finish):** client-side only, no page
  reload. Update URL params and re-fetch the matching variant price from
  Medusa in place.
- **Product image galleries:** masonry-style grid at medium-to-large
  viewports, not a carousel — let high-gloss imagery read as the focal
  point rather than being boxed into a slider.

## Code Conventions

- TypeScript throughout (backend and storefront) — no plain JS additions.
- Backend: Medusa v2 module/workflow/subscriber patterns only — no
  Express-style ad hoc routes outside `src/api/`.
- Payment/financial logic changes always get a decision record — no silent
  amount-calculation edits.
- Prefer Medusa's typed constants (`Modules.USER`, `ContainerRegistrationKeys.QUERY`,
  etc.) over raw string keys when resolving from the container.

## Commit / Change Hygiene

- One logical change per commit.
- Any commit that touches `payment-razorpay-patched/`, `middlewares/require-role.ts`,
  or `workflows/hooks/product-validation-hook.ts` must reference both its
  OpenSpec proposal (`openspec/changes/`) and the relevant decision record
  in the commit message.
