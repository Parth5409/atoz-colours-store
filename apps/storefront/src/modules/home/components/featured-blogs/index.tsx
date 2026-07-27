export default function FeaturedBlogs() {
  const blogs = [
    {
      title: "Inside AtoZ R&D",
      excerpt: "AtoZ R&D LAB Where Automotive Finishes Are Engineered — Not Imitated. Innovation Is Our Core At AtoZ Colours, Research & Development is not a department — it's the heartbeat of...",
    },
    {
      title: "What Makes AtoZ Paints Different From Regular...",
      excerpt: "Across India, the automotive paint market is crowded with local paint shops, fast mixers, and social-media sellers. On the surface, everything looks premium — flashy reels, extreme filters, heavy lighting...",
    },
    {
      title: "Candy Red",
      excerpt: "AtoZ Candy Series – Once You Try It, There's No Going Back. In the world of custom automotive painting, some finishes don't just change the colour — they change...",
    }
  ]

  return (
    <div className="py-16 bg-slate-50 w-full border-t border-slate-200">
      <div className="content-container">
        <h2 className="text-3xl font-bold text-slate-900 mb-10">Checkout our Featured Blogs</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blogs.map((blog, idx) => (
            <div key={idx} className="bg-black text-white flex flex-col group overflow-hidden cursor-pointer">
              {/* Blog Image */}
              <div className="w-full aspect-[4/3] bg-slate-800 flex items-center justify-center overflow-hidden">
                <span className="text-slate-500">Blog Image</span>
              </div>
              
              {/* Blog Content */}
              <div className="p-8 flex flex-col items-center text-center gap-4">
                <h3 className="text-2xl font-bold group-hover:underline underline-offset-4 decoration-white">
                  {blog.title}
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed max-w-sm">
                  {blog.excerpt}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
