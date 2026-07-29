import { listProducts } from "@lib/data/products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function FeaturedProducts({
  countryCode = "dk",
}: {
  countryCode?: string
}) {
  let products: any[] = []

  try {
    const data = await listProducts({
      countryCode,
      queryParams: {
        limit: 4,
      },
    })
    products = data?.response?.products || []
  } catch (error) {
    console.error("Failed to fetch featured products for homepage:", error)
  }

  // Fallback mock products if database is empty
  const fallbackProducts = [
    { title: "Aether Dynamicshift®", price: "₹1,700", handle: "dynamicshift-aether", hex: "#ff00aa" },
    { title: "Jade Green Crystal Pearl", price: "₹1,050", handle: "jade-green", hex: "#00a86b" },
    { title: "Stealth Graphite", price: "₹4,800", handle: "stealth-graphite", hex: "#333333" },
    { title: "Crimson Shadow®", price: "₹2,850", handle: "crimson-shadow", hex: "#dc2626" },
  ]

  return (
    <div className="py-16 bg-white w-full">
      <div className="content-container flex flex-col items-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Top Picks Everyone's Talking About</h2>
        <p className="text-slate-500 mb-10 text-center max-w-2xl">
          Don't miss out on our best-selling automotive paints. These favorites deliver standout color shift, deep pearls, and vibrant custom finishes.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {products.length > 0
            ? products.map((product) => {
                const hex = product.metadata?.color_hex || product.metadata?.hex || "#111111"
                const image = product.thumbnail || product.images?.[0]?.url || product.metadata?.image_url

                const prices = product.variants
                  ?.flatMap((v: any) => v.calculated_price?.calculated_amount)
                  .filter((a: any) => typeof a === "number")

                const minPrice = prices?.length ? Math.min(...prices) : null
                const priceDisplay = minPrice ? `From ₹${minPrice}` : ""

                return (
                  <div key={product.id} className="flex flex-col gap-4 group">
                    {/* Product Image / Visual Container */}
                    <LocalizedClientLink
                      href={`/products/${product.handle}`}
                      className="w-full aspect-[4/5] bg-neutral-100 rounded-3xl flex items-center justify-center overflow-hidden border border-neutral-200 relative shadow-sm group-hover:shadow-md transition-all"
                    >
                      {image ? (
                        <img
                          src={image}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div
                          style={{ backgroundColor: hex }}
                          className="w-full h-full opacity-90"
                        />
                      )}
                      <div
                        style={{ backgroundColor: hex }}
                        className="absolute top-4 right-4 w-7 h-7 rounded-full border-2 border-white shadow-md"
                        title={`Color HEX: ${hex}`}
                      />
                    </LocalizedClientLink>

                    <div className="text-center flex flex-col gap-1">
                      <h3 className="font-semibold text-slate-800">{product.title}</h3>
                      {priceDisplay && <p className="text-slate-600 text-sm">{priceDisplay}</p>}
                    </div>

                    <LocalizedClientLink
                      href={`/products/${product.handle}`}
                      className="w-full py-3 px-6 rounded-full border border-slate-300 font-semibold text-slate-800 hover:bg-slate-900 hover:text-white transition-colors text-center text-sm"
                    >
                      View details
                    </LocalizedClientLink>
                  </div>
                )
              })
            : fallbackProducts.map((product, idx) => (
                <div key={idx} className="flex flex-col gap-4">
                  <div className="w-full aspect-[4/5] bg-neutral-100 rounded-3xl flex items-center justify-center overflow-hidden relative border border-neutral-200">
                    <div style={{ backgroundColor: product.hex }} className="w-full h-full opacity-80" />
                  </div>

                  <div className="text-center flex flex-col gap-1">
                    <h3 className="font-semibold text-slate-800">{product.title}</h3>
                    <p className="text-slate-600 text-sm">From {product.price}</p>
                  </div>

                  <LocalizedClientLink
                    href={`/products/${product.handle}`}
                    className="w-full py-3 px-6 rounded-full border border-slate-300 font-semibold text-slate-800 hover:bg-slate-900 hover:text-white transition-colors text-center text-sm"
                  >
                    View details
                  </LocalizedClientLink>
                </div>
              ))}
        </div>
      </div>
    </div>
  )
}
