import { createProductsWorkflow } from "@medusajs/medusa/core-flows"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import { ProductDTO } from "@medusajs/framework/types"

const PAINT_CATEGORY_HANDLES = new Set([
  "candy-neon-basecoats",
  "pearl-shift-coatings",
  "gloss-clears"
])

createProductsWorkflow.hooks.productsCreated(
  async ({ products }, { container }) => {
    const productModuleService = container.resolve(Modules.PRODUCT)
    const paintCategories = await productModuleService.listProductCategories({
      handle: Array.from(PAINT_CATEGORY_HANDLES)
    })
    const paintCategoryIds = new Set(paintCategories.map(c => c.id))

    for (const product of products) {
      // Check if product is in a paint category
      const isPaint = product.categories?.some(category => 
        paintCategoryIds.has(category.id)
      )

      if (isPaint) {
        const metadata = product.metadata || {}
        const missingFields: string[] = []

        if (!metadata.color_hex || typeof metadata.color_hex !== "string" || metadata.color_hex.trim() === "") {
          missingFields.push("color_hex")
        }
        if (!metadata.mix_ratio || typeof metadata.mix_ratio !== "string" || metadata.mix_ratio.trim() === "") {
          missingFields.push("mix_ratio")
        }
        if (!metadata.hazmat_class || typeof metadata.hazmat_class !== "string" || metadata.hazmat_class.trim() === "") {
          missingFields.push("hazmat_class")
        }

        if (missingFields.length > 0) {
          throw new MedusaError(
            MedusaError.Types.INVALID_DATA,
            `Paint product '${product.title}' is missing required metadata: ${missingFields.join(", ")}`
          )
        }
      }
    }
  }
)
