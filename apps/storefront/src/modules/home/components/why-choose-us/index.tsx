export default function WhyChooseUs() {
  return (
    <div className="py-16 bg-white w-full">
      <div className="content-container flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
        {/* Image Left */}
        <div className="flex-1 w-full bg-slate-200 aspect-[3/4] max-h-[600px] flex items-center justify-center relative overflow-hidden">
           <span className="text-slate-400 text-lg">Image Placeholder</span>
        </div>

        {/* Text Right */}
        <div className="flex-1 flex flex-col gap-6 p-4">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 leading-tight">
            Why AtoZ Colours Automotive Leads in Custom Paints & Finishes
          </h2>
          <p className="text-slate-600 text-base leading-relaxed">
            At <strong>AtoZ Colours Automotive</strong>, performance and creativity go hand in hand. We develop professional-grade automotive paints and custom coating solutions designed for flawless application, deep color impact, and long-lasting results.
          </p>
          
          <div className="flex flex-col gap-2 mt-2">
            <h3 className="font-bold text-lg text-slate-800">Unmatched Product Quality</h3>
            <p className="text-slate-600">Formulated using premium raw materials and advanced processes to deliver superior coverage, depth, and durability — trusted by professionals and enthusiasts alike.</p>
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <h3 className="font-bold text-lg text-slate-800">Innovation That Inspires</h3>
            <p className="text-slate-600">From rich candy colors and vivid pearls to advanced effect finishes, AtoZ Colours gives you the freedom to create bold, standout builds without compromise.</p>
          </div>

          <p className="font-bold text-slate-800 mt-2">
            AtoZ Colours Automotive — Engineered for Performance. Built for Creators.
          </p>

          <div className="mt-4">
            <button className="bg-slate-900 text-white px-8 py-3 rounded-full font-semibold hover:bg-slate-800 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
