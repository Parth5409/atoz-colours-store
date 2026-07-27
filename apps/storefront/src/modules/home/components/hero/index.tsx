const Hero = () => {
  return (
    <div className="py-16 bg-white w-full">
      <div className="content-container flex flex-col lg:flex-row items-center gap-12">
        {/* Image Card Left */}
        <div className="flex-1 w-full bg-slate-100 rounded-2xl shadow-xl overflow-hidden min-h-[400px] flex items-center justify-center relative">
          <div className="text-slate-400 text-lg">Product Image Placeholder</div>
          {/* Tagline */}
          <div className="absolute bottom-6 inset-x-0 text-center">
             <p className="text-sm text-slate-500 font-medium">Pearls | Paints | Effects</p>
             <p className="font-bold text-slate-800 uppercase tracking-widest mt-1">AtoZ Colours Automotive</p>
          </div>
        </div>

        {/* Text Right */}
        <div className="flex-1 flex flex-col gap-6 p-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">
            Engineered by Passion<br />Perfected by Precision
          </h1>
          <p className="text-slate-700 text-base leading-relaxed max-w-lg">
            Built from passion and perfected through precision,
            AtoZ Colours Automotive represents years of research, testing,
            and craftsmanship. Since 2018, every formulation is
            engineered in our paint lab to deliver depth, durability, and
            unmatched visual impact — where technology meets
            emotion, and finishes become art.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Hero;
