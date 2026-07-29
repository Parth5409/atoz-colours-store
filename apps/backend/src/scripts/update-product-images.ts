import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

/**
 * Script to update all products in the database with distinct, color-specific image URLs
 * and SVG paint swatches, fixing the issue where all products displayed the exact same image.
 *
 * Run with: npx medusa exec src/scripts/update-product-images.ts
 */
function generatePaintSvgDataUri(title: string, hexColor: string, brand = "BLACKFX AUTOMOTIVE"): string {
  const safeTitle = (title || "Custom Paint").toUpperCase()
  const safeHex = hexColor || "#00A86B"
  const safeBrand = (brand || "BLACKFX AUTOMOTIVE").toUpperCase()
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
    <defs>
      <radialGradient id="grad" cx="50%" cy="35%" r="65%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35"/>
        <stop offset="60%" stop-color="${safeHex}" stop-opacity="1"/>
        <stop offset="100%" stop-color="#0b0b0b" stop-opacity="0.9"/>
      </radialGradient>
      <linearGradient id="shine" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.4"/>
        <stop offset="50%" stop-color="#ffffff" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect width="800" height="800" fill="#121212"/>
    <rect width="760" height="760" x="20" y="20" fill="url(#grad)" rx="16"/>
    <rect width="760" height="760" x="20" y="20" fill="url(#shine)" rx="16"/>
    <circle cx="400" cy="350" r="180" fill="${safeHex}" stroke="#ffffff" stroke-width="4"/>
    <text x="400" y="580" text-anchor="middle" fill="#ffffff" font-family="monospace, sans-serif" font-size="22" font-weight="bold" letter-spacing="4">${safeBrand}</text>
    <text x="400" y="630" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="32" font-weight="900" letter-spacing="2">${safeTitle}</text>
    <text x="400" y="675" text-anchor="middle" fill="${safeHex}" font-family="monospace, sans-serif" font-size="20" font-weight="bold" letter-spacing="3">${safeHex}</text>
  </svg>`
  
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

// Distinct high-resolution Unsplash paint/car images mapped by color/handle keyword
const DISTINCT_COLOR_IMAGES: Record<string, string> = {
  "red-candy": "https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=800&auto=format&fit=crop", // Red sports car
  "midnight-sparkle-purple": "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?q=80&w=800&auto=format&fit=crop", // Dark purple car
  "jade-green": "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=800&auto=format&fit=crop", // Green car
  "candy-apple-red": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop", // Porsche Red
  "electric-orange": "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?q=80&w=800&auto=format&fit=crop", // Orange Metallic
  "neon-glow-green": "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800&auto=format&fit=crop", // Neon Green Lambo
  "dynamicshift-aether": "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=800&auto=format&fit=crop", // Pink/Magenta Metallic
  "colorshift-chameleon": "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=800&auto=format&fit=crop", // Teal/Cyan Shift
  "lazerghost-plasma": "https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=800&auto=format&fit=crop", // Deep Violet
}

export default async function updateProductImages({ container }: ExecArgs) {
  const query = container.resolve<any>(ContainerRegistrationKeys.QUERY)
  const productService = container.resolve<any>(Modules.PRODUCT)

  console.log("Fetching all products for image updating...")
  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "title", "handle", "thumbnail", "metadata"],
  })

  console.log(`Found ${products.length} products to update.`)

  let updatedCount = 0

  for (const product of products) {
    const handle = product.handle || ""
    const hexColor = (product.metadata?.color_hex as string) || "#00A86B"
    const brand = (product.metadata?.brand as string) || "BLACKFX AUTOMOTIVE"

    // Pick distinct image or generate SVG paint graphic
    const distinctImage = DISTINCT_COLOR_IMAGES[handle] || generatePaintSvgDataUri(product.title, hexColor, brand)
    const gallerySvg = generatePaintSvgDataUri(`${product.title} (Canister)`, hexColor, brand)

    try {
      await productService.updateProducts(product.id, {
        thumbnail: distinctImage,
        images: [
          { url: distinctImage },
          { url: gallerySvg },
        ],
        metadata: {
          ...product.metadata,
          image_url: distinctImage,
        },
      })
      console.log(`✅ Updated product "${product.title}" (${handle}) with unique image & SVG swatch.`)
      updatedCount++
    } catch (err) {
      console.error(`❌ Failed to update product ${product.id}:`, err)
    }
  }

  console.log(`\n🎉 Successfully updated ${updatedCount} products with unique cover and gallery images!`)
}
