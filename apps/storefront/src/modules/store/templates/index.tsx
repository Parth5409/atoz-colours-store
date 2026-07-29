import React from "react"
import { listCategories } from "@lib/data/categories"
import { listProducts } from "@lib/data/products"
import ProductPreview from "@modules/products/components/product-preview"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { OptionValueIds } from "@lib/util/product-option-filters"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

export default async function StoreTemplate({
  countryCode = "dk",
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
  optionValueIds?: OptionValueIds
}) {
  const categories = await listCategories().catch(() => [])

  // Filter root categories (parent_category is null)
  const rootCategories = (categories || []).filter(
    (cat: any) => !cat.parent_category_id && !cat.parent_category
  )

  // Fetch all products with their categories
  const { response } = await listProducts({
    countryCode,
    queryParams: { limit: 100 },
  }).catch(() => ({ response: { products: [], count: 0 } }))

  const allProducts = response?.products || []

  // Map products into category buckets
  const categoryBlocks = rootCategories.map((cat: any) => {
    const childIds = new Set((cat.category_children || []).map((c: any) => c.id))
    childIds.add(cat.id)

    const categoryProducts = allProducts.filter((p: any) =>
      p.categories?.some((c: any) => childIds.has(c.id))
    )

    return {
      category: cat,
      products: categoryProducts,
    }
  })

  // Uncategorized products if any
  const uncategorizedProducts = allProducts.filter(
    (p: any) => !p.categories || p.categories.length === 0
  )

  return (
    <div className="py-12 content-container space-y-16">
      {/* Posh Category-Wise Header */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-cyan-400 font-bold block mb-2">
            ATOZ COLOURS / AUTOMOTIVE SHADES
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight text-white font-sans">
            Paint Collections <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500">by Category</span>
          </h1>
        </div>

        {/* Quick Category Navigation Bar */}
        <div className="flex flex-wrap gap-2 text-xs font-mono">
          {rootCategories.map((cat: any) => (
            <LocalizedClientLink
              key={cat.id}
              href={`/categories/${cat.handle}`}
              className="px-3.5 py-2 border border-slate-700/80 hover:border-cyan-400 bg-slate-950/70 text-slate-200 hover:text-white rounded-xl font-semibold uppercase tracking-wider transition-all hover:scale-105 hover:shadow-glow"
            >
              {cat.name}
            </LocalizedClientLink>
          ))}
        </div>
      </div>

      {/* Render Each Category Block */}
      {categoryBlocks.map(({ category, products }) => (
        <section key={category.id} className="space-y-6 pt-6 border-t border-slate-800/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-3.5 h-3.5 bg-cyan-400 rounded-sm shadow-[0_0_12px_rgba(56,189,248,0.6)]" />
              <h2 className="text-2xl md:text-3xl font-extrabold uppercase tracking-wider text-white">
                {category.name}
              </h2>
              <span className="text-xs font-mono bg-slate-800/80 text-cyan-300 px-3 py-1 rounded-full font-bold border border-slate-700">
                {products.length} {products.length === 1 ? "Shade" : "Shades"}
              </span>
            </div>

            <LocalizedClientLink
              href={`/categories/${category.handle}`}
              className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 group"
            >
              <span>Explore {category.name}</span>
              <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </LocalizedClientLink>
          </div>

          {category.description && (
            <p className="text-sm text-slate-400 max-w-2xl font-sans leading-relaxed">
              {category.description}
            </p>
          )}

          {/* Subcategories Pills */}
          {category.category_children && category.category_children.length > 0 && (
            <div className="flex flex-wrap gap-2 text-[11px] font-mono">
              <span className="text-slate-500 font-bold uppercase py-1">Subcategories:</span>
              {category.category_children.map((sub: any) => (
                <LocalizedClientLink
                  key={sub.id}
                  href={`/categories/${sub.handle}`}
                  className="px-3 py-1 bg-slate-900/90 hover:bg-cyan-500 hover:text-slate-950 border border-slate-800 text-slate-300 rounded-full transition-all uppercase font-semibold hover:shadow-glow"
                >
                  {sub.name}
                </LocalizedClientLink>
              ))}
            </div>
          )}

          {/* Product Grid for this Category */}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 small:grid-cols-2 medium:grid-cols-3 large:grid-cols-4 gap-6 pt-2">
              {products.map((product: any) => (
                <ProductPreview key={product.id} product={product} region={undefined as any} />
              ))}
            </div>
          ) : (
            <div className="p-8 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl text-center space-y-2">
              <span className="text-xs font-mono uppercase text-slate-500 font-bold block">
                No custom shades listed in {category.name} yet
              </span>
              <LocalizedClientLink
                href="/admin/dashboard"
                className="inline-block text-xs font-mono font-bold uppercase text-cyan-400 hover:text-cyan-300 underline"
              >
                + Add Shade in Admin Panel
              </LocalizedClientLink>
            </div>
          )}
        </section>
      ))}

      {/* Uncategorized Section if any exist */}
      {uncategorizedProducts.length > 0 && (
        <section className="space-y-6 pt-6 border-t border-slate-800/60">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold uppercase tracking-wider text-white">
              Other Custom Shades
            </h2>
            <span className="text-xs font-mono bg-slate-800 text-cyan-300 px-3 py-1 rounded-full font-bold">
              {uncategorizedProducts.length} Shades
            </span>
          </div>

          <div className="grid grid-cols-1 small:grid-cols-2 medium:grid-cols-3 large:grid-cols-4 gap-6 pt-2">
            {uncategorizedProducts.map((product: any) => (
              <ProductPreview key={product.id} product={product} region={undefined as any} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
