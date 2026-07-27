import { notFound } from "next/navigation"
import { Suspense } from "react"

import InteractiveLink from "@modules/common/components/interactive-link"
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
      className="flex flex-col small:flex-row small:items-start py-8 content-container gap-x-8"
      data-testid="category-container"
    >
      <RefinementList
        sortBy={sort}
        data-testid="sort-by-container"
        hideOptionsPicker
      />
      <div className="w-full">
        {/* Stark Clean Category Header */}
        <div className="flex flex-col mb-8 pb-4 border-b border-neutral-200">
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-neutral-500 uppercase tracking-widest mb-3">
            <LocalizedClientLink href="/" className="hover:text-black transition-colors">Home</LocalizedClientLink>
            <span>/</span>
            {parents &&
              parents.map((parent) => (
                <span key={parent.id} className="flex items-center gap-1.5">
                  <LocalizedClientLink
                    className="hover:text-black transition-colors"
                    href={`/categories/${parent.handle}`}
                  >
                    {parent.name}
                  </LocalizedClientLink>
                  <span>/</span>
                </span>
              ))}
            <span className="text-black font-semibold">{category.name}</span>
          </div>
          <h1 className="text-4xl font-bold uppercase tracking-wider text-black" data-testid="category-page-title">
            {category.name}
          </h1>
        </div>

        {category.description && (
          <div className="mb-10 text-sm text-neutral-600 leading-relaxed max-w-3xl">
            <p>{category.description}</p>
          </div>
        )}
        {category.category_children && (
          <div className="mb-8 text-base-large">
            <ul className="grid grid-cols-1 gap-2">
              {category.category_children?.map((c) => (
                <li key={c.id}>
                  <InteractiveLink href={`/categories/${c.handle}`}>
                    {c.name}
                  </InteractiveLink>
                </li>
              ))}
            </ul>
          </div>
        )}
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
