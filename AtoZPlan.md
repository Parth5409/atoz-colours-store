# Implementation Plan: AtoZ Colours Store Overhaul

This document outlines the step-by-step engineering plan to overhaul the freshly installed MedusaJS v2 backend and Next.js 15 storefront into a production-ready, ultra-minimalist e-commerce platform for AtoZ Colours, featuring Razorpay payment integration, a stark high-contrast visual design, role-based access control, and specialized automotive paint business logic on the backend.

---

## Goal Description
Overhaul the monorepo workspace (`atoz-colours-store`) to:
1. Establish a premium light-minimalist aesthetic (stark white backgrounds, obsidian black typography, razor-thin borders, sharp corners, and micro-animations).
2. Optimize variant selection (Size: 250ml Aerosol / 500ml Tin / 1L Tin; Finish: Gloss / Matte / Basecoat) and transform the product image galleries into an elegant grid layout.
3. Integrate Razorpay on the backend and frontend checkout flows.
4. Implement Role-Based Access Control (RBAC) in the Medusa Admin via custom API route middleware based on user metadata.
5. Extend the backend with custom event subscribers, metadata validations, and seeding scripts tailor-made for custom automotive paint ordering.

---

## User Review Required

> [!WARNING]
> **Razorpay Amount Calculation Bug in `@sgftech/payment-razorpay`**
> By analyzing the npm package source code of the community Razorpay plugin, we identified a critical bug in `initiatePayment`:
> ```typescript
> let toPay = getAmountFromSmallestUnit(amount, "INR"); // 1000 paise -> 10 INR
> toPay = currency_code.toUpperCase() == "INR" ? toPay * 100 * 100 : toPay; // 10 * 10000 = 100000 paise (Rs 1000!)
> ```
> This causes the payment session to create orders that charge the customer **100x the actual amount**. To resolve this without editing files directly in `node_modules` (which gets overwritten on clean installs), we will **patch the package using a custom backend module** (inheriting from the base class and overriding `initiatePayment` to correct the amount multiplication to `toPay * 100` for INR). We recommend the subclass override approach as it is clean, native, and maintains dependency integrity.

> [!IMPORTANT]
> **Role-Based Access Control (RBAC)**
> In Medusa v2, user authorization is metadata-driven. We will create custom route middleware (`./src/api/middlewares.ts`) that intercepts `/admin/*` requests. 
> - Users with `metadata.role === "super_admin"` will have full access.
> - Users with `metadata.role === "shop_manager"` will be blocked (returning a `403 Forbidden` response) when trying to access developer configs, API keys, global store settings, regions, and billing endpoints. They will retain access to products, variants, collections, orders, inventory, and fulfillment.

---

## Architectural Decisions & Environment

1. **Local Webhook Testing:** Use `ngrok` for tunnel testing. Expose the local Medusa backend using `ngrok http 9000` to receive Razorpay's webhook events at `https://<your-ngrok-subdomain>.ngrok-free.app/hooks/payment/razorpay_razorpay`.
2. **Branding Assets:** Use text-based SVG branding (stark black and white typography) for the header and checkout assets to maintain the "stark minimal" aesthetic without loading image files.
3. **Admin User Creation:** Write a custom seed script and run it using the Medusa v2 execution command: `npx medusa exec ./src/scripts/seed.ts`.

---

## Proposed Changes

### 1. Style & Theming Overhaul (Next.js Storefront)

#### [MODIFY] [tailwind.config.js](file:///home/parth/Programming/Projects/atoz-colours-store/apps/storefront/tailwind.config.js)
* Customize the typography, drop shadows, and border-radius keys. Set `borderRadius` for `soft`, `base`, and `rounded` to `0px` or `1px` to enforce the razor-sharp aesthetic.
* Extend color palettes to map default UI variables to crisp white (`#FFFFFF`), neutral off-whites (`#F9F9F9`, `#F5F5F5`), and obsidian blacks (`#0B0B0B`).

#### [MODIFY] [globals.css](file:///home/parth/Programming/Projects/atoz-colours-store/apps/storefront/src/styles/globals.css)
* Add global overrides for Tailwind utility layers.
* Update `@layer components` to use high-contrast rules. Override default `@medusajs/ui` variables with CSS custom properties:
  - `--ui-bg-base`: `#FFFFFF`
  - `--ui-bg-subtle`: `#F9F9F9`
  - `--ui-border-base`: `#E5E5E5`
  - `--ui-fg-base`: `#0B0B0B`
  - `--ui-fg-subtle`: `#666666`

#### [MODIFY] [index.tsx](file:///home/parth/Programming/Projects/atoz-colours-store/apps/storefront/src/modules/common/components/ui/index.tsx)
* Enforce outline/high-contrast styles on standard `Button`, `Input`, and `Container` components.
* Eliminate default cards shadows (`shadow-elevation-card-rest`) and rounded corners.

#### [MODIFY] [index.tsx](file:///home/parth/Programming/Projects/atoz-colours-store/apps/storefront/src/modules/layout/templates/nav/index.tsx)
* Change store title to "AtoZ Colours".
* Clean header border lines to thin crisp outlines.

---

### 2. Product Variant & Gallery UI (PDP)

#### [MODIFY] [option-select.tsx](file:///home/parth/Programming/Projects/atoz-colours-store/apps/storefront/src/modules/products/components/product-actions/option-select.tsx)
* Modify option selector button styles:
  - Default: stark white background, thin border (`border-neutral-200`), text black, sharp corners (`rounded-none`).
  - Active/Selected: obsidian black background, black border (`border-black`), text white (`text-white`).
  - Add subtle hover micro-animations (e.g., borders turning dark grey and smooth transitions).

#### [MODIFY] [index.tsx](file:///home/parth/Programming/Projects/atoz-colours-store/apps/storefront/src/modules/products/components/image-gallery/index.tsx)
* Restructure vertical layout list of images into a stark, clean grid layout:
  - On medium screens and larger, display images as a 2-column grid (`grid grid-cols-2 gap-2 bg-white`).
  - Remove parent paddings and rounded containers to allow vibrant car paint colors to pop against the white page background.

---

### 3. Razorpay Payment Integration (Backend & Frontend)

#### [MODIFY] [package.json](file:///home/parth/Programming/Projects/atoz-colours-store/package.json)
* Install `@sgftech/payment-razorpay` as a backend dependency.

#### [MODIFY] [medusa-config.ts](file:///home/parth/Programming/Projects/atoz-colours-store/medusa-config.ts)
* Configure `@medusajs/medusa/payment` module options to add the Razorpay provider in the correct Medusa v2 nested structure:
  ```typescript
  modules: [
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "./src/modules/payment-razorpay-patched", 
            id: "razorpay",
            options: {
              key_id: process.env.RAZORPAY_ID,
              key_secret: process.env.RAZORPAY_SECRET,
              webhook_secret: process.env.RAZORPAY_WEBHOOK_SECRET,
            }
          }
        ]
      }
    }
  ]
  ```

#### [NEW] [index.ts](file:///home/parth/Programming/Projects/atoz-colours-store/src/modules/payment-razorpay-patched/index.ts)
* Create the custom payment provider registration wrapper that exports a `ModuleProvider` wrapping the service, so that Medusa's module loader resolves the provider:
  ```typescript
  import RazorpayPatchedService from "./services/razorpay-patched"
  import { ModuleProvider, Modules } from "@medusajs/framework/utils"

  export default ModuleProvider(Modules.PAYMENT, { 
    services: [RazorpayPatchedService] 
  })
  ```

#### [NEW] [razorpay-patched.ts](file:///home/parth/Programming/Projects/atoz-colours-store/src/modules/payment-razorpay-patched/services/razorpay-patched.ts)
* Create the subclassed payment provider service class `RazorpayPatchedService` that inherits from `@sgftech/payment-razorpay/dist/services/razorpay-provider` and overrides the `initiatePayment` method to fix the amount multiplication logic (using `toPay * 100` instead of `toPay * 100 * 100` for INR).

#### [MODIFY] [.env](file:///home/parth/Programming/Projects/atoz-colours-store/.env) & [.env.template](file:///home/parth/Programming/Projects/atoz-colours-store/.env.template)
* Define backend credentials: `RAZORPAY_ID`, `RAZORPAY_SECRET`, `RAZORPAY_ACCOUNT`, `RAZORPAY_WEBHOOK_SECRET`.

#### [MODIFY] [.env.local](file:///home/parth/Programming/Projects/atoz-colours-store/apps/storefront/.env.local)
* Map public settings: `NEXT_PUBLIC_RAZORPAY_KEY` and default region code `NEXT_PUBLIC_DEFAULT_REGION=in`.

#### [MODIFY] [constants.tsx](file:///home/parth/Programming/Projects/atoz-colours-store/apps/storefront/src/lib/constants.tsx)
* Declare `isRazorpay` helper and add `razorpay` mapping to `paymentInfoMap` with icons.

#### [NEW] [razorpay-payment-button.tsx](file:///home/parth/Programming/Projects/atoz-colours-store/apps/storefront/src/modules/checkout/components/payment-button/razorpay-payment-button.tsx)
* Implement custom client component button utilizing Razorpay checkout script (loaded via `next/script` or dynamically).
* Initiate checkout modal with Cart parameters, prefilled name/email, and matching obsidian black theme styles. Handle callbacks for payment completion (`placeOrder()`).

#### [MODIFY] [index.tsx](file:///home/parth/Programming/Projects/atoz-colours-store/apps/storefront/src/modules/checkout/components/payment-button/index.tsx)
* Append the `razorpay` provider case to return `<RazorpayPaymentButton session={paymentSession} ... />`.

#### [MODIFY] [index.tsx](file:///home/parth/Programming/Projects/atoz-colours-store/apps/storefront/src/modules/checkout/components/payment/index.tsx)
* Modify the payment initiation call to pass the entire cart context (`extra: cart` inside the `context` parameter) so that the custom backend Razorpay provider successfully retrieves the billing addresses and phone numbers required by Razorpay Customer API.

---

### 4. Admin Role-Based Access Control (RBAC)

#### [NEW] [require-role.ts](file:///home/parth/Programming/Projects/atoz-colours-store/src/api/middlewares/require-role.ts)
* Middleware checking `req.auth_context`. If an `actor_id` exists, resolve the User Module service using the type-safe constant `Modules.USER` from `@medusajs/framework/utils` to fetch the user's metadata. 
* Intercept role checking, throw `MedusaError(MedusaErrorTypes.NOT_ALLOWED, 'Forbidden')` if role verification fails.

#### [NEW] [middlewares.ts](file:///home/parth/Programming/Projects/atoz-colours-store/src/api/middlewares.ts)
* Map middleware rules using separate path prefix matchers to guarantee a secure, verified path boundary for nested settings and sensitive developer configurations:
  ```typescript
  import { defineMiddlewares } from "@medusajs/medusa"
  import { requireRole } from "./middlewares/require-role"

  export default defineMiddlewares({
    routes: [
      {
        matcher: "/admin/store*",
        method: ["POST", "PUT", "DELETE"],
        middlewares: [requireRole("super_admin")],
      },
      {
        matcher: "/admin/api-keys*",
        method: ["POST", "PUT", "DELETE"],
        middlewares: [requireRole("super_admin")],
      },
      {
        matcher: "/admin/regions*",
        method: ["POST", "PUT", "DELETE"],
        middlewares: [requireRole("super_admin")],
      },
      {
        matcher: "/admin/payment-providers*",
        method: ["POST", "PUT", "DELETE"],
        middlewares: [requireRole("super_admin")],
      },
      {
        matcher: "/admin/settings*",
        method: ["POST", "PUT", "DELETE"],
        middlewares: [requireRole("super_admin")],
      },
    ],
  })
  ```

---

### 5. Backend Business Logic & Automation (Automotive Paint Extensions)

#### [NEW] [order-placed-lab-slip.ts](file:///home/parth/Programming/Projects/atoz-colours-store/src/subscribers/order-placed-lab-slip.ts)
* Create an asynchronous Event Subscriber that listens to the `order.placed` event.
* **Logic:** When an order is placed:
  1. Retrieve the full order details via container-resolved services.
  2. Parse line items to identify paint products.
  3. Extract paint configuration details from the variant metadata (finish, size, paint mixing code, mix ratios).
  4. Generate and log an automated "Paint Mixing Lab Instruction Slip" (simulating integration with automated paint mixer dispensers or custom SMS/Slack notifications for lab staff).

#### [NEW] [product-validation-hook.ts](file:///home/parth/Programming/Projects/atoz-colours-store/src/workflows/hooks/product-validation-hook.ts)
* Register a synchronous **Workflow Hook** onto the product creation/update flow (`createProductsWorkflow.hooks.productsCreated`).
* **Logic:** Enforces validation policies on database entries:
  - If a product belongs to the "Paints" category or the title contains paint keyword indicators, verify that variant configuration metadata contains a valid hex representation of color code (`color_hex`), mixing instructions (`mix_ratio`), and warning indicators (`hazmat`).
  - Throws a structured validation error to rollback migrations/creation steps if specifications are missing.

#### [NEW] [seed.ts](file:///home/parth/Programming/Projects/atoz-colours-store/src/scripts/seed.ts)
* Implement a robust seeding script that populates the database with real automotive custom categories:
  - **Candy Neon Basecoats:** Candy Apple Red, Lime Neon Green, Electric Orange.
  - **Pearl & Shift Coatings:** Amethyst Flip Pearl, Diamond Blue Flake.
  - **Gloss & Clears:** Pitch Black Solid Gloss, Acrylic Thinner / High Solid Clear Coat.
  - Set up corresponding variant matrices mapping volumes (250ml Aerosol, 500ml Tin, 1L Tin) and finishes (Gloss, Matte, Basecoat) to accurate base pricing (INR) and region options.
  - Seeds the admin users (`super_admin` vs `shop_manager`) with appropriate roles mapped in their metadata.

---

## Verification Plan

### Automated Tests
- Run `npm run lint` and `npm run build` across monorepo packages to check type safety.
- Verify checkout API parameters and mock cart actions.
- Write unit tests for the paint metadata validation hook.

### Manual Verification
1. **Visual Aesthetics:** Verify storefront layout and visual appearance (no borders, crisp typography, obsidian/white layout) across the homepage and PDP.
2. **Variant Selection:** Confirm option buttons highlight cleanly and disable appropriately on variants selection in PDP.
3. **Razorpay Modal:** Trigger checkout flow in India region context, select Razorpay, and ensure checkout modal triggers correctly with options and customer phone prefill.
4. **RBAC Guard:** Create a user with metadata `{ "role": "shop_manager" }`, authenticate into admin, and try hitting sensitive API endpoints (e.g. updating store name, generating keys) to verify `403 Forbidden` response.
5. **Mixing Slip Subscriber:** Place a test order containing "Candy Apple Red - 1L Tin - Gloss Finish", check backend server logs, and confirm mixing slip output prints correctly:
   - *Sample Output:* `[PAINT LAB] MIX SLIP FOR ORDER #XYZ - Variant: Candy Apple Red 1L, Finish: Gloss, Code: CAR-RD-001, Mixing Instructions: 2:1 Urethane.`
6. **Seed Validation:** Execute seed script to ensure sample paint categories and configurations populate the PostgreSQL database correctly.
