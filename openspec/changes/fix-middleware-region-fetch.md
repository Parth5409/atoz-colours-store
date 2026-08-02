# Change: Fix Middleware Region Map Fetch Error Handling

## Context
When the storefront Next.js server starts before the Medusa backend server is online, or if `fetch` to `${BACKEND_URL}/store/regions` fails due to network/DNS resolution timing, `getRegionMap` in `apps/storefront/src/middleware.ts` throws an unhandled `TypeError: fetch failed`.
This causes Next.js Edge middleware to crash with a 500 error on every incoming request.

## Proposed Changes
1. **Safeguard `getRegionMap` in `apps/storefront/src/middleware.ts`**:
   - Wrap the `fetch` call to `${BACKEND_URL}/store/regions` in a `try / catch` block.
   - Catch network errors and non-OK response statuses gracefully, logging a warning rather than allowing an unhandled exception to crash the middleware.
   - Return the cached or default empty region map when fetch fails so `getCountryCode` can fall back to `DEFAULT_REGION`.

2. **Ensure Medusa Backend is running**:
   - Make sure Medusa backend server is running on `http://localhost:9000`.
