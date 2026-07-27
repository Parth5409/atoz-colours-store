export default async function FeaturedProducts() {
  const products = [
    { title: "Aether Dynamicshift®", price: "Rs. 1,700.00" },
    { title: "Monk Dynamicshift®", price: "Rs. 1,700.00" },
    { title: "Stealth Graphite", price: "Rs. 4,800.00" },
    { title: "Crimson Shadow®", price: "Rs. 2,850.00" },
  ];

  return (
    <div className="py-16 bg-white w-full">
      <div className="content-container flex flex-col items-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Top Picks Everyone's Talking About</h2>
        <p className="text-slate-500 mb-10 text-center max-w-2xl">
          Don't miss out on our best-selling paints. These favorites deliver standout color, performance, and value that customers keep coming back for.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {products.map((product, idx) => (
            <div key={idx} className="flex flex-col gap-4">
              {/* Product Image Placeholder */}
              <div className="w-full aspect-[4/5] bg-slate-200 rounded-3xl flex items-center justify-center overflow-hidden">
                 <span className="text-slate-400">Product Image</span>
              </div>
              
              <div className="text-center flex flex-col gap-1">
                <h3 className="font-semibold text-slate-800">{product.title}</h3>
                <p className="text-slate-600">From {product.price}</p>
              </div>

              <button className="w-full py-3 px-6 rounded-full border border-slate-300 font-semibold text-slate-800 hover:bg-slate-50 transition-colors">
                Choose options
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
