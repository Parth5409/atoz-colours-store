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
  const { cheapestPrice } = getProductPrice({
    product,
  })

  return (
    <LocalizedClientLink href={`/products/${product.handle}`} className="group block h-full">
      <div 
        data-testid="product-wrapper"
        className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 hover:border-blue-500/40 rounded-2xl p-3.5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow flex flex-col justify-between h-full"
      >
        <div>
          <div className="relative overflow-hidden rounded-xl bg-slate-950">
            <Thumbnail
              thumbnail={product.thumbnail}
              images={product.images}
              size="full"
              isFeatured={isFeatured}
              className="rounded-xl transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="flex flex-col mt-3.5 gap-y-1.5">
            <div className="flex justify-between items-start gap-x-2">
              <Text className="text-sm font-bold text-slate-100 uppercase tracking-wide group-hover:text-cyan-400 transition-colors font-sans" data-testid="product-title">
                {product.title}
              </Text>
              {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
            </div>
          </div>
        </div>

        {/* Swatch & Paint metadata properties */}
        {(Boolean(product.metadata?.color_hex) || Boolean(product.metadata?.mix_ratio)) && (
          <div className="flex items-center justify-between gap-x-2 mt-3 pt-2.5 border-t border-slate-800/60 text-slate-400">
            {product.metadata?.color_hex ? (
              <div className="flex items-center gap-1.5">
                <div 
                  className="w-4 h-4 rounded-full border border-white/30 shadow-[0_0_8px_rgba(255,255,255,0.2)]" 
                  style={{ backgroundColor: String(product.metadata.color_hex) }}
                  title={`Color: ${String(product.metadata.color_hex)}`}
                />
                <span className="text-[10px] font-mono text-slate-300 uppercase font-semibold">
                  {String(product.metadata.color_hex)}
                </span>
              </div>
            ) : null}
            {product.metadata?.mix_ratio ? (
              <span className="text-[10px] text-cyan-400 font-mono font-bold uppercase tracking-wider bg-cyan-950/60 border border-cyan-800/50 px-2 py-0.5 rounded-full">
                {String(product.metadata.mix_ratio)}
              </span>
            ) : null}
          </div>
        )}
      </div>
    </LocalizedClientLink>
  )
}
