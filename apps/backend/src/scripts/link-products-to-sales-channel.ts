import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { linkSalesChannelsToProductsWorkflow } from "@medusajs/medusa/core-flows"

/**
 * Links all products that are missing a sales channel to the default sales channel.
 * Run with: npx medusa exec src/scripts/link-products-to-sales-channel.ts
 *
 * Why this is needed:
 * Products created via productModuleService.createProducts() (bypassing workflows)
 * are not automatically linked to any sales channel. The /store/products API
 * only returns products linked to the sales channel associated with the publishable API key.
 */
export default async function linkProductsToSalesChannel({ container }: ExecArgs) {
  const query = container.resolve<any>(ContainerRegistrationKeys.QUERY)

  // 1. Get all products with their current sales channels
  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "title", "handle", "sales_channels.id"],
  })

  // 2. Get all sales channels
  const { data: salesChannels } = await query.graph({
    entity: "sales_channel",
    fields: ["id", "name"],
  })

  if (salesChannels.length === 0) {
    console.error("No sales channels found! Run the initial seed first.")
    return
  }

  const defaultSalesChannel = salesChannels[0]
  console.log(`Using sales channel: "${defaultSalesChannel.name}" (${defaultSalesChannel.id})`)

  // 3. Find products NOT linked to any sales channel
  const unlinkedProducts = products.filter(
    (p: any) => !p.sales_channels || p.sales_channels.length === 0
  )

  console.log(`\nProducts summary:`)
  console.log(`  Total: ${products.length}`)
  console.log(`  Linked to sales channel: ${products.length - unlinkedProducts.length}`)
  console.log(`  NOT linked (invisible on storefront): ${unlinkedProducts.length}`)

  if (unlinkedProducts.length === 0) {
    console.log("\n✅ All products are already linked to a sales channel!")
    return
  }

  console.log("\nUnlinked products:")
  for (const p of unlinkedProducts) {
    console.log(`  - ${p.title} (${p.handle})`)
  }

  // 4. Link them using the workflow
  console.log(`\nLinking ${unlinkedProducts.length} products to sales channel...`)

  try {
    await linkSalesChannelsToProductsWorkflow(container).run({
      input: {
        data: unlinkedProducts.map((p: any) => ({
          product_id: p.id,
          sales_channel_id: defaultSalesChannel.id,
        })),
      },
    })

    console.log(`\n✅ Successfully linked ${unlinkedProducts.length} products to "${defaultSalesChannel.name}"!`)
    console.log("These products will now appear on the storefront.")
  } catch (err) {
    console.error("linkSalesChannelsToProductsWorkflow failed, trying remoteLink directly...")

    // Fallback: use remoteLink directly
    try {
      const remoteLink = container.resolve<any>(ContainerRegistrationKeys.LINK)

      for (const product of unlinkedProducts) {
        await remoteLink.create({
          [Modules.PRODUCT]: { product_id: product.id },
          [Modules.SALES_CHANNEL]: { sales_channel_id: defaultSalesChannel.id },
        })
        console.log(`  Linked: ${product.title}`)
      }

      console.log(`\n✅ Linked ${unlinkedProducts.length} products via remoteLink!`)
    } catch (linkErr) {
      console.error("remoteLink also failed:", linkErr)
      throw linkErr
    }
  }
}
