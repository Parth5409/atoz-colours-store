import LocalizedClientLink from "@modules/common/components/localized-client-link"

const categories = [
  { name: "Dynamicshift", handle: "dynamicshift" },
  { name: "Colorshift", handle: "colorshift" },
  { name: "Candy", handle: "candy" },
  { name: "Neons", handle: "neons" },
  { name: "Metal Flake", handle: "metal-flake" },
  { name: "Crystal Pearls", handle: "crystal-pearls" },
  { name: "Premix", handle: "premix" },
  { name: "Vivid pearls", handle: "vivid-pearls" },
]

export default function Categories() {
  return (
    <div className="py-12 bg-white">
      <div className="content-container flex flex-col items-center">
        <h2 className="text-3xl font-bold mb-10 text-slate-900">Shop by category</h2>
        <div className="flex overflow-x-auto md:justify-center gap-8 md:gap-10 w-full max-w-full pb-4 px-4 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {categories.map((category) => (
            <LocalizedClientLink
              key={category.name}
              href={`/categories/${category.handle}`}
              className="flex flex-col items-center gap-3 group min-w-[90px] md:min-w-[100px] snap-center shrink-0"
            >
              <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-slate-200 shadow-md border-2 border-transparent group-hover:border-rainbow transition-all overflow-hidden flex items-center justify-center">
                {/* Image Placeholder */}
                <span className="text-xs text-slate-400">Img</span>
              </div>
              <span className="text-sm font-semibold text-slate-800 text-center">{category.name}</span>
            </LocalizedClientLink>
          ))}
        </div>
      </div>
    </div>
  )
}
