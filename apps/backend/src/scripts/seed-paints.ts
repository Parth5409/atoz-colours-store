import { 
  MedusaContainer, 
  IProductModuleService,
  IPricingModuleService
} from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

import { ExecArgs } from "@medusajs/framework/types"

export default async function seedPaints({ container }: ExecArgs) {
  const productModuleService: IProductModuleService = container.resolve(Modules.PRODUCT)
  const pricingModuleService: IPricingModuleService = container.resolve(Modules.PRICING)

  // 2.1 Implement idempotent category upsert
  const categoryHandles = [
    "candy-neon-basecoats", "pearl-shift-coatings", "gloss-clears",
    "colour-changing", "dynamicshift", "colorshift", "lazerghost",
    "pearls", "crystal-pearls", "vivid-pearls", "candy", "neons",
    "metal-flake", "premix", "paint-shop"
  ]
  const categories: Record<string, any> = {}

  for (const handle of categoryHandles) {
    let category
    try {
      const [existingCategory] = await productModuleService.listProductCategories({
        handle
      })
      if (existingCategory) {
        category = existingCategory
        console.log(`Category ${handle} already exists, skipping creation.`)
      } else {
        // 2.2 Define category display names and descriptions
        const name = handle.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
        category = await productModuleService.createProductCategories({
          name,
          handle,
          is_active: true
        })
        console.log(`Created category: ${handle}`)
      }
    } catch (error) {
      console.error(`Failed to upsert category ${handle}`, error)
    }
    categories[handle] = category
  }

  // Link child categories to parents
  const parentChildRelations = [
    { parent: "colour-changing", children: ["dynamicshift", "colorshift", "lazerghost"] },
    { parent: "pearls", children: ["crystal-pearls", "vivid-pearls"] }
  ]
  for (const relation of parentChildRelations) {
    const parent = categories[relation.parent]
    if (parent) {
      for (const childHandle of relation.children) {
        const child = categories[childHandle]
        if (child && !child.parent_category_id) {
          await productModuleService.updateProductCategories(child.id, {
            parent_category_id: parent.id
          })
          child.parent_category_id = parent.id
          console.log(`Linked category ${childHandle} to parent ${relation.parent}`)
        }
      }
    }
  }

  // 3.1 Define the product catalogue
  const products = [
    { name: "Candy Apple Red", handle: "candy-apple-red", categoryHandle: "candy-neon-basecoats", color_hex: "#FF0800", mix_ratio: "2:1", hazmat_class: "Class 3 Flammable", prices: [1000, 1800, 3200] },
    { name: "Lime Neon Green", handle: "lime-neon-green", categoryHandle: "candy-neon-basecoats", color_hex: "#39FF14", mix_ratio: "2:1", hazmat_class: "Class 3 Flammable", prices: [1000, 1800, 3200] },
    { name: "Electric Orange", handle: "electric-orange", categoryHandle: "candy-neon-basecoats", color_hex: "#FF4500", mix_ratio: "2:1", hazmat_class: "Class 3 Flammable", prices: [1000, 1800, 3200] },
    { name: "Amethyst Flip Pearl", handle: "amethyst-flip-pearl", categoryHandle: "pearl-shift-coatings", color_hex: "#9966CC", mix_ratio: "3:1:1", hazmat_class: "Class 3 Flammable", prices: [1200, 2200, 4000] },
    { name: "Diamond Blue Flake", handle: "diamond-blue-flake", categoryHandle: "pearl-shift-coatings", color_hex: "#0000FF", mix_ratio: "3:1:1", hazmat_class: "Class 3 Flammable", prices: [1200, 2200, 4000] },
    { name: "Pitch Black Solid Gloss", handle: "pitch-black-solid-gloss", categoryHandle: "gloss-clears", color_hex: "#000000", mix_ratio: "4:1", hazmat_class: "Class 3 Flammable", prices: [800, 1500, 2800] },
    { name: "High Solid Clear Coat", handle: "high-solid-clear-coat", categoryHandle: "gloss-clears", color_hex: "#FFFFFF", mix_ratio: "4:1", hazmat_class: "Class 3 Flammable", prices: [800, 1500, 2800] },
    // Specific storefront category mappings
    { name: "Dynamicshift Aether", handle: "dynamicshift-aether", categoryHandle: "dynamicshift", color_hex: "#ff00aa", mix_ratio: "3:1:1", hazmat_class: "Class 3 Flammable", prices: [1500, 2800, 5200] },
    { name: "Colorshift Chameleon", handle: "colorshift-chameleon", categoryHandle: "colorshift", color_hex: "#00ffcc", mix_ratio: "3:1:1", hazmat_class: "Class 3 Flammable", prices: [1300, 2400, 4500] },
    { name: "Lazerghost Plasma", handle: "lazerghost-plasma", categoryHandle: "lazerghost", color_hex: "#a832a8", mix_ratio: "3:1:1", hazmat_class: "Class 3 Flammable", prices: [1600, 3000, 5500] },
    { name: "Crystal White Pearl", handle: "crystal-white-pearl", categoryHandle: "crystal-pearls", color_hex: "#f0f8ff", mix_ratio: "3:1:1", hazmat_class: "Class 3 Flammable", prices: [1100, 2000, 3800] },
    { name: "Vivid Violet Pearl", handle: "vivid-violet-pearl", categoryHandle: "vivid-pearls", color_hex: "#ee82ee", mix_ratio: "3:1:1", hazmat_class: "Class 3 Flammable", prices: [1250, 2300, 4200] },
    { name: "Candy Red Flake", handle: "candy-red-flake", categoryHandle: "candy", color_hex: "#d1001c", mix_ratio: "2:1", hazmat_class: "Class 3 Flammable", prices: [1000, 1850, 3400] },
    { name: "Neon Glow Green", handle: "neon-glow-green", categoryHandle: "neons", color_hex: "#39ff14", mix_ratio: "2:1", hazmat_class: "Class 3 Flammable", prices: [950, 1700, 3100] },
    { name: "Sparkle Silver Flake", handle: "sparkle-silver-flake", categoryHandle: "metal-flake", color_hex: "#c0c0c0", mix_ratio: "3:1:1", hazmat_class: "Class 3 Flammable", prices: [1100, 2000, 3700] },
  ]

  for (const productDef of products) {
    try {
      const [existingProduct] = await productModuleService.listProducts({
        handle: productDef.handle
      })

      if (existingProduct) {
        console.log(`Product ${productDef.handle} already exists, skipping creation.`)
        continue
      }

      const product = await productModuleService.createProducts({
        title: productDef.name,
        handle: productDef.handle,
        options: [{ title: "Volume", values: ["250ml Aerosol", "500ml Tin", "1L Tin"] }],
        metadata: {
          color_hex: productDef.color_hex,
          mix_ratio: productDef.mix_ratio,
          hazmat_class: productDef.hazmat_class
        }
      })
      
      console.log(`Created product: ${product.handle}`)

      // Link category
      if (categories[productDef.categoryHandle]) {
        await productModuleService.updateProducts(product.id, {
          category_ids: [categories[productDef.categoryHandle].id]
        })
      }

      // Create variants
      const volumes = ["250ml Aerosol", "500ml Tin", "1L Tin"]
      for (let i = 0; i < volumes.length; i++) {
        const variant = await productModuleService.createProductVariants({
          product_id: product.id,
          title: volumes[i],
          options: {
            Volume: volumes[i]
          }
        })

        const priceSet = await pricingModuleService.createPriceSets({
          prices: [
            {
              amount: productDef.prices[i],
              currency_code: "inr"
            }
          ]
        })

        const remoteLink = container.resolve("remoteLink")
        await remoteLink.create({
          [Modules.PRODUCT]: { variant_id: variant.id },
          [Modules.PRICING]: { price_set_id: priceSet.id }
        })
        
        console.log(`Created variant ${volumes[i]} for product ${product.handle}`)
      }
    } catch (error) {
      console.error(`Failed to process product ${productDef.handle}`, error)
    }
  }

  console.log("Seed paints complete.")
}
