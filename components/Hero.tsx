export function Hero() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 md:px-8 pt-8 md:pt-12 pb-16 md:pb-32">
      <div className="flex items-start justify-between text-[10px] tracking-[0.28em] uppercase text-muted-foreground">
        <span>Korean Organic Skincare</span>
        <span>Hong Kong</span>
      </div>

      <div className="relative mt-10 md:mt-16 grid grid-cols-12 gap-4 md:gap-6">
        {/* Left: note + product image */}
        <div className="col-span-4 flex flex-col gap-6 md:gap-10 pt-6 md:pt-12">
          <p className="max-w-[18ch] text-sm leading-relaxed text-foreground/70">
            Gentle Korean skincare crafted with natural botanicals and essential oils.
          </p>
          <div className="mt-4 md:mt-8 aspect-[3/4] w-full overflow-hidden bg-cream rounded-lg">
            <img
              src="https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=400&h=533&fit=crop"
              alt="Oat cream moisturizer"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Center: hero image */}
        <div className="col-span-4 -mt-2 md:-mt-4">
          <div className="mx-auto aspect-[3/4] w-full overflow-hidden bg-cream rounded-lg">
            <img
              src="https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400&h=533&fit=crop"
              alt="Skincare editorial"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Right: product on surface */}
        <div className="col-span-4 flex flex-col items-end pt-16 md:pt-32">
          <div className="aspect-square w-[78%] overflow-hidden bg-cream rounded-lg">
            <img
              src="https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=400&fit=crop"
              alt="Serum bottle"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      <h1 className="mt-12 md:mt-20 text-center text-[clamp(3rem,12vw,11rem)] leading-none font-serif italic tracking-tight">
        Cozy Nest
      </h1>
    </section>
  );
}
