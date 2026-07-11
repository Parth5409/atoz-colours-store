# Project Overview

## Identity

- **Project Name:** AtoZ Colours
- **Domain:** atozcolours.in
- **Business Model:** Premium automotive paint shop — dynamic colors, pearl
  coatings, and candy neon finishes sold as ready-to-use paint products
  (aerosols and tins). Requires physical manufacturing (paint mixing) that
  triggers on order completion — this isn't a t-shirt store, treat every
  product/order feature with that in mind.
- **Design Benchmark:** High-contrast, clean, light-themed aesthetic. Stark
  white backgrounds, deep obsidian black accents, razor-thin borders, sharp
  (near-zero) corner radii, crisp typography. No generic e-commerce template
  look. Full spec → [`CONVENTIONS.md`](./CONVENTIONS.md).
- **Current State:** Fresh `create-medusa-app@latest` install, being
  overhauled per the plan tracked in `decisions/`.

## Technology Stack

| Layer               | Technology                                  |
|----------------------|-----------------------------------------------|
| Edge / CDN              | Cloudflare (DNS, TLS, image caching)        |
| Frontend storefront    | Next.js 15 (App Router) + Tailwind CSS       |
| Backend engine          | MedusaJS v2 (Node.js)                       |
| Admin dashboard          | Medusa Admin (React/Vite)                    |
| Database                  | PostgreSQL (source of truth)                |
| Cache / Event Bus          | Redis (cart session cache + Pub/Sub)        |
| Payments                    | Razorpay (via patched provider — see decisions) |

Full topology (what each layer actually does and how they talk to each
other) → [`ARCHITECTURE.md`](./ARCHITECTURE.md).

## Environment

- **Local OS:** Fedora Linux
- **Local DB:** PostgreSQL running natively (no Docker)
- **Local webhook testing:** ngrok tunnel to `localhost:9000`

## Deployment Targets

| Component     | Platform    |
|-----------------|--------------|
| Backend           | Railway      |
| Storefront         | Vercel       |
| DNS                 | Cloudflare   |

## Product Domain (quick reference — full glossary in GLOSSARY.md)

- **Sizes:** 250ml Aerosol / 500ml Tin / 1L Tin
- **Finishes:** Gloss / Matte / Basecoat
- **Categories:** Candy Neon Basecoats, Pearl & Shift Coatings, Gloss & Clears
- Variants are a Cartesian product of Size × Finish per base product
  (e.g. "Dynamicshift Aether — 1L Tin — Gloss").

## Roles

- `super_admin` — full admin access, including store settings, API keys,
  regions, payment providers, billing.
- `shop_manager` — products, variants, collections, orders, inventory,
  fulfillment only. Blocked from developer/settings-level endpoints.

## AI-Assisted Development Tooling

This project is developed with two AI guardrail tools working together —
Graphify (spatial memory of the codebase) and OpenSpec (proposal-before-code
discipline). Neither is optional. Full workflow → [`AGENTS.md`](./AGENTS.md).
