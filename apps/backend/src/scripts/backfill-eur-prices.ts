import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

/**
 * Backfill EUR and USD prices for all existing products.
 * Run with: npx medusa exec src/scripts/backfill-eur-prices.ts
 *
 * Why this is needed:
 * The storefront region is configured for EUR. Products seeded with only INR
 * pricing do not appear in /store/products?region_id=... because Medusa
 * requires a price matching the region currency for calculated_price.
 */
export default async function backfillEurPrices({ container }: ExecArgs) {
  const pricingService = container.resolve<any>(Modules.PRICING)

  console.log("Fetching all price sets...")
  const priceSets = await pricingService.listPriceSets(
    {},
    { relations: ["prices"], select: ["id", "prices"] }
  )

  console.log(`Found ${priceSets.length} price sets`)

  const INR_TO_EUR = 0.011
  const INR_TO_USD = 0.012

  let updated = 0

  for (const priceSet of priceSets) {
    const prices: any[] = priceSet.prices || []

    const hasEur = prices.some((p: any) => p.currency_code === "eur")
    const hasUsd = prices.some((p: any) => p.currency_code === "usd")
    const inrPrice = prices.find((p: any) => p.currency_code === "inr")

    if (inrPrice && (!hasEur || !hasUsd)) {
      const newPrices: any[] = []

      if (!hasEur) {
        newPrices.push({
          currency_code: "eur",
          amount: Math.round(inrPrice.amount * INR_TO_EUR),
          price_set_id: priceSet.id,
        })
      }

      if (!hasUsd) {
        newPrices.push({
          currency_code: "usd",
          amount: Math.round(inrPrice.amount * INR_TO_USD),
          price_set_id: priceSet.id,
        })
      }

      if (newPrices.length > 0) {
        try {
          await pricingService.addPrices(
            newPrices.map((p) => ({
              priceSetId: priceSet.id,
              prices: [{ currency_code: p.currency_code, amount: p.amount }],
            }))
          )
          updated++
        } catch (err) {
          // Try addPrices with flat array signature (Medusa v2 API varies)
          try {
            await pricingService.createPrices(
              newPrices.map((p) => ({
                price_set_id: priceSet.id,
                currency_code: p.currency_code,
                amount: p.amount,
              }))
            )
            updated++
          } catch (err2) {
            console.warn(`  Could not add prices for price set ${priceSet.id}:`, err2)
          }
        }
      }
    }
  }

  console.log(`\n✅ Done! Backfilled EUR + USD prices for ${updated} price sets.`)
  console.log("All seeded products should now appear in the EUR storefront region.")
}
