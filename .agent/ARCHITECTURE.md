# Architecture Map

This is a map, not a manual — it tells you *where* things are and *how the
pieces talk to each other* so you can let Graphify and the actual source be
the source of truth for line-level detail. Update this file only when the
shape of the system changes (new layer, new module, new event, restructure),
not when logic inside an existing file changes.

## 1. Global Topology (Headless Triad + Data Layer)

Strictly decoupled: frontend and backend are physically separate services
talking only over REST APIs. No shared process, no shared filesystem.

| Layer | Host | Responsibility |
|---|---|---|
| **Edge** | Cloudflare | DNS (`atozcolours.in`), TLS termination, edge-caches high-res paint imagery across India |
| **Presentation** | Vercel | Next.js 15 storefront. Stateless. Renders the white/obsidian UI, manages sessions via cookies, drives the client-side Razorpay checkout modal |
| **Core Commerce** | Railway | Medusa v2 Node.js backend. Exposes Store API (→ storefront) and Admin API (→ dashboard) |
| **Data & Memory** | Railway | PostgreSQL (persistent source of truth: users, product matrices, orders) + Redis (event bus / Pub-Sub for workflows, cart session cache) |

Request flow: Cloudflare → Vercel (storefront render) → Medusa Store/Admin
API on Railway → Postgres/Redis. Payment webhooks come back from Razorpay
directly into the Railway-hosted Medusa backend, not through Vercel.

## 2. Monorepo Layout

```
atoz-colours-store/
├── apps/
│   └── storefront/          # Next.js 15 App Router storefront
│       ├── src/modules/     # Feature-organized UI (products, checkout, layout, common)
│       └── src/lib/         # Constants, data-fetching helpers
├── src/                     # Medusa backend
│   ├── api/
│   │   └── middlewares/     # RBAC + custom route middleware
│   ├── modules/
│   │   └── payment-razorpay-patched/   # Custom payment provider module (see decisions/)
│   ├── subscribers/         # Event subscribers (order.placed → lab slip, etc.)
│   ├── workflows/
│   │   └── hooks/           # Workflow hooks (product validation, etc.)
│   └── scripts/             # Seed scripts, one-off admin/data scripts
├── openspec/
│   └── changes/             # Mandatory proposal-first specs — see §6 below
├── medusa-config.ts          # Module + provider registration
└── .agent/                   # You are here
```

## 3. Domain Data Model (Paint Configurations)

Paint can't be sold like a standard t-shirt — it needs deep variant
matrixing plus a machine-readable payload for the physical mixing lab.

- **Base Product:** e.g. `Dynamicshift Aether`
- **Product Options:** Volume (250ml Aerosol / 500ml Tin / 1L Tin) × Finish
  (Gloss / Matte / Basecoat)
- **Variant Generation:** Medusa's Product Module generates the Cartesian
  product automatically (e.g. `Dynamicshift Aether — 1L Tin — Gloss`).
- **Required variant metadata payload** (validated by the workflow hook in
  §4 before the product ever hits Postgres):

```json
{
  "color_hex": "#1A1A24",
  "mix_ratio": "2:1 Urethane",
  "hazmat_class": "Class 3 Flammable",
  "lab_code": "DYN-AET-001"
}
```

> ⚠️ **Naming discrepancy to resolve:** the original implementation plan
> specified a boolean `hazmat` flag; this architecture doc specifies a
> string field `hazmat_class` (e.g. `"Class 3 Flammable"`). Confirm which is
> actually implemented in `product-validation-hook.ts` before writing new
> code against either name, and log the resolution as a decision record once
> settled — don't silently pick one.

## 4. Modular Medusa v2 Architecture (DI + Workflows)

Medusa v2 uses an isolated dependency-injection container — features aren't
hardcoded together, they're orchestrated via Workflows.

- **Payment Module:** Razorpay is injected as a Payment Provider Module
  (not a legacy v1 plugin). On checkout, Medusa's core delegates to
  `@sgftech/payment-razorpay` (patched — see `decisions/0001`), which talks
  to Indian banking rails for UPI/Card auth and receives webhooks to
  transition order state `pending → captured`.
- **Synchronous Workflow Hook (validation):** when a Shop Manager creates a
  paint product in the Admin dashboard, a workflow hook
  (`src/workflows/hooks/product-validation-hook.ts`) intercepts the request
  *before* it hits Postgres, checks the required metadata fields exist
  (see §3), and aborts the transaction if anything's missing.

## 5. Event-Driven Supply Chain (The Paint Lab)

Order fulfillment requires physical manufacturing, so this runs as an async,
event-driven chain rather than inline in the checkout request:

1. **Trigger:** Razorpay captures payment → Medusa fires `order.placed` onto
   the Redis event bus.
2. **Subscriber:** `src/subscribers/order-placed-lab-slip.ts` listens
   continuously on Redis for this event.
3. **Execution:** on `order.placed`, it queries the order's line items,
   extracts `mix_ratio` and `lab_code` from variant metadata.
4. **Output:** generates a "Paint Mixing Lab Instruction Slip", logged to
   stdout (pipeable to a lab printer or Slack channel later) — deliberately
   scoped to mixing data only, no customer billing info reaches the lab.

## 6. RBAC (Security Boundary)

Segmented via Medusa v2's `auth_context` + custom middleware, because the
Admin dashboard is shared by the business owner and warehouse staff:

- **`super_admin`:** unrestricted — API keys, payment provider config, store
  regions, billing.
- **`shop_manager`:** restricted — inventory and order fulfillment only. Any
  request to a settings/keys/regions/payment-provider endpoint (e.g.
  `/admin/api-keys`) is intercepted by custom middleware, which checks
  `metadata.role` against the User Module via `actor_id` and returns `403`.

See `decisions/` before loosening this boundary in any way.

## 7. UI/UX Paradigm

- **Visual styling:** `shadow-none` and `rounded-none` enforced across
  Tailwind config — no drop shadows, no soft corners anywhere. Palette
  locked to white (`#FFFFFF`) backgrounds, obsidian black (`#0B0B0B`)
  typography/borders, neutral greys for disabled states.
- **Variant interactions (PDP):** selecting volume/finish is client-side
  only — no page reload. React updates URL params and fetches the matching
  variant price from Medusa in place.
- **Image galleries:** masonry-style grid (not a carousel) at
  medium-to-large viewports, so high-gloss car imagery reads as the visual
  focus, not chrome.

Full design-token-level detail → [`CONVENTIONS.md`](./CONVENTIONS.md).

## 8. AI-Assisted Development Stack

Two tools gate how code gets written in this repo — both are mandatory, not
optional conveniences. Full operational workflow → [`AGENTS.md`](./AGENTS.md).

- **Graphify (spatial memory):** the entire backend + frontend is parsed
  into an AST-based dependency graph at `graphify-out/graph.json`. Before
  touching any code, query this graph to understand exact dependency chains
  (e.g. Razorpay module ↔ Cart API) instead of grepping blind.
- **OpenSpec (spec-driven execution):** before writing a single line of
  executable TypeScript, a Markdown proposal describing the architectural
  intent must exist in `openspec/changes/`. This is a hard gate meant to
  prevent hallucinated approaches and keep Medusa v2 module boundaries
  respected — not a formality to skip under time pressure.
