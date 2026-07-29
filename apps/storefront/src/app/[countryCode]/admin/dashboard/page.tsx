"use client"

import React, { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { retrieveAdminProducts, deleteAdminProduct, adminLogout, retrieveAdminCategories, checkAdminSession } from "@lib/data/admin"
import ColorForm from "../components/color-form"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("")
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
  
  const router = useRouter()
  const params = useParams()
  const countryCode = (params?.countryCode as string) || "dk"

  const loadData = async () => {
    setLoading(true)

    try {
      // Check server session
      const isAuthenticated = await checkAdminSession()
      if (!isAuthenticated) {
        router.push(`/${countryCode}/admin/login`)
        return
      }

      const [productsData, categoriesData] = await Promise.all([
        retrieveAdminProducts(),
        retrieveAdminCategories()
      ])
      
      setProducts(productsData || [])
      setCategories(categoriesData || [])
    } catch (err) {
      console.error("Dashboard data load error:", err)
    } finally {
      setLoading(false)
    }
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

  const getCategoryProductCount = (catId: string) => {
    return products.filter((p) => p.categories?.some((cat: any) => cat.id === catId)).length
  }

  return (
    <div className="flex-grow min-h-screen bg-[#F8F9FA] text-slate-900 font-sans">
      {/* Sleek Header Bar */}
      <header className="bg-neutral-900 text-white border-b border-black py-4 px-6 md:px-12 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs bg-white text-black px-2 py-0.5 uppercase font-bold tracking-widest">
            ATOZ
          </span>
          <span className="font-mono text-sm tracking-wider font-semibold uppercase text-neutral-200">
            Colours / Manager Dashboard
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddForm(true)}
            className="px-5 py-2.5 bg-white text-black hover:bg-neutral-100 transition-all uppercase font-mono tracking-wider text-[11px] font-bold shadow-sm rounded-none flex items-center gap-2"
          >
            <span>+</span> Add Paint Product
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2.5 border border-neutral-700 hover:border-white transition-colors uppercase font-mono tracking-wider text-[11px] font-semibold text-neutral-300 rounded-none"
          >
            Logout
          </button>
        </div>
      </header>

      {/* KPI Overview Cards */}
      <div className="max-w-7xl mx-auto w-full px-6 md:px-12 pt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-neutral-300 p-5 rounded-none shadow-sm">
            <span className="block text-[10px] uppercase font-mono text-neutral-400 font-bold tracking-wider">Total Paints</span>
            <span className="text-3xl font-extrabold tracking-tight text-slate-900">{products.length}</span>
          </div>
          <div className="bg-white border border-neutral-300 p-5 rounded-none shadow-sm">
            <span className="block text-[10px] uppercase font-mono text-neutral-400 font-bold tracking-wider">Categories</span>
            <span className="text-3xl font-extrabold tracking-tight text-slate-900">{categories.length}</span>
          </div>
          <div className="bg-white border border-neutral-300 p-5 rounded-none shadow-sm">
            <span className="block text-[10px] uppercase font-mono text-neutral-400 font-bold tracking-wider">Filtered View</span>
            <span className="text-3xl font-extrabold tracking-tight text-slate-900">{filteredProducts.length}</span>
          </div>
          <div className="bg-white border border-neutral-300 p-5 rounded-none shadow-sm flex flex-col justify-between">
            <span className="block text-[10px] uppercase font-mono text-neutral-400 font-bold tracking-wider">System Status</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase text-emerald-700">Live API</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto w-full px-6 md:px-12 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Sidebar Filters */}
        <aside className="w-full lg:w-64 shrink-0 space-y-6">
          {/* Search Box */}
          <div className="bg-white border border-neutral-300 p-5 rounded-none shadow-sm">
            <h3 className="text-xs uppercase font-mono tracking-wider text-neutral-500 mb-3 font-bold">
              Search Inventory
            </h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Search name, code, slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3.5 py-2 border border-neutral-300 focus:border-black focus:outline-none rounded-none text-xs font-mono"
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

          {/* Categories Sidebar */}
          <div className="bg-white border border-neutral-300 p-5 rounded-none shadow-sm">
            <h3 className="text-xs uppercase font-mono tracking-wider text-neutral-500 mb-4 font-bold">
              Filter Categories
            </h3>
            <div className="space-y-1 max-h-[350px] overflow-y-auto">
              <button
                onClick={() => setSelectedCategoryId("")}
                className={`w-full text-left px-3 py-2 text-xs uppercase font-mono tracking-wider transition-colors flex items-center justify-between rounded-none ${
                  selectedCategoryId === ""
                    ? "bg-black text-white font-bold"
                    : "hover:bg-neutral-100 text-neutral-700 font-medium"
                }`}
              >
                <span>All Categories</span>
                <span className={`px-1.5 py-0.5 text-[10px] ${selectedCategoryId === "" ? "bg-white text-black font-bold" : "bg-neutral-100 text-neutral-500"}`}>
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
                    <span className={`px-1.5 py-0.5 text-[10px] font-mono ${selectedCategoryId === cat.id ? "bg-white text-black font-bold" : "bg-neutral-100 text-neutral-500"}`}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </aside>

        {/* Right Column: Products Content View */}
        <main className="flex-grow space-y-4">
          {/* Header Controls: Grid vs Table view toggle */}
          <div className="flex items-center justify-between bg-white border border-neutral-300 p-3 px-5 shadow-sm">
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-500 font-bold">
              Showing {filteredProducts.length} Paints
            </span>
            <div className="flex items-center gap-1 border border-neutral-300 p-0.5 bg-neutral-100">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1 text-xs font-mono uppercase font-bold tracking-wider transition-colors ${
                  viewMode === "grid" ? "bg-black text-white" : "text-neutral-600 hover:text-black"
                }`}
              >
                Grid View
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-1 text-xs font-mono uppercase font-bold tracking-wider transition-colors ${
                  viewMode === "table" ? "bg-black text-white" : "text-neutral-600 hover:text-black"
                }`}
              >
                Table View
              </button>
            </div>
          </div>

          {loading ? (
            <div className="bg-white border border-neutral-300 py-32 text-center font-mono text-xs text-neutral-400 shadow-sm">
              Fetching system inventory...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white border border-neutral-300 py-24 px-8 text-center shadow-sm">
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
          ) : viewMode === "grid" ? (
            /* Modern Grid Card View */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((p) => {
                const hex = p.metadata?.color_hex || p.metadata?.hex || "#CCCCCC"
                const brand = p.metadata?.brand || "BLACKFX AUTOMOTIVE"
                const mixRatio = p.metadata?.mix_ratio || "N/A"
                const particleSize = p.metadata?.particle_size || "N/A"
                const categoryTag = p.categories?.[0]?.name || "Uncategorized"
                const image = p.thumbnail || p.images?.[0]?.url || p.metadata?.image_url

                const prices = p.variants
                  ?.flatMap((v: any) => v.prices?.map((pr: any) => pr.amount))
                  .filter((a: any) => typeof a === "number")
                  
                const minPrice = prices?.length ? Math.min(...prices) / 100 : 0
                const maxPrice = prices?.length ? Math.max(...prices) / 100 : 0
                const priceRange = minPrice && maxPrice 
                  ? minPrice === maxPrice 
                    ? `₹${minPrice.toFixed(0)}`
                    : `₹${minPrice.toFixed(0)} - ₹${maxPrice.toFixed(0)}`
                  : "N/A"

                return (
                  <div
                    key={p.id}
                    className="bg-white border border-neutral-300 hover:border-black transition-all shadow-sm flex flex-col group"
                  >
                    {/* Visual Image / Swatch Container */}
                    <div className="aspect-[4/3] bg-neutral-100 relative overflow-hidden border-b border-neutral-200">
                      {image ? (
                        <img
                          src={image}
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div
                          style={{ backgroundColor: hex }}
                          className="w-full h-full opacity-80"
                        />
                      )}
                      
                      {/* Swatch Badge */}
                      <div
                        style={{ backgroundColor: hex }}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full border-2 border-white shadow-md"
                        title={`Color HEX: ${hex}`}
                      />

                      <span className="absolute bottom-3 left-3 bg-black/80 text-white px-2 py-0.5 text-[9px] uppercase font-mono font-bold tracking-wider backdrop-blur-sm">
                        {categoryTag}
                      </span>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <span className="text-[9px] uppercase font-mono tracking-widest text-neutral-400 font-bold block">
                          {brand}
                        </span>
                        <h4 className="text-base font-bold text-slate-900 tracking-tight leading-tight mt-0.5">
                          {p.title}
                        </h4>
                        <div className="text-[11px] font-mono text-neutral-400 mt-1">
                          /{p.handle}
                        </div>
                      </div>

                      {/* Specs Mini Table */}
                      <div className="bg-neutral-50 border border-neutral-200 p-2.5 text-[10px] font-mono space-y-1 text-slate-700">
                        <div className="flex justify-between border-b border-neutral-200 pb-1">
                          <span className="text-neutral-400">Mix Ratio:</span>
                          <span className="font-bold">{mixRatio}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Particle:</span>
                          <span className="font-bold truncate max-w-[120px]">{particleSize}</span>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          {priceRange}
                        </span>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setEditingProduct(p)}
                            className="text-[11px] uppercase font-mono font-bold text-neutral-900 hover:text-blue-600 underline"
                          >
                            Edit
                          </button>
                          <LocalizedClientLink
                            href={`/products/${p.handle}`}
                            target="_blank"
                            className="text-[11px] uppercase font-mono font-bold text-neutral-500 hover:text-black underline"
                          >
                            View PDP
                          </LocalizedClientLink>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="text-[11px] uppercase font-mono font-bold text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            /* Table View */
            <div className="bg-white border border-neutral-300 overflow-x-auto rounded-none shadow-sm">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-neutral-100 border-b border-neutral-300 font-mono text-[10px] uppercase tracking-wider text-neutral-500 font-bold">
                    <th className="p-4">Visual Swatch</th>
                    <th className="p-4">Paint Information</th>
                    <th className="p-4">Mix Specs</th>
                    <th className="p-4">Pricing</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => {
                    const hex = p.metadata?.color_hex || p.metadata?.hex || "#CCCCCC"
                    const mixRatio = p.metadata?.mix_ratio || "N/A"
                    const hazmat = p.metadata?.hazmat_class || "N/A"
                    const categoryTag = p.categories?.[0]?.name || "Uncategorized"
                    
                    const prices = p.variants
                      ?.flatMap((v: any) => v.prices?.map((pr: any) => pr.amount))
                      .filter((a: any) => typeof a === "number")
                      
                    const minPrice = prices?.length ? Math.min(...prices) / 100 : 0
                    const maxPrice = prices?.length ? Math.max(...prices) / 100 : 0
                    const priceRange = minPrice && maxPrice 
                      ? minPrice === maxPrice 
                        ? `₹${minPrice.toFixed(0)}`
                        : `₹${minPrice.toFixed(0)} - ₹${maxPrice.toFixed(0)}`
                      : "N/A"

                    return (
                      <tr
                        key={p.id}
                        className="border-b border-neutral-200 last:border-none hover:bg-neutral-50 transition-colors text-sm"
                      >
                        <td className="p-4 w-24">
                          <div className="flex flex-col items-center gap-1">
                            <div
                              style={{ backgroundColor: hex }}
                              className="w-10 h-10 rounded-full border border-black shadow-inner"
                            />
                            <span className="font-mono text-[9px] text-neutral-400 uppercase">
                              {hex}
                            </span>
                          </div>
                        </td>

                        <td className="p-4 max-w-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{p.title}</span>
                            <span className="bg-neutral-100 border border-neutral-300 px-2 py-0.5 text-[9px] uppercase font-mono font-medium text-slate-700">
                              {categoryTag}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-neutral-400 mt-0.5">
                            /{p.handle}
                          </div>
                        </td>

                        <td className="p-4 font-mono text-[11px]">
                          <div>Ratio: <span className="font-bold text-black">{mixRatio}</span></div>
                          <div className="text-[10px] text-neutral-400">{hazmat}</div>
                        </td>

                        <td className="p-4 font-mono text-xs font-bold text-slate-900">
                          {priceRange}
                        </td>

                        <td className="p-4 text-right space-x-3">
                          <button
                            onClick={() => setEditingProduct(p)}
                            className="text-xs uppercase font-mono font-bold text-neutral-900 hover:text-blue-600 underline"
                          >
                            Edit
                          </button>
                          <LocalizedClientLink
                            href={`/products/${p.handle}`}
                            target="_blank"
                            className="text-xs uppercase font-mono font-bold text-neutral-600 hover:text-black underline"
                          >
                            View
                          </LocalizedClientLink>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="text-xs uppercase font-mono tracking-wider font-bold text-red-600 hover:text-red-900"
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

      {/* Color Creator / Editor Modal */}
      {(showAddForm || editingProduct) && (
        <ColorForm
          productToEdit={editingProduct}
          onClose={() => {
            setShowAddForm(false)
            setEditingProduct(null)
          }}
          onSuccess={() => {
            setShowAddForm(false)
            setEditingProduct(null)
            loadData()
          }}
        />
      )}
    </div>
  )
}

