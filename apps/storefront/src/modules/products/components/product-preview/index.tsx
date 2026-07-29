import { Text } from "@modules/common/components/ui"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"

export default async function ProductPreview({
  product,
  isFeatured,
  region: _region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  // const pricedProduct = await listProducts({
  //   regionId: region.id,
  //   queryParams: { id: [product.id!] },
  // }).then(({ response }) => response.products[0])

  // if (!pricedProduct) {
  //   return null
  // }

  const { cheapestPrice } = getProductPrice({
    product,
  })

  return (
    <LocalizedClientLink href={`/products/${product.handle}`} className="group">
      <div data-testid="product-wrapper">
        <Thumbnail
          thumbnail={product.thumbnail}
          images={product.images}
          size="full"
          isFeatured={isFeatured}
        />
        <div className="flex flex-col mt-4 gap-y-1">
          <div className="flex justify-between items-start gap-x-2">
            <Text className="text-sm font-bold text-black uppercase tracking-wide group-hover:text-neutral-600 transition-colors" data-testid="product-title">
              {product.title}
            </Text>
            {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
          </div>
          
          {/* Swatch & Paint metadata properties */}
          {(Boolean(product.metadata?.color_hex) || Boolean(product.metadata?.mix_ratio)) && (
            <div className="flex items-center gap-x-2 mt-1">
              {product.metadata?.color_hex ? (
                <div 
                  className="w-4 h-4 border border-neutral-300 rounded-none shadow-none" 
                  style={{ backgroundColor: String(product.metadata.color_hex) }}
                  title={`Color: ${String(product.metadata.color_hex)}`}
                />
              ) : null}
              {product.metadata?.mix_ratio ? (
                <span className="text-[10px] text-neutral-500 font-semibold uppercase tracking-widest">
                  Mix: {String(product.metadata.mix_ratio)}
                </span>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </LocalizedClientLink>
  )
}
