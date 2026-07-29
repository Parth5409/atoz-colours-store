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
    <div className="py-10 content-container space-y-16">
      {/* Category-Wise Header */}
      <div className="border-b border-neutral-200 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-neutral-400 font-bold block mb-2">
            ATOZ COLOURS / CATEGORY SELECTION
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight text-slate-900">
            Paint Collections by Category
          </h1>
        </div>

        {/* Quick Category Navigation Bar */}
        <div className="flex flex-wrap gap-2 text-xs font-mono">
          {rootCategories.map((cat: any) => (
            <LocalizedClientLink
              key={cat.id}
              href={`/categories/${cat.handle}`}
              className="px-3 py-1.5 border border-neutral-300 hover:border-black bg-white text-slate-800 hover:text-black font-semibold uppercase tracking-wider transition-all"
            >
              {cat.name}
            </LocalizedClientLink>
          ))}
        </div>
      </div>

      {/* Render Each Category Block */}
      {categoryBlocks.map(({ category, products }) => (
        <section key={category.id} className="space-y-6 pt-4 border-t border-neutral-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 bg-black rounded-none" />
              <h2 className="text-2xl font-bold uppercase tracking-wider text-slate-900">
                {category.name}
              </h2>
              <span className="text-xs font-mono bg-neutral-100 text-neutral-600 px-2 py-0.5 font-bold border border-neutral-200">
                {products.length} {products.length === 1 ? "Product" : "Products"}
              </span>
            </div>

            <LocalizedClientLink
              href={`/categories/${category.handle}`}
              className="text-xs font-mono font-bold uppercase tracking-wider text-black hover:underline flex items-center gap-1"
            >
              Explore {category.name} &rarr;
            </LocalizedClientLink>
          </div>

          {category.description && (
            <p className="text-xs text-neutral-500 max-w-2xl font-sans">
              {category.description}
            </p>
          )}

          {/* Subcategories Pills */}
          {category.category_children && category.category_children.length > 0 && (
            <div className="flex flex-wrap gap-2 text-[11px] font-mono">
              <span className="text-neutral-400 font-bold uppercase py-1">Subcategories:</span>
              {category.category_children.map((sub: any) => (
                <LocalizedClientLink
                  key={sub.id}
                  href={`/categories/${sub.handle}`}
                  className="px-2.5 py-1 bg-neutral-100 hover:bg-black hover:text-white border border-neutral-200 text-neutral-700 transition-colors uppercase font-semibold"
                >
                  {sub.name}
                </LocalizedClientLink>
              ))}
            </div>
          )}

          {/* Product Grid for this Category */}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 small:grid-cols-2 medium:grid-cols-3 large:grid-cols-4 gap-x-6 gap-y-8 pt-2">
              {products.map((product: any) => (
                <ProductPreview key={product.id} product={product} region={undefined as any} />
              ))}
            </div>
          ) : (
            <div className="p-8 bg-neutral-50 border border-dashed border-neutral-200 text-center space-y-2">
              <span className="text-xs font-mono uppercase text-neutral-400 font-bold block">
                No custom paints listed in {category.name} yet
              </span>
              <LocalizedClientLink
                href="/admin/dashboard"
                className="inline-block text-[11px] font-mono font-bold uppercase text-black underline"
              >
                + Add Paint in Admin Panel
              </LocalizedClientLink>
            </div>
          )}
        </section>
      ))}

      {/* Uncategorized Section if any exist */}
      {uncategorizedProducts.length > 0 && (
        <section className="space-y-6 pt-4 border-t border-neutral-100">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold uppercase tracking-wider text-slate-900">
              Other Custom Paints
            </h2>
            <span className="text-xs font-mono bg-neutral-100 text-neutral-600 px-2 py-0.5 font-bold">
              {uncategorizedProducts.length} Products
            </span>
          </div>

          <div className="grid grid-cols-1 small:grid-cols-2 medium:grid-cols-3 large:grid-cols-4 gap-x-6 gap-y-8 pt-2">
            {uncategorizedProducts.map((product: any) => (
              <ProductPreview key={product.id} product={product} region={undefined as any} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
