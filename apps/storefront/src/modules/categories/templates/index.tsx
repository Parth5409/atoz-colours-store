import { notFound } from "next/navigation"
import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import { OptionValueIds } from "@lib/util/product-option-filters"

export default function CategoryTemplate({
  category,
  sortBy,
  page,
  countryCode,
  optionValueIds,
}: {
  category: HttpTypes.StoreProductCategory
  sortBy?: SortOptions
  page?: string
  countryCode: string
  optionValueIds?: OptionValueIds
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  if (!category || !countryCode) notFound()

  const parents = [] as HttpTypes.StoreProductCategory[]

  const getParents = (category: HttpTypes.StoreProductCategory) => {
    if (category.parent_category) {
      parents.push(category.parent_category)
      getParents(category.parent_category)
    }
  }
  getParents(category)

  return (
    <div
      className="flex flex-col small:flex-row small:items-start py-10 content-container gap-8"
      data-testid="category-container"
    >
      <div className="w-full small:w-64 bg-slate-900/70 border border-slate-800 p-5 rounded-2xl backdrop-blur-md">
        <RefinementList
          sortBy={sort}
          data-testid="sort-by-container"
          hideOptionsPicker
        />
      </div>
      
      <div className="w-full flex-1">
        {/* Luxury Glass Category Header */}
        <div className="flex flex-col mb-8 p-8 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-400 uppercase tracking-widest mb-3">
            <LocalizedClientLink href="/" className="hover:text-cyan-400 transition-colors">Home</LocalizedClientLink>
            <span className="text-slate-600">/</span>
            {parents &&
              parents.map((parent) => (
                <span key={parent.id} className="flex items-center gap-2">
                  <LocalizedClientLink
                    className="hover:text-cyan-400 transition-colors"
                    href={`/categories/${parent.handle}`}
                  >
                    {parent.name}
                  </LocalizedClientLink>
                  <span className="text-slate-600">/</span>
                </span>
              ))}
            <span className="text-cyan-400 font-bold">{category.name}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight text-white font-sans" data-testid="category-page-title">
            {category.name}
          </h1>

          {category.description && (
            <p className="mt-4 text-sm text-slate-400 leading-relaxed max-w-3xl">
              {category.description}
            </p>
          )}

          {category.category_children && category.category_children.length > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-800/60">
              <span className="text-xs font-mono uppercase text-slate-500 font-bold block mb-2">Subcategories:</span>
              <div className="flex flex-wrap gap-2 text-xs font-mono">
                {category.category_children?.map((c) => (
                  <LocalizedClientLink
                    key={c.id}
                    href={`/categories/${c.handle}`}
                    className="px-3.5 py-1.5 bg-slate-950/80 hover:bg-cyan-500 hover:text-slate-950 border border-slate-700/80 text-slate-200 rounded-full transition-all font-semibold uppercase hover:shadow-glow"
                  >
                    {c.name}
                  </LocalizedClientLink>
                ))}
              </div>
            </div>
          )}
        </div>

        <Suspense
          fallback={
            <SkeletonProductGrid
              numberOfProducts={category.products?.length ?? 8}
            />
          }
        >
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            categoryId={category.id}
            countryCode={countryCode}
            optionValueIds={optionValueIds}
          />
        </Suspense>
      </div>
    </div>
  )
}
