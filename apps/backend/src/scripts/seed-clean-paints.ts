import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

export default async function seedCleanPaints({ container }: ExecArgs) {
  console.log("Starting database cleanup...")
  const productModuleService = container.resolve<any>(Modules.PRODUCT)
  const pricingModuleService = container.resolve<any>(Modules.PRICING)
  const remoteLink = container.resolve<any>("remoteLink")

  // 1. Delete all existing products (which cascade deletes variants)
  const productsList = await productModuleService.listProducts({}, { select: ["id"] })
  if (productsList.length > 0) {
    console.log(`Deleting ${productsList.length} existing products...`)
    await productModuleService.deleteProducts(productsList.map((p: any) => p.id))
  }

  // 2. Detach parent-child relationships and delete product categories
  const categoriesList = await productModuleService.listProductCategories({}, { select: ["id", "parent_category_id"] })
  if (categoriesList.length > 0) {
    console.log("Detaching parent-child category relationships...")
    for (const cat of categoriesList) {
      if (cat.parent_category_id) {
        try {
          await productModuleService.updateProductCategories(cat.id, { parent_category_id: null })
        } catch (e) {
          console.warn(`Could not detach parent for category ${cat.id}:`, e)
        }
      }
    }
    
    // Now delete them in two passes: first leaf categories (with no children), then the rest.
    // Or simpler: delete child-most categories first.
    // A robust way: fetch categories again, identify parent IDs, delete those that are not parents first.
    let remainingCategories = await productModuleService.listProductCategories({}, { select: ["id", "parent_category_id", "category_children"] })
    console.log(`Deleting ${remainingCategories.length} categories...`)
    
    // Let's delete them iteratively: delete any category that has no children until none are left.
    let attempts = 0
    while (remainingCategories.length > 0 && attempts < 10) {
      const leafIds = remainingCategories
        .filter((c: any) => !c.category_children || c.category_children.length === 0)
        .map((c: any) => c.id)
        
      if (leafIds.length > 0) {
        await productModuleService.deleteProductCategories(leafIds)
        console.log(`Deleted ${leafIds.length} leaf categories.`)
      } else {
        // If there is a cycle or something, just delete all remaining by forcing null on parent
        for (const c of remainingCategories) {
          await productModuleService.updateProductCategories(c.id, { parent_category_id: null })
        }
        await productModuleService.deleteProductCategories(remainingCategories.map((c: any) => c.id))
        break
      }
      
      remainingCategories = await productModuleService.listProductCategories({}, { select: ["id", "parent_category_id", "category_children"] })
      attempts++
    }
  }

  // 3. Delete all existing price sets
  const priceSetsList = await pricingModuleService.listPriceSets({}, { select: ["id"] })
  if (priceSetsList.length > 0) {
    console.log(`Deleting ${priceSetsList.length} existing price sets...`)
    await pricingModuleService.deletePriceSets(priceSetsList.map((ps: any) => ps.id))
  }

  console.log("Cleanup complete! Starting to seed new categories...")

  // 4. Create the requested category structure
  // Main categories:
  // - Colour Changing (dynamicshift, colorshift, lazerghost)
  // - Pearls (crystal-pearls, vivid-pearls)
  // - Candy
  // - Neons
  // - Metal Flake
  // - Premix
  
  const categoryDefs = [
    { name: "Colour Changing", handle: "colour-changing", parentHandle: null },
    { name: "Dynamicshift", handle: "dynamicshift", parentHandle: "colour-changing" },
    { name: "Colorshift", handle: "colorshift", parentHandle: "colour-changing" },
    { name: "Lazerghost", handle: "lazerghost", parentHandle: "colour-changing" },
    
    { name: "Pearls", handle: "pearls", parentHandle: null },
    { name: "Crystal Pearls", handle: "crystal-pearls", parentHandle: "pearls" },
    { name: "Vivid Pearls", handle: "vivid-pearls", parentHandle: "pearls" },
    
    { name: "Candy", handle: "candy", parentHandle: null },
    { name: "Neons", handle: "neons", parentHandle: null },
    { name: "Metal Flake", handle: "metal-flake", parentHandle: null },
    { name: "Premix", handle: "premix", parentHandle: null }
  ]

  const categories: Record<string, any> = {}

  // First pass: Create parent categories
  for (const def of categoryDefs.filter(d => d.parentHandle === null)) {
    const category = await productModuleService.createProductCategories({
      name: def.name,
      handle: def.handle,
      is_active: true
    })
    categories[def.handle] = category
    console.log(`Created parent category: ${def.name} (${def.handle})`)
  }

  // Second pass: Create child categories linked to parents
  for (const def of categoryDefs.filter(d => d.parentHandle !== null)) {
    const parent = categories[def.parentHandle!]
    const category = await productModuleService.createProductCategories({
      name: def.name,
      handle: def.handle,
      is_active: true,
      parent_category_id: parent ? parent.id : undefined
    })
    categories[def.handle] = category
    console.log(`Created child category: ${def.name} linked to parent ${def.parentHandle}`)
  }

  // 5. Seed Paint Products
  const productsToSeed = [
    // Colour Changing -> Dynamicshift
    {
      name: "Dynamicshift Aether",
      handle: "dynamicshift-aether",
      categoryHandle: "dynamicshift",
      color_hex: "#ff00aa",
      mix_ratio: "3:1:1",
      hazmat_class: "Class 3 Flammable",
      prices: [150000, 280000, 520000] // In INR paise (Rs 1500, 2800, 5200)
    },
    // Colour Changing -> Colorshift
    {
      name: "Colorshift Chameleon",
      handle: "colorshift-chameleon",
      categoryHandle: "colorshift",
      color_hex: "#00ffcc",
      mix_ratio: "3:1:1",
      hazmat_class: "Class 3 Flammable",
      prices: [130000, 240000, 450000]
    },
    // Colour Changing -> Lazerghost
    {
      name: "Lazerghost Plasma",
      handle: "lazerghost-plasma",
      categoryHandle: "lazerghost",
      color_hex: "#a832a8",
      mix_ratio: "3:1:1",
      hazmat_class: "Class 3 Flammable",
      prices: [160000, 300000, 550000]
    },
    // Pearls -> Crystal Pearls
    {
      name: "Crystal White Pearl",
      handle: "crystal-white-pearl",
      categoryHandle: "crystal-pearls",
      color_hex: "#f0f8ff",
      mix_ratio: "3:1:1",
      hazmat_class: "Class 3 Flammable",
      prices: [110000, 200000, 380000]
    },
    // Pearls -> Vivid Pearls
    {
      name: "Vivid Violet Pearl",
      handle: "vivid-violet-pearl",
      categoryHandle: "vivid-pearls",
      color_hex: "#ee82ee",
      mix_ratio: "3:1:1",
      hazmat_class: "Class 3 Flammable",
      prices: [125000, 230000, 420000]
    },
    // Candy
    {
      name: "Candy Apple Red",
      handle: "candy-apple-red",
      categoryHandle: "candy",
      color_hex: "#FF0800",
      mix_ratio: "2:1",
      hazmat_class: "Class 3 Flammable",
      prices: [100000, 180000, 320000]
    },
    {
      name: "Electric Orange",
      handle: "electric-orange",
      categoryHandle: "candy",
      color_hex: "#FF4500",
      mix_ratio: "2:1",
      hazmat_class: "Class 3 Flammable",
      prices: [100000, 180000, 320000]
    },
    // Neons
    {
      name: "Neon Glow Green",
      handle: "neon-glow-green",
      categoryHandle: "neons",
      color_hex: "#39ff14",
      mix_ratio: "2:1",
      hazmat_class: "Class 3 Flammable",
      prices: [95000, 170000, 310000]
    },
    {
      name: "Neon Blaze Pink",
      handle: "neon-blaze-pink",
      categoryHandle: "neons",
      color_hex: "#ff69b4",
      mix_ratio: "2:1",
      hazmat_class: "Class 3 Flammable",
      prices: [95000, 170000, 310000]
    },
    // Metal Flake
    {
      name: "Sparkle Silver Flake",
      handle: "sparkle-silver-flake",
      categoryHandle: "metal-flake",
      color_hex: "#c0c0c0",
      mix_ratio: "3:1:1",
      hazmat_class: "Class 3 Flammable",
      prices: [110000, 200000, 370000]
    },
    // Premix
    {
      name: "Pitch Black Solid Gloss",
      handle: "pitch-black-solid-gloss",
      categoryHandle: "premix",
      color_hex: "#000000",
      mix_ratio: "4:1",
      hazmat_class: "Class 3 Flammable",
      prices: [80000, 150000, 280000]
    },
    {
      name: "High Solid Clear Coat",
      handle: "high-solid-clear-coat",
      categoryHandle: "premix",
      color_hex: "#FFFFFF",
      mix_ratio: "4:1",
      hazmat_class: "Class 3 Flammable",
      prices: [80000, 150000, 280000]
    }
  ]

  const volumes = ["250ml Aerosol", "500ml Tin", "1L Tin"]

  for (const productDef of productsToSeed) {
    try {
      const product = await productModuleService.createProducts({
        title: productDef.name,
        handle: productDef.handle,
        options: [{ title: "Volume", values: volumes }],
        status: "published",
        metadata: {
          color_hex: productDef.color_hex,
          mix_ratio: productDef.mix_ratio,
          hazmat_class: productDef.hazmat_class
        }
      })
      
      console.log(`Created product: ${product.handle}`)

      // Link category
      const targetCategory = categories[productDef.categoryHandle]
      if (targetCategory) {
        await productModuleService.updateProducts(product.id, {
          category_ids: [targetCategory.id]
        })
        console.log(`Linked product ${product.handle} to category ${productDef.categoryHandle}`)
      }

      // Create variants
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

        await remoteLink.create({
          [Modules.PRODUCT]: { variant_id: variant.id },
          [Modules.PRICING]: { price_set_id: priceSet.id }
        })
        
        console.log(`Created variant ${volumes[i]} (Price: ${productDef.prices[i] / 100} INR) for ${product.handle}`)
      }
    } catch (error) {
      console.error(`Failed to process product ${productDef.handle}:`, error)
    }
  }

  console.log("Database successfully cleaned and seeded with paint categories and products!")
}
