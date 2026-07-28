import { HttpTypes } from "@medusajs/types"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  const brand = (product.metadata?.brand as string) || "BLACKFX AUTOMOTIVE"
  const primaryBaseColor =
    (product.metadata?.primary_base_color as string) ||
    "Over a Black base coat Recommended also White,Silver,Grey basecoat optional"
  const mixRatio = (product.metadata?.mix_ratio as string) || "2:1 pu Thinner ratio"
  const particleSize =
    (product.metadata?.particle_size as string) || "15-78 UM Pearls"
  const testSampleNote =
    (product.metadata?.test_sample_note as string) ||
    "Do a test sample for better understanding"
  const topCoatTitle =
    (product.metadata?.top_coat_title as string) || "TOP COAT CLEAR"
  const topCoatDesc =
    (product.metadata?.top_coat_desc as string) ||
    "Finish with a UV protected clear coat (typically 2-3 coats). For best results, follow the coating manufacturer's recommended flash time in between coats, according to the temperature you are spraying in"

  return (
    <div id="product-info" className="flex flex-col gap-y-5 text-slate-800">
      {/* Brand Subtitle */}
      <div className="text-xs uppercase font-mono tracking-widest text-neutral-400 font-bold">
        {brand}
      </div>

      {/* Main Title */}
      <h1
        className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900"
        data-testid="product-title"
      >
        {product.title}
      </h1>

      {/* Technical Specifications Table */}
      <div className="bg-neutral-200/70 border border-neutral-300 rounded-lg overflow-hidden text-xs md:text-sm my-2">
        <div className="grid grid-cols-12 border-b border-neutral-300">
          <div className="col-span-5 p-3.5 font-semibold text-neutral-600 border-r border-neutral-300 flex items-center">
            Primary Base Color
          </div>
          <div className="col-span-7 p-3.5 text-neutral-800 leading-snug">
            {primaryBaseColor}
          </div>
        </div>

        <div className="grid grid-cols-12 border-b border-neutral-300 bg-white">
          <div className="col-span-5 p-3.5 font-semibold text-neutral-600 border-r border-neutral-300 flex items-center">
            Mixing Ratio
          </div>
          <div className="col-span-7 p-3.5 text-neutral-800 font-mono">
            {mixRatio}
          </div>
        </div>

        <div className="grid grid-cols-12 bg-neutral-200/70">
          <div className="col-span-5 p-3.5 font-semibold text-neutral-600 border-r border-neutral-300 flex items-center">
            Particle Size
          </div>
          <div className="col-span-7 p-3.5 text-neutral-800 font-mono">
            {particleSize}
          </div>
        </div>
      </div>

      {/* Test Sample Recommendation */}
      <p className="text-xs font-semibold text-slate-700 italic">
        {testSampleNote}
      </p>

      {/* Top Coat Clear Guide */}
      <div className="space-y-1.5 pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
          {topCoatTitle}
        </h3>
        <p className="text-xs text-neutral-600 leading-relaxed">
          {topCoatDesc}
        </p>
      </div>
    </div>
  )
}

export default ProductInfo

