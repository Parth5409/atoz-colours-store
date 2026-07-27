import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { HttpTypes } from "@medusajs/types"
import { OptionValueIds } from "@lib/util/product-option-filters"

export default function CollectionTemplate({
  sortBy,
  collection,
  page,
  countryCode,
  optionValueIds,
}: {
  sortBy?: SortOptions
  collection: HttpTypes.StoreCollection
  page?: string
  countryCode: string
  optionValueIds?: OptionValueIds
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    <div className="flex flex-col small:flex-row small:items-start py-8 content-container gap-x-8">
      <RefinementList sortBy={sort} hideOptionsPicker />
      <div className="w-full">
        {/* Stark Clean Collection Header */}
        <div className="flex flex-col mb-8 pb-4 border-b border-neutral-200">
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-neutral-500 uppercase tracking-widest mb-3">
            <span className="text-black font-semibold">Collections</span>
            <span>/</span>
            <span className="text-neutral-400">{collection.title}</span>
          </div>
          <h1 className="text-4xl font-bold uppercase tracking-wider text-black">
            {collection.title}
          </h1>
        </div>
        <Suspense
          fallback={
            <SkeletonProductGrid
              numberOfProducts={collection.products?.length}
            />
          }
        >
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            collectionId={collection.id}
            countryCode={countryCode}
            optionValueIds={optionValueIds}
          />
        </Suspense>
      </div>
    </div>
  )
}
