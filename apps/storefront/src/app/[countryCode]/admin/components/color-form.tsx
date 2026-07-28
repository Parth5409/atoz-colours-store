"use client"

import React, { useState, useEffect } from "react"
import { createAdminProduct, retrieveAdminCategories } from "@lib/data/admin"

interface ColorFormProps {
  onClose: () => void
  onSuccess: () => void
}

const SIZES = ["300ml", "500ml", "1L"]
const FINISHES = ["Gloss", "Matte", "Basecoat"]

type TabType = "general" | "specs" | "media" | "guide" | "pricing"

export default function ColorForm({ onClose, onSuccess }: ColorFormProps) {
  const [activeTab, setActiveTab] = useState<TabType>("general")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("")

  // Form states
  const [brand, setBrand] = useState("BLACKFX AUTOMOTIVE")
  const [title, setTitle] = useState("")
  const [handle, setHandle] = useState("")
  const [description, setDescription] = useState("")
  const [hexColor, setHexColor] = useState("#00A86B")
  
  // Media / Image states
  const [coverImageUrl, setCoverImageUrl] = useState("https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=800&auto=format&fit=crop")
  const [galleryUrls, setGalleryUrls] = useState<string[]>([])
  const [newGalleryInput, setNewGalleryInput] = useState("")

  // Tech specs
  const [primaryBaseColor, setPrimaryBaseColor] = useState(
    "Over a Black base coat Recommended also White,Silver,Grey basecoat optional"
  )
  const [mixRatio, setMixRatio] = useState("2:1 pu Thinner ratio")
  const [particleSize, setParticleSize] = useState("15-78 UM Pearls")
  const [hazmatClass, setHazmatClass] = useState("Class 3")

  // Guide notes
  const [testSampleNote, setTestSampleNote] = useState(
    "Do a test sample for better understanding"
  )
  const [topCoatTitle, setTopCoatTitle] = useState("TOP COAT CLEAR")
  const [topCoatDesc, setTopCoatDesc] = useState(
    "Finish with a UV protected clear coat (typically 2-3 coats). For best results, follow the coating manufacturer's recommended flash time in between coats, according to the temperature you are spraying in"
  )
  const [pickupInfo, setPickupInfo] = useState(
    "Pickup available at blackfx ground floor 33/547 - Usually ready in 24 hours"
  )

  // Pricing
  const [basePrice, setBasePrice] = useState("1050")

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

  // Initial variants list
  const initialVariants = SIZES.flatMap((size) =>
    FINISHES.map((finish) => {
      let multiplier = 1.0
      if (size === "500ml") multiplier = 1.6
      if (size === "1L") multiplier = 3.0
      if (finish === "Basecoat") multiplier -= 0.1

      const price = Math.round(parseFloat(basePrice || "1050") * multiplier)

      return {
        size,
        finish,
        price: price.toString(),
        inventory: "50",
      }
    })
  )

  const [variants, setVariants] = useState(initialVariants)

  const handleBasePriceChange = (value: string) => {
    setBasePrice(value)
    const num = parseFloat(value || "0")
    if (isNaN(num)) return

    setVariants((prev) =>
      prev.map((v) => {
        let multiplier = 1.0
        if (v.size === "500ml") multiplier = 1.6
        if (v.size === "1L") multiplier = 3.0
        if (v.finish === "Basecoat") multiplier -= 0.1

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

  const handleTitleChange = (value: string) => {
    setTitle(value)
    setHandle(
      value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "")
    )
  }

  // Helper to automatically compress and resize large images under ~150KB
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement("canvas")
          const MAX_WIDTH = 800
          let width = img.width
          let height = img.height

          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width)
            width = MAX_WIDTH
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext("2d")
          ctx?.drawImage(img, 0, 0, width, height)

          // Export compressed JPEG at 65% quality
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.65)
          resolve(compressedDataUrl)
        }
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(file)
    })
  }


  // Handle image upload from computer with automatic compression
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    for (const file of Array.from(files)) {
      const compressed = await compressImage(file)
      if (!coverImageUrl) {
        setCoverImageUrl(compressed)
      } else {
        setGalleryUrls((prev) => [...prev, compressed])
      }
    }
  }


  const handleAddGalleryUrl = () => {
    if (newGalleryInput.trim()) {
      setGalleryUrls((prev) => [...prev, newGalleryInput.trim()])
      setNewGalleryInput("")
    }
  }

  const handleRemoveGalleryUrl = (index: number) => {
    setGalleryUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const options = [
        { title: "Size", values: SIZES },
        { title: "Finish", values: FINISHES },
      ]

      const formattedVariants = variants.map((v) => ({
        title: `${v.size} / ${v.finish}`,
        options: {
          Size: v.size,
          Finish: v.finish,
        },
        prices: [
          {
            currency_code: "inr",
            amount: Math.round(parseFloat(v.price) * 100),
          },
        ],
        manage_inventory: false,
      }))


      // Prepare images list
      const allImageUrls = [coverImageUrl, ...galleryUrls].filter(Boolean)
      const imagesPayload = allImageUrls.map((url) => ({ url }))

      const payload = {
        title,
        handle,
        description,
        status: "published",
        thumbnail: coverImageUrl || undefined,
        images: imagesPayload,
        options,
        variants: formattedVariants,
        categories: selectedCategory ? [{ id: selectedCategory }] : [],
        metadata: {

          brand,
          color_hex: hexColor,
          image_url: coverImageUrl,
          primary_base_color: primaryBaseColor,
          mix_ratio: mixRatio,
          particle_size: particleSize,
          test_sample_note: testSampleNote,
          top_coat_title: topCoatTitle,
          top_coat_desc: topCoatDesc,
          pickup_info: pickupInfo,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-white border border-black shadow-2xl rounded-none text-black my-6 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-black bg-neutral-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs bg-white text-black px-2 py-0.5 font-bold uppercase tracking-widest">
              NEW PAINT
            </span>
            <h2 className="text-sm font-mono uppercase tracking-wider font-bold">
              Automotive Color Creator
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-white font-mono text-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation Header */}
        <div className="bg-neutral-100 border-b border-neutral-200 px-6 flex items-center gap-2 overflow-x-auto text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`py-3 px-4 border-b-2 font-bold uppercase tracking-wider transition-colors flex items-center gap-2 ${
              activeTab === "general"
                ? "border-black text-black bg-white"
                : "border-transparent text-neutral-500 hover:text-black"
            }`}
          >
            <span>🎨</span> 1. Visuals & Identity
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("specs")}
            className={`py-3 px-4 border-b-2 font-bold uppercase tracking-wider transition-colors flex items-center gap-2 ${
              activeTab === "specs"
                ? "border-black text-black bg-white"
                : "border-transparent text-neutral-500 hover:text-black"
            }`}
          >
            <span>⚙️</span> 2. Tech Specs
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("media")}
            className={`py-3 px-4 border-b-2 font-bold uppercase tracking-wider transition-colors flex items-center gap-2 ${
              activeTab === "media"
                ? "border-black text-black bg-white"
                : "border-transparent text-neutral-500 hover:text-black"
            }`}
          >
            <span>🖼️</span> 3. Product Images
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("guide")}
            className={`py-3 px-4 border-b-2 font-bold uppercase tracking-wider transition-colors flex items-center gap-2 ${
              activeTab === "guide"
                ? "border-black text-black bg-white"
                : "border-transparent text-neutral-500 hover:text-black"
            }`}
          >
            <span>📋</span> 4. Application Guide
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("pricing")}
            className={`py-3 px-4 border-b-2 font-bold uppercase tracking-wider transition-colors flex items-center gap-2 ${
              activeTab === "pricing"
                ? "border-black text-black bg-white"
                : "border-transparent text-neutral-500 hover:text-black"
            }`}
          >
            <span>💰</span> 5. Price & Variants
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-500 text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Modal Main Body (Grid Layout with Form + Live Storefront Preview) */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
            
            {/* Left Side: Active Tab Form Fields (8 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* TAB 1: General & Visuals */}
              {activeTab === "general" && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div>
                    <label className="block text-xs uppercase font-mono tracking-wider text-neutral-500 mb-1 font-bold">
                      Brand / Subtitle Tagline
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. BLACKFX AUTOMOTIVE"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-neutral-300 focus:border-black focus:outline-none rounded-none text-sm font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-mono tracking-wider text-neutral-500 mb-1 font-bold">
                      Paint Color Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jade Green"
                      value={title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-neutral-300 focus:border-black focus:outline-none rounded-none text-sm font-sans font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-mono tracking-wider text-neutral-500 mb-1 font-bold">
                      URL Handle Slug
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="jade-green"
                      value={handle}
                      onChange={(e) => setHandle(e.target.value)}
                      className="w-full px-3.5 py-2 border border-neutral-300 focus:border-black focus:outline-none rounded-none font-mono text-xs bg-neutral-50 text-neutral-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-mono tracking-wider text-neutral-500 mb-1 font-bold">
                      Product Category
                    </label>
                    <select
                      required
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-neutral-300 focus:border-black focus:outline-none rounded-none bg-white font-mono text-xs"
                    >
                      {categories.map((cat: any) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-mono tracking-wider text-neutral-500 mb-1 font-bold">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Describe pigment properties, pearl reflection under sunlight, and finish style..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3.5 py-2 border border-neutral-300 focus:border-black focus:outline-none rounded-none text-xs resize-none"
                    />
                  </div>

                  {/* Interactive Swatch Picker */}
                  <div className="border border-neutral-200 p-4 bg-neutral-50 flex items-center justify-between gap-4">
                    <div>
                      <label className="block text-xs uppercase font-mono tracking-wider text-neutral-500 mb-1 font-bold">
                        Color Swatch HEX
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={hexColor}
                          onChange={(e) => setHexColor(e.target.value)}
                          className="w-10 h-10 p-0 border border-black cursor-pointer rounded-none"
                        />
                        <input
                          type="text"
                          required
                          placeholder="#00A86B"
                          value={hexColor}
                          onChange={(e) => setHexColor(e.target.value)}
                          className="w-28 px-3 border border-neutral-300 focus:border-black focus:outline-none rounded-none font-mono uppercase text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col items-center">
                      <span className="text-[10px] uppercase font-mono text-neutral-400 mb-1 font-bold">
                        Color Swatch
                      </span>
                      <div
                        style={{ backgroundColor: hexColor }}
                        className="w-12 h-12 rounded-full border border-black shadow-md transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Technical Specifications */}
              {activeTab === "specs" && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div>
                    <label className="block text-xs uppercase font-mono tracking-wider text-neutral-500 mb-1 font-bold">
                      Primary Base Color Recommendation
                    </label>
                    <textarea
                      rows={3}
                      value={primaryBaseColor}
                      onChange={(e) => setPrimaryBaseColor(e.target.value)}
                      placeholder="e.g. Over a Black base coat Recommended also White,Silver,Grey basecoat optional"
                      className="w-full px-3.5 py-2.5 border border-neutral-300 focus:border-black focus:outline-none rounded-none text-xs leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-mono tracking-wider text-neutral-500 mb-1 font-bold">
                      Mixing Ratio
                    </label>
                    <input
                      type="text"
                      value={mixRatio}
                      onChange={(e) => setMixRatio(e.target.value)}
                      placeholder="e.g. 2:1 pu Thinner ratio"
                      className="w-full px-3.5 py-2.5 border border-neutral-300 focus:border-black focus:outline-none rounded-none text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-mono tracking-wider text-neutral-500 mb-1 font-bold">
                      Particle Size
                    </label>
                    <input
                      type="text"
                      value={particleSize}
                      onChange={(e) => setParticleSize(e.target.value)}
                      placeholder="e.g. 15-78 UM Pearls"
                      className="w-full px-3.5 py-2.5 border border-neutral-300 focus:border-black focus:outline-none rounded-none text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-mono tracking-wider text-neutral-500 mb-1 font-bold">
                      Hazmat Safety Classification
                    </label>
                    <input
                      type="text"
                      value={hazmatClass}
                      onChange={(e) => setHazmatClass(e.target.value)}
                      placeholder="e.g. Class 3 Flammable"
                      className="w-full px-3.5 py-2.5 border border-neutral-300 focus:border-black focus:outline-none rounded-none text-xs"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: Media & Images */}
              {activeTab === "media" && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  {/* File Upload Button / Drag Drop Box */}
                  <div>
                    <label className="block text-xs uppercase font-mono tracking-wider text-neutral-500 mb-1 font-bold">
                      Upload Image Files from Computer
                    </label>
                    <div className="border-2 border-dashed border-neutral-300 hover:border-black p-6 text-center bg-neutral-50 transition-colors cursor-pointer relative">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <div className="space-y-1">
                        <span className="text-2xl block">📁</span>
                        <span className="text-xs font-mono font-bold uppercase tracking-wider block">
                          Click or drag image files here to upload
                        </span>
                        <span className="text-[11px] text-neutral-400 block">
                          Supports PNG, JPG, WEBP formats
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Direct Cover Image URL Input */}
                  <div>
                    <label className="block text-xs uppercase font-mono tracking-wider text-neutral-500 mb-1 font-bold">
                      Primary Cover Image URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={coverImageUrl}
                      onChange={(e) => setCoverImageUrl(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-neutral-300 focus:border-black focus:outline-none rounded-none text-xs font-mono"
                    />
                  </div>

                  {/* Additional Gallery URLs */}
                  <div>
                    <label className="block text-xs uppercase font-mono tracking-wider text-neutral-500 mb-1 font-bold">
                      Add Gallery Image URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="Paste image URL..."
                        value={newGalleryInput}
                        onChange={(e) => setNewGalleryInput(e.target.value)}
                        className="flex-1 px-3.5 py-2 border border-neutral-300 focus:border-black focus:outline-none rounded-none text-xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleAddGalleryUrl}
                        className="px-4 py-2 bg-black text-white font-mono text-xs font-bold uppercase tracking-wider rounded-none"
                      >
                        + Add Image
                      </button>
                    </div>
                  </div>

                  {/* Live Thumbnails Preview Grid */}
                  <div>
                    <label className="block text-xs uppercase font-mono tracking-wider text-neutral-500 mb-2 font-bold">
                      Image Gallery Preview ({1 + galleryUrls.length} images)
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      {coverImageUrl && (
                        <div className="relative border-2 border-black aspect-square overflow-hidden group">
                          <img
                            src={coverImageUrl}
                            alt="Cover"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-1 left-1 bg-black text-white text-[9px] font-mono font-bold px-1 py-0.5">
                            COVER
                          </span>
                        </div>
                      )}
                      {galleryUrls.map((url, idx) => (
                        <div key={idx} className="relative border border-neutral-300 aspect-square overflow-hidden group">
                          <img
                            src={url}
                            alt={`Gallery ${idx}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveGalleryUrl(idx)}
                            className="absolute top-1 right-1 bg-red-600 text-white text-[10px] w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: Application Guide & Pickup */}
              {activeTab === "guide" && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div>
                    <label className="block text-xs uppercase font-mono tracking-wider text-neutral-500 mb-1 font-bold">
                      Testing Sample Callout Note
                    </label>
                    <input
                      type="text"
                      value={testSampleNote}
                      onChange={(e) => setTestSampleNote(e.target.value)}
                      placeholder="Do a test sample for better understanding"
                      className="w-full px-3.5 py-2.5 border border-neutral-300 focus:border-black focus:outline-none rounded-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-mono tracking-wider text-neutral-500 mb-1 font-bold">
                      Top Coat Section Title
                    </label>
                    <input
                      type="text"
                      value={topCoatTitle}
                      onChange={(e) => setTopCoatTitle(e.target.value)}
                      placeholder="TOP COAT CLEAR"
                      className="w-full px-3.5 py-2.5 border border-neutral-300 focus:border-black focus:outline-none rounded-none text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-mono tracking-wider text-neutral-500 mb-1 font-bold">
                      Top Coat Clear Instructions
                    </label>
                    <textarea
                      rows={3}
                      value={topCoatDesc}
                      onChange={(e) => setTopCoatDesc(e.target.value)}
                      className="w-full px-3.5 py-2 border border-neutral-300 focus:border-black focus:outline-none rounded-none text-xs leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-mono tracking-wider text-neutral-500 mb-1 font-bold">
                      Store Pickup Availability Note
                    </label>
                    <input
                      type="text"
                      value={pickupInfo}
                      onChange={(e) => setPickupInfo(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-neutral-300 focus:border-black focus:outline-none rounded-none text-xs"
                    />
                  </div>
                </div>
              )}

              {/* TAB 5: Pricing & Variants */}
              {activeTab === "pricing" && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div>
                    <label className="block text-xs uppercase font-mono tracking-wider text-neutral-500 mb-1 font-bold">
                      Base Reference Price (INR ₹)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="1050"
                      value={basePrice}
                      onChange={(e) => handleBasePriceChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-neutral-300 focus:border-black focus:outline-none rounded-none font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-mono tracking-wider text-neutral-500 mb-2 font-bold">
                      Variant Matrix (300ml / 500ml / 1L $\times$ Finishes)
                    </label>
                    <div className="border border-neutral-200 max-h-[260px] overflow-y-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-neutral-100 border-b border-neutral-200 font-mono text-[10px] uppercase text-neutral-500">
                            <th className="p-2.5 font-bold">Variant Spec</th>
                            <th className="p-2.5 font-bold w-28">Price (₹)</th>
                            <th className="p-2.5 font-bold w-24">Stock Qty</th>
                          </tr>
                        </thead>
                        <tbody>
                          {variants.map((v, index) => (
                            <tr key={index} className="border-b border-neutral-100 hover:bg-neutral-50">
                              <td className="p-2.5 font-medium text-slate-800">
                                {v.size} / {v.finish}
                              </td>
                              <td className="p-1.5">
                                <input
                                  type="number"
                                  required
                                  value={v.price}
                                  onChange={(e) => handleVariantChange(index, "price", e.target.value)}
                                  className="w-full px-2 py-1 border border-neutral-200 focus:border-black focus:outline-none rounded-none font-mono"
                                />
                              </td>
                              <td className="p-1.5">
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
              )}
            </div>

            {/* Right Side: Real-time Live Storefront Card Preview (5 Cols) */}
            <div className="lg:col-span-5 border-l border-neutral-200 pl-0 lg:pl-8 flex flex-col justify-start">
              <div className="sticky top-0 bg-neutral-50 border border-neutral-300 p-5 rounded-none space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                  <span className="text-[10px] uppercase font-mono tracking-widest font-bold text-neutral-400">
                    LIVE STOREFRONT PREVIEW
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase">Realtime</span>
                  </div>
                </div>

                {/* Preview Card Body */}
                <div className="bg-white border border-black p-4 space-y-3">
                  {/* Image Preview */}
                  <div className="aspect-[4/3] bg-neutral-100 relative overflow-hidden border border-neutral-200">
                    {coverImageUrl ? (
                      <img
                        src={coverImageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-300 font-mono text-xs">
                        No Image Selected
                      </div>
                    )}
                    <div
                      style={{ backgroundColor: hexColor }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full border border-black shadow-md"
                      title={`HEX: ${hexColor}`}
                    />
                  </div>

                  {/* Brand & Title */}
                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-400 font-bold block">
                      {brand || "BRAND NAME"}
                    </span>
                    <h4 className="text-lg font-bold tracking-tight text-slate-900 leading-tight">
                      {title || "Paint Color Name"}
                    </h4>
                  </div>

                  {/* Mini Spec Box */}
                  <div className="bg-neutral-100 p-2.5 text-[10px] font-mono space-y-1 text-slate-700">
                    <div className="flex justify-between border-b border-neutral-200 pb-1">
                      <span className="text-neutral-400">Mix Ratio:</span>
                      <span className="font-bold">{mixRatio}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Particle Size:</span>
                      <span className="font-bold">{particleSize}</span>
                    </div>
                  </div>

                  {/* Price Preview */}
                  <div className="pt-1 flex items-center justify-between border-t border-neutral-100">
                    <span className="text-xs font-mono font-bold text-slate-900">
                      Rs. {parseFloat(basePrice || "0").toLocaleString("en-IN")}.00
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400 uppercase">
                      300ml / 500ml / 1L
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Modal Bottom Actions Footer */}
          <div className="flex items-center justify-between pt-6 border-t border-neutral-200 mt-6 bg-white">
            <div className="flex gap-2">
              {activeTab !== "general" && (
                <button
                  type="button"
                  onClick={() => {
                    const tabs: TabType[] = ["general", "specs", "media", "guide", "pricing"]
                    const idx = tabs.indexOf(activeTab)
                    if (idx > 0) setActiveTab(tabs[idx - 1])
                  }}
                  className="px-4 py-2 border border-neutral-300 font-mono text-xs font-bold uppercase tracking-wider hover:bg-neutral-50 rounded-none"
                >
                  ← Back
                </button>
              )}
              {activeTab !== "pricing" && (
                <button
                  type="button"
                  onClick={() => {
                    const tabs: TabType[] = ["general", "specs", "media", "guide", "pricing"]
                    const idx = tabs.indexOf(activeTab)
                    if (idx < tabs.length - 1) setActiveTab(tabs[idx + 1])
                  }}
                  className="px-4 py-2 border border-black bg-black text-white font-mono text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 rounded-none"
                >
                  Next Step →
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-5 py-2.5 border border-neutral-300 hover:border-black font-mono text-xs font-bold uppercase tracking-wider rounded-none"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-2.5 bg-black text-white hover:bg-neutral-900 font-mono text-xs font-bold uppercase tracking-widest disabled:bg-neutral-400 rounded-none shadow-md"
              >
                {loading ? "Publishing Paint..." : "Publish Paint Product"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

