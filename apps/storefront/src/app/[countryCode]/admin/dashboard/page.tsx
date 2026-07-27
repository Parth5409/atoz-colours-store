"use client"

import React, { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { retrieveAdminProducts, deleteAdminProduct, adminLogout, retrieveAdminCategories } from "@lib/data/admin"
import ColorForm from "../components/color-form"

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("")
  
  const router = useRouter()
  const params = useParams()
  const countryCode = params?.countryCode as string || "in"

  const loadData = async () => {
    setLoading(true)
    const [productsData, categoriesData] = await Promise.all([
      retrieveAdminProducts(),
      retrieveAdminCategories()
    ])

    // If we couldn't fetch products (e.g. unauthorized), redirect to login
    if (!productsData || productsData.length === 0) {
      const hasCookie = document.cookie.includes("_medusa_admin_jwt")
      if (!hasCookie) {
        router.push(`/${countryCode}/admin/login`)
        return
      }
    }
    
    setProducts(productsData || [])
    setCategories(categoriesData || [])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this paint color?")) {
      try {
        await deleteAdminProduct(id)
        loadData()
      } catch (err: any) {
        alert(err?.message || "Failed to delete product")
      }
    }
  }

  const handleLogout = async () => {
    await adminLogout()
  }

  // Filter products based on search and category
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.handle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory =
      !selectedCategoryId ||
      p.categories?.some((cat: any) => cat.id === selectedCategoryId)

    return matchesSearch && matchesCategory
  })

  // Get product count per category
  const getCategoryProductCount = (catId: string) => {
    return products.filter((p) => p.categories?.some((cat: any) => cat.id === catId)).length
  }

  return (
    <div className="flex-grow min-h-screen bg-[#FAFAFA] text-black">
      {/* Top Banner / Navbar */}
      <header className="bg-white border-b border-black py-4 px-6 md:px-12 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs bg-black text-white px-2 py-1 uppercase font-bold tracking-widest">
            ATOZ
          </span>
          <span className="font-mono text-sm tracking-wider font-semibold uppercase">
            Colours / Manager Panel
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowAddForm(true)}
            className="px-5 py-2.5 bg-black text-white hover:bg-neutral-900 transition-colors uppercase font-mono tracking-wider text-[11px] font-bold rounded-none"
          >
            + Add Paint
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 border border-neutral-300 hover:border-black transition-colors uppercase font-mono tracking-wider text-[11px] font-semibold rounded-none"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="max-w-7xl mx-auto w-full px-6 md:px-12 py-10 flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Sidebar with Filter & Categories */}
        <aside className="w-full lg:w-64 shrink-0 space-y-6">
          {/* Search Box */}
          <div className="bg-white border border-black p-5 rounded-none">
            <h3 className="text-xs uppercase font-mono tracking-wider text-neutral-400 mb-3 font-bold">
              Search Paint
            </h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3.5 py-2 border border-neutral-200 focus:border-black focus:outline-none rounded-none text-sm font-mono"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black font-mono text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Categories Sidebar List */}
          <div className="bg-white border border-black p-5 rounded-none">
            <h3 className="text-xs uppercase font-mono tracking-wider text-neutral-400 mb-4 font-bold">
              Filter Categories
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategoryId("")}
                className={`w-full text-left px-3 py-2 text-xs uppercase font-mono tracking-wider transition-colors flex items-center justify-between rounded-none ${
                  selectedCategoryId === ""
                    ? "bg-black text-white font-bold"
                    : "hover:bg-neutral-100 text-neutral-700 font-medium"
                }`}
              >
                <span>All Categories</span>
                <span className={`px-1.5 py-0.5 text-[10px] ${selectedCategoryId === "" ? "bg-white text-black" : "bg-neutral-100 text-neutral-500"}`}>
                  {products.length}
                </span>
              </button>

              {categories.map((cat) => {
                const count = getCategoryProductCount(cat.id)
                const isChild = !!cat.parent_category_id
                
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between rounded-none ${
                      isChild ? "pl-6 text-neutral-500 font-mono text-[11px]" : "uppercase font-mono tracking-wider font-semibold text-neutral-800"
                    } ${
                      selectedCategoryId === cat.id
                        ? "bg-black text-white font-bold"
                        : "hover:bg-neutral-100"
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    <span className={`px-1.5 py-0.5 text-[10px] font-mono ${selectedCategoryId === cat.id ? "bg-white text-black" : "bg-neutral-100 text-neutral-500"}`}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="bg-white border border-black p-5 rounded-none">
            <h3 className="text-xs uppercase font-mono tracking-wider text-neutral-400 mb-4 font-bold">
              Overview Statistics
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-neutral-100 p-3 bg-neutral-50">
                <span className="block text-[10px] uppercase font-mono text-neutral-400 font-medium">Total Paints</span>
                <span className="text-xl font-bold tracking-tight">{products.length}</span>
              </div>
              <div className="border border-neutral-100 p-3 bg-neutral-50">
                <span className="block text-[10px] uppercase font-mono text-neutral-400 font-medium">Categories</span>
                <span className="text-xl font-bold tracking-tight">{categories.length}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Column: Inventory List */}
        <main className="flex-grow">
          {loading ? (
            <div className="bg-white border border-black py-32 text-center font-mono text-xs text-neutral-400">
              Fetching system data...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white border border-black py-24 px-8 text-center">
              <p className="text-neutral-500 mb-5 font-mono text-xs uppercase tracking-wider">
                No matching paint colors found.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategoryId("")
                }}
                className="px-5 py-2.5 border border-black hover:bg-neutral-50 transition-colors uppercase font-mono tracking-wider text-[11px] font-bold rounded-none"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="bg-white border border-black overflow-x-auto rounded-none">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-neutral-50 border-b border-black font-mono text-[10px] uppercase tracking-wider text-neutral-400 font-bold">
                    <th className="p-4 md:p-5">Visual Code</th>
                    <th className="p-4 md:p-5">Paint Information</th>
                    <th className="p-4 md:p-5">Mix Specs</th>
                    <th className="p-4 md:p-5">Pricing (INR)</th>
                    <th className="p-4 md:p-5 text-right">Control</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => {
                    const hex = p.metadata?.color_hex || p.metadata?.hex || "#CCCCCC"
                    const mixRatio = p.metadata?.mix_ratio || "N/A"
                    const hazmat = p.metadata?.hazmat_class || "N/A"
                    const categoryTag = p.categories?.[0]?.name || "Uncategorized"
                    
                    // Show price range
                    const prices = p.variants
                      ?.flatMap((v: any) => v.prices?.map((pr: any) => pr.amount))
                      .filter((a: any) => typeof a === "number")
                      
                    const minPrice = prices?.length ? Math.min(...prices) / 100 : 0
                    const maxPrice = prices?.length ? Math.max(...prices) / 100 : 0
                    const priceRange = minPrice && maxPrice 
                      ? minPrice === maxPrice 
                        ? `₹${minPrice.toFixed(2)}`
                        : `₹${minPrice.toFixed(0)} - ₹${maxPrice.toFixed(0)}`
                      : "N/A"

                    return (
                      <tr
                        key={p.id}
                        className="border-b border-neutral-100 last:border-none hover:bg-neutral-50/50 transition-colors text-sm"
                      >
                        {/* Visual Color Circle */}
                        <td className="p-4 md:p-5 w-24">
                          <div className="flex flex-col items-center gap-1.5">
                            <div
                              style={{ backgroundColor: hex }}
                              className="w-11 h-11 rounded-full border border-black shadow-inner"
                              title={hex}
                            />
                            <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-tight">
                              {hex}
                            </span>
                          </div>
                        </td>

                        {/* Title, slug, description, category */}
                        <td className="p-4 md:p-5 max-w-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-base tracking-tight">{p.title}</span>
                            <span className="bg-neutral-100 text-black border border-neutral-200 px-2 py-0.5 text-[9px] uppercase font-mono font-medium">
                              {categoryTag}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-neutral-400 mt-1">
                            slug: /{p.handle}
                          </div>
                          <p className="text-xs text-neutral-500 line-clamp-2 mt-2 font-sans leading-relaxed">
                            {p.description}
                          </p>
                        </td>

                        {/* Mix Specs */}
                        <td className="p-4 md:p-5 font-mono text-[11px] text-neutral-600">
                          <div className="space-y-1">
                            <div>Ratio: <span className="font-bold text-black">{mixRatio}</span></div>
                            <div className="text-[10px] text-neutral-400 truncate max-w-[120px]" title={hazmat}>
                              {hazmat}
                            </div>
                          </div>
                        </td>

                        {/* Price Range */}
                        <td className="p-4 md:p-5 font-mono text-xs font-semibold text-black">
                          <div className="space-y-1">
                            <div>{priceRange}</div>
                            <div className="text-[10px] text-neutral-400 font-normal">
                              {p.variants?.length || 0} variants
                            </div>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="p-4 md:p-5 text-right">
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="text-xs uppercase font-mono tracking-wider font-bold text-red-600 hover:text-red-900 transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* Slide-over color creator modal */}
      {showAddForm && (
        <ColorForm
          onClose={() => setShowAddForm(false)}
          onSuccess={() => {
            setShowAddForm(false)
            loadData()
          }}
        />
      )}
    </div>
  )
}
