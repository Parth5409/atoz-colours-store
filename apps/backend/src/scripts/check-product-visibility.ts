import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Diagnostic script to check:
 * 1. How many products exist
 * 2. Which products are linked to sales channels
 * 3. What currencies have prices
 */
export default async function checkProductVisibility({ container }: ExecArgs) {
  const query = container.resolve<any>(ContainerRegistrationKeys.QUERY)

  // 1. List all products with their sales_channels
  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "title", "handle", "status", "variants.id", "sales_channels.id", "sales_channels.name"],
  })

  console.log(`\n=== Products (${products.length} total) ===`)
  for (const p of products) {
    const hasSalesChannels = (p.sales_channels || []).length > 0
    console.log(`  ${p.title} (${p.handle}) | status=${p.status} | sales_channels=${hasSalesChannels ? p.sales_channels.map((sc: any) => sc.name).join(", ") : "NONE"}`)
  }

  // 2. List all sales channels
  const { data: salesChannels } = await query.graph({
    entity: "sales_channel",
    fields: ["id", "name"],
  })

  console.log(`\n=== Sales Channels (${salesChannels.length} total) ===`)
  for (const sc of salesChannels) {
    console.log(`  ${sc.name} (${sc.id})`)
  }

  // 3. List all API keys
  const { data: apiKeys } = await query.graph({
    entity: "api_key",
    fields: ["id", "title", "type", "token"],
  })

  console.log(`\n=== API Keys (${apiKeys.length} total) ===`)
  for (const key of apiKeys) {
    console.log(`  ${key.title} (type=${key.type}) token=${key.token?.substring(0, 20)}...`)
  }

  // 4. List all price currencies
  const { data: priceSets } = await query.graph({
    entity: "price_set",
    fields: ["id", "prices.currency_code", "prices.amount"],
  })

  const currencyCounts: Record<string, number> = {}
  for (const ps of priceSets) {
    for (const price of (ps.prices || [])) {
      currencyCounts[price.currency_code] = (currencyCounts[price.currency_code] || 0) + 1
    }
  }

  console.log(`\n=== Price Currency Distribution ===`)
  for (const [currency, count] of Object.entries(currencyCounts)) {
    console.log(`  ${currency}: ${count} prices`)
  }

  console.log("\n=== Summary ===")
  const productsWithSalesChannel = products.filter((p: any) => (p.sales_channels || []).length > 0)
  console.log(`Products linked to sales channels: ${productsWithSalesChannel.length}/${products.length}`)
  console.log(`Products NOT linked to any sales channel: ${products.length - productsWithSalesChannel.length}`)
}
