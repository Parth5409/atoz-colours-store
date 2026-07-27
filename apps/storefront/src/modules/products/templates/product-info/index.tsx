import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  return (
    <div id="product-info">
      <div className="flex flex-col gap-y-4 lg:max-w-[500px] mx-auto">
        {product.collection && (
          <LocalizedClientLink
            href={`/collections/${product.collection.handle}`}
            className="text-medium text-ui-fg-muted hover:text-ui-fg-subtle"
          >
            {product.collection.title}
          </LocalizedClientLink>
        )}
        <Heading
          level="h2"
          className="text-3xl leading-10 text-ui-fg-base"
          data-testid="product-title"
        >
          {product.title}
        </Heading>

        <Text
          className="text-medium text-ui-fg-subtle whitespace-pre-line"
          data-testid="product-description"
        >
          {product.description}
        </Text>

        {/* Paint specifications */}
        {(product.metadata?.color_hex || product.metadata?.mix_ratio || product.metadata?.hazmat_class) && (
          <div className="mt-6 border-t border-neutral-200 pt-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-black mb-4">Paint Specifications</h3>
            <div className="flex flex-col gap-y-3 text-sm">
              {product.metadata?.color_hex && (
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 font-medium">Color Swatch</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-neutral-600">{(product.metadata.color_hex as string).toUpperCase()}</span>
                    <div
                      className="w-5 h-5 border border-neutral-300 rounded-none shadow-none"
                      style={{ backgroundColor: product.metadata.color_hex as string }}
                    />
                  </div>
                </div>
              )}
              {product.metadata?.mix_ratio && (
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 font-medium">Mix Ratio</span>
                  <span className="font-semibold text-black">{product.metadata.mix_ratio as string}</span>
                </div>
              )}
              {product.metadata?.hazmat_class && (
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 font-medium">Classification</span>
                  <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 border border-red-200 font-semibold uppercase tracking-wider">
                    {product.metadata.hazmat_class as string}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductInfo
