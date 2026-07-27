"use client"

import React, { useState, useEffect } from "react"
import { createAdminProduct, retrieveAdminCategories } from "@lib/data/admin"

interface ColorFormProps {
  onClose: () => void
  onSuccess: () => void
}

const SIZES = ["250ml Aerosol", "500ml Tin", "1L Tin"]
const FINISHES = ["Gloss", "Matte", "Basecoat"]

export default function ColorForm({ onClose, onSuccess }: ColorFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("")

  // Form states
  const [title, setTitle] = useState("")
  const [handle, setHandle] = useState("")
  const [description, setDescription] = useState("")
  const [hexColor, setHexColor] = useState("#0066cc")
  const [mixRatio, setMixRatio] = useState("1:1")
  const [hazmatClass, setHazmatClass] = useState("Class 3")
  const [basePrice, setBasePrice] = useState("1500")

  useEffect(() => {
    const loadCategories = async () => {
      const data = await retrieveAdminCategories()
      setCategories(data || [])
      if (data && data.length > 0) {
        setSelectedCategory(data[0].id)
      }
    }
    loadCategories()
  }, [])


  // Generate initial variants list
  const initialVariants = SIZES.flatMap((size) =>
    FINISHES.map((finish) => {
      // Basic price multiplier logic for default suggestions
      let multiplier = 1.0
      if (size === "500ml Tin") multiplier = 1.8
      if (size === "1L Tin") multiplier = 3.2
      if (finish === "Basecoat") multiplier -= 0.15

      const price = Math.round(parseFloat(basePrice || "1500") * multiplier)

      return {
        size,
        finish,
        price: price.toString(),
        inventory: "50",
      }
    })
  )

  const [variants, setVariants] = useState(initialVariants)

  // Update variants price suggestions when base price changes
  const handleBasePriceChange = (value: string) => {
    setBasePrice(value)
    const num = parseFloat(value || "0")
    if (isNaN(num)) return

    setVariants((prev) =>
      prev.map((v) => {
        let multiplier = 1.0
        if (v.size === "500ml Tin") multiplier = 1.8
        if (v.size === "1L Tin") multiplier = 3.2
        if (v.finish === "Basecoat") multiplier -= 0.15

        return {
          ...v,
          price: Math.round(num * multiplier).toString(),
        }
      })
    )
  }

  const handleVariantChange = (index: number, key: "price" | "inventory", value: string) => {
    setVariants((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [key]: value }
      return updated
    })
  }

  // Auto-generate handle based on title
  const handleTitleChange = (value: string) => {
    setTitle(value)
    setHandle(
      value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "")
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Map options to Medusa's expectations
      const options = [
        { title: "Size", values: SIZES },
        { title: "Finish", values: FINISHES },
      ]

      // Format variants payload
      const formattedVariants = variants.map((v) => ({
        title: `${v.size} / ${v.finish}`,
        options: {
          Size: v.size,
          Finish: v.finish,
        },
        prices: [
          {
            currency_code: "inr",
            amount: Math.round(parseFloat(v.price) * 100), // convert to smallest unit (cents/paise)
          },
        ],
        inventory_items: [
          {
            inventory_quantity: parseInt(v.inventory) || 0,
          },
        ],
      }))

      const payload = {
        title,
        handle,
        description,
        status: "published",
        options,
        variants: formattedVariants,
        category_ids: selectedCategory ? [selectedCategory] : [],
        metadata: {
          color_hex: hexColor,
          mix_ratio: mixRatio,
          hazmat_class: hazmatClass,
        },
      }

      await createAdminProduct(payload)
      onSuccess()
    } catch (err: any) {
      setError(err?.message || "Failed to create product. Check backend logs.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white border border-black p-6 md:p-10 my-8 shadow-none rounded-none text-black">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-black font-mono text-xl"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold uppercase tracking-wider mb-6 pb-2 border-b border-neutral-100">
          Add New Paint Color
        </h2>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-500 text-red-700 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Grid Layout for Forms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Side: General Specs & Visualizer */}
            <div className="space-y-6">
              <div>
                <label className="block text-xs uppercase font-mono tracking-wider text-neutral-500 mb-2">
                  Color Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Candy Apple Neon"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 focus:border-black focus:outline-none rounded-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-mono tracking-wider text-neutral-500 mb-2">
                  Handle (URL Path slug)
                </label>
                <input
                  type="text"
                  required
                  placeholder="candy-apple-neon"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 focus:border-black focus:outline-none rounded-none font-mono text-sm bg-neutral-50 text-neutral-600"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-mono tracking-wider text-neutral-500 mb-2">
                  Category
                </label>
                <select
                  required
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 focus:border-black focus:outline-none rounded-none bg-white font-mono text-sm"
                >
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase font-mono tracking-wider text-neutral-500 mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the paint finish, metallic flakes, and application specs..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 focus:border-black focus:outline-none rounded-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase font-mono tracking-wider text-neutral-500 mb-2">
                    Mix Ratio
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1:1"
                    value={mixRatio}
                    onChange={(e) => setMixRatio(e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-300 focus:border-black focus:outline-none rounded-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-mono tracking-wider text-neutral-500 mb-2">
                    Hazmat Class
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Class 3"
                    value={hazmatClass}
                    onChange={(e) => setHazmatClass(e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-300 focus:border-black focus:outline-none rounded-none"
                  />
                </div>
              </div>

              {/* Color Visualizer Section */}
              <div className="border border-neutral-200 p-6 bg-neutral-50 flex items-center gap-6">
                <div>
                  <label className="block text-xs uppercase font-mono tracking-wider text-neutral-500 mb-2">
                    HEX Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={hexColor}
                      onChange={(e) => setHexColor(e.target.value)}
                      className="w-12 h-12 p-0 border border-black cursor-pointer rounded-none"
                    />
                    <input
                      type="text"
                      required
                      placeholder="#000000"
                      value={hexColor}
                      onChange={(e) => setHexColor(e.target.value)}
                      className="w-28 px-3 border border-neutral-300 focus:border-black focus:outline-none rounded-none font-mono uppercase"
                    />
                  </div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 mb-1">
                    Storefront Render Preview
                  </span>
                  <div
                    style={{ backgroundColor: hexColor }}
                    className="w-16 h-16 rounded-full border border-black shadow-inner transition-colors duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Right Side: Pricing & Variants Setup */}
            <div className="space-y-6">
              <div>
                <label className="block text-xs uppercase font-mono tracking-wider text-neutral-500 mb-2">
                  Base Price (INR)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="1500"
                  value={basePrice}
                  onChange={(e) => handleBasePriceChange(e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 focus:border-black focus:outline-none rounded-none font-mono"
                />
                <p className="mt-1 text-xs text-neutral-400">
                  Changing base price automatically scales variants prices suggestions.
                </p>
              </div>

              <div>
                <label className="block text-xs uppercase font-mono tracking-wider text-neutral-500 mb-3">
                  Variants Customizer
                </label>
                <div className="border border-neutral-200 max-h-[300px] overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-neutral-100 border-b border-neutral-200">
                        <th className="p-2.5 font-mono uppercase tracking-wider text-neutral-500 font-semibold">Variant Spec</th>
                        <th className="p-2.5 font-mono uppercase tracking-wider text-neutral-500 font-semibold w-28">Price (₹)</th>
                        <th className="p-2.5 font-mono uppercase tracking-wider text-neutral-500 font-semibold w-24">Qty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {variants.map((v, index) => (
                        <tr key={index} className="border-b border-neutral-100 hover:bg-neutral-50">
                          <td className="p-2.5 font-medium">
                            {v.size} / {v.finish}
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              required
                              value={v.price}
                              onChange={(e) => handleVariantChange(index, "price", e.target.value)}
                              className="w-full px-2 py-1 border border-neutral-200 focus:border-black focus:outline-none rounded-none font-mono"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              required
                              value={v.inventory}
                              onChange={(e) => handleVariantChange(index, "inventory", e.target.value)}
                              className="w-full px-2 py-1 border border-neutral-200 focus:border-black focus:outline-none rounded-none font-mono"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 border border-black hover:bg-neutral-50 transition-colors uppercase font-mono tracking-wider text-xs font-bold rounded-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-black text-white hover:bg-neutral-900 transition-colors uppercase font-mono tracking-widest text-xs font-bold disabled:bg-neutral-400 disabled:cursor-not-allowed rounded-none"
            >
              {loading ? "Adding Paint..." : "Publish to Store"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
