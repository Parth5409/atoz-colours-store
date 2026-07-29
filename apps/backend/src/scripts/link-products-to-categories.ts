import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

/**
 * Script to assign products to their proper paint categories in the database.
 * Run with: npx medusa exec src/scripts/link-products-to-categories.ts
 */
export default async function linkProductsToCategories({ container }: ExecArgs) {
  const query = container.resolve<any>(ContainerRegistrationKeys.QUERY)
  const productService = container.resolve<any>(Modules.PRODUCT)

  console.log("Fetching categories...")
  const { data: categories } = await query.graph({
    entity: "product_category",
    fields: ["id", "name", "handle"],
  })

  const categoryMap: Record<string, string> = {}
  for (const cat of categories) {
    categoryMap[cat.handle] = cat.id
  }

  console.log("Found categories:", Object.keys(categoryMap).join(", "))

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "title", "handle"],
  })

  console.log(`Found ${products.length} products to map to categories.`)

  const mappingRules: Record<string, string> = {
    "red-candy": "candy",
    "midnight-sparkle-purple": "crystal-pearls",
    "jade-green": "crystal-pearls",
    "candy-apple-red": "candy",
    "electric-orange": "candy",
    "neon-glow-green": "neons",
    "dynamicshift-aether": "dynamicshift",
    "colorshift-chameleon": "colorshift",
    "lazerghost-plasma": "lazerghost",
  }

  let mappedCount = 0

  for (const product of products) {
    const handle = product.handle || ""
    const targetCategoryHandle = mappingRules[handle] || "candy"
    const targetCategoryId = categoryMap[targetCategoryHandle]

    if (targetCategoryId) {
      try {
        await productService.updateProducts(product.id, {
          category_ids: [targetCategoryId],
        })
        console.log(`✅ Linked "${product.title}" (${handle}) to category "${targetCategoryHandle}" (${targetCategoryId})`)
        mappedCount++
      } catch (err) {
        console.error(`❌ Failed to link category for product ${product.id}:`, err)
      }
    }
  }

  console.log(`\n🎉 Successfully linked ${mappedCount} products to their respective categories!`)
}
