"use client"

import { addToCart } from "@lib/data/cart"
import { useIntersection } from "@lib/hooks/use-in-view"
import { HttpTypes } from "@medusajs/types"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import { isEqual } from "lodash"
import { useParams, usePathname, useSearchParams, useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import ProductPrice from "../product-price"
import MobileActions from "./mobile-actions"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
}

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce((acc: Record<string, string>, varopt) => {
    if (varopt.option_id) acc[varopt.option_id] = varopt.value
    return acc
  }, {})
}

export default function ProductActions({
  product,
  disabled,
}: ProductActionsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [isAdding, setIsAdding] = useState(false)
  const countryCode = useParams().countryCode as string

  // If there is only 1 variant, preselect options
  useEffect(() => {
    if (product.variants?.length === 1) {
      const variantOptions = optionsAsKeymap(product.variants[0].options)
      setOptions(variantOptions ?? {})
    } else if (product.variants && product.variants.length > 0 && Object.keys(options).length === 0) {
      // Preselect first variant options
      const firstVariantOptions = optionsAsKeymap(product.variants[0].options)
      setOptions(firstVariantOptions ?? {})
    }
  }, [product.variants])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }

    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  const setOptionValue = (optionId: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }))
  }

  const isValidVariant = useMemo(() => {
    return product.variants?.some((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    const value = isValidVariant ? selectedVariant?.id : null

    if (params.get("v_id") === value) {
      return
    }

    if (value) {
      params.set("v_id", value)
    } else {
      params.delete("v_id")
    }

    router.replace(pathname + "?" + params.toString())
  }, [selectedVariant, isValidVariant])

  const inStock = useMemo(() => {
    if (selectedVariant && !selectedVariant.manage_inventory) {
      return true
    }
    if (selectedVariant?.allow_backorder) {
      return true
    }
    if (
      selectedVariant?.manage_inventory &&
      (selectedVariant?.inventory_quantity || 0) > 0
    ) {
      return true
    }
    return false
  }, [selectedVariant])

  const actionsRef = useRef<HTMLDivElement>(null)
  const inView = useIntersection(actionsRef, "0px")
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    setQuantity(1)
  }, [selectedVariant])

  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return null
    setIsAdding(true)

    await addToCart({
      variantId: selectedVariant.id,
      quantity: quantity,
      countryCode,
    })

    setIsAdding(false)
  }

  const handleBuyNow = async () => {
    if (!selectedVariant?.id) return null
    setIsAdding(true)
    await addToCart({
      variantId: selectedVariant.id,
      quantity: quantity,
      countryCode,
    })
    setIsAdding(false)
    router.push(`/${countryCode}/cart`)
  }

  const pickupInfo =
    (product.metadata?.pickup_info as string) ||
    "Pickup available at blackfx ground floor 33/547\nUsually ready in 24 hours"

  return (
    <>
      <div className="flex flex-col gap-y-4" ref={actionsRef}>
        {/* Price display with shipping note */}
        <div className="flex flex-col gap-y-0.5">
          <ProductPrice product={product} variant={selectedVariant} />
          <span className="text-[11px] text-neutral-400">
            <span className="underline cursor-pointer">Shipping</span> calculated at checkout.
          </span>
        </div>

        {/* Options Pill Selection (Quantity / Size) */}
        <div>
          {(product.options || []).map((option) => {
            return (
              <div key={option.id} className="flex flex-col gap-y-2 mb-3">
                <span className="text-xs text-neutral-500 font-medium capitalize">
                  {option.title || "Quantity"}
                </span>
                <div className="flex flex-wrap gap-2">
                  {option.values?.map((val: any) => {
                    const valueStr = typeof val === "string" ? val : val.value
                    const isSelected = options[option.id] === valueStr
                    return (
                      <button
                        key={valueStr}
                        type="button"
                        onClick={() => setOptionValue(option.id, valueStr)}
                        disabled={!!disabled || isAdding}
                        className={`px-5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                          isSelected
                            ? "bg-[#0B2533] text-white border-[#0B2533]"
                            : "bg-white text-slate-700 border-neutral-300 hover:border-black"
                        }`}
                      >
                        {valueStr}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Quantity Increment/Decrement Selector */}
        {selectedVariant && (
          <div className="flex flex-col gap-y-1.5 my-1">
            <span className="text-xs text-neutral-500 font-medium">Quantity</span>
            <div className="flex items-center border border-neutral-300 w-28 justify-between rounded-md bg-white overflow-hidden text-sm">
              <button
                type="button"
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                className="px-3 py-1.5 text-neutral-600 hover:bg-neutral-100 font-medium border-r border-neutral-200"
                disabled={!!disabled || isAdding}
              >
                −
              </button>
              <span className="font-semibold text-slate-800">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((prev) => prev + 1)}
                className="px-3 py-1.5 text-neutral-600 hover:bg-neutral-100 font-medium border-l border-neutral-200"
                disabled={!!disabled || isAdding}
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-y-2.5 pt-2">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!inStock || !selectedVariant || !!disabled || isAdding || !isValidVariant}
            className="w-full py-3.5 px-6 rounded-full border border-neutral-800 text-slate-900 bg-white hover:bg-neutral-50 font-semibold text-sm transition-colors shadow-none disabled:opacity-50"
          >
            {isAdding ? "Adding..." : !inStock || !isValidVariant ? "Out of stock" : "Add to cart"}
          </button>

          <button
            type="button"
            onClick={handleBuyNow}
            disabled={!inStock || !selectedVariant || !!disabled || isAdding || !isValidVariant}
            className="w-full py-3.5 px-6 rounded-full text-white bg-[#0B2533] hover:bg-[#071A24] font-semibold text-sm transition-colors shadow-none disabled:opacity-50"
          >
            Buy it now
          </button>
        </div>

        {/* Store Pickup Availability Banner */}
        <div className="mt-4 pt-4 border-t border-neutral-200 text-xs text-neutral-600 space-y-1">
          <div className="flex items-start gap-1.5 text-emerald-700">
            <span>✓</span>
            <span className="font-medium text-neutral-700 whitespace-pre-line leading-relaxed">
              {pickupInfo}
            </span>
          </div>
          <button
            type="button"
            className="text-[11px] underline text-neutral-500 hover:text-black pt-1 block"
          >
            View store information
          </button>
        </div>

        <MobileActions
          product={product}
          variant={selectedVariant}
          options={options}
          updateOptions={setOptionValue}
          inStock={inStock}
          handleAddToCart={handleAddToCart}
          isAdding={isAdding}
          show={!inView}
          optionsDisabled={!!disabled || isAdding}
        />
      </div>
    </>
  )
}

