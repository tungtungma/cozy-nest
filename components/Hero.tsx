export function Hero() {
  return (
    <section className="relative mx-auto max-w-7xl px-8 pt-12 pb-32">
      {/* Top bar */}
      <div className="flex items-start justify-between text-[10px] tracking-[0.28em] uppercase text-muted-foreground">
        <span>Webdesign · E-Commerce Concept</span>
        <span>December 2026</span>
      </div>

      {/* Three-column image grid */}
      <div className="relative mt-16 grid grid-cols-12 gap-6">
        {/* Left: note + product image */}
        <div className="col-span-4 flex flex-col gap-10 pt-12">
          <p className="max-w-[18ch] text-sm leading-relaxed text-foreground/70">
            Web design concept for online store of care cosmetics. All content
            has been used on a non-commercial basis.
          </p>
          <div className="mt-8 aspect-[3/4] w-full overflow-hidden bg-cream">
            <img
              src="/images/product-cream.jpg"
              alt="Oat cream"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Center: oval hero image */}
        <div className="col-span-4 -mt-4">
          <div className="mx-auto aspect-[3/4] w-full overflow-hidden bg-cream-deep rounded-oval">
            <img
              src="/images/hero-model.jpg"
              alt="Skincare editorial"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Right: product on stone */}
        <div className="col-span-4 flex flex-col items-end pt-32">
          <div className="aspect-square w-[78%] overflow-hidden bg-cream">
            <img
              src="/images/product-serum.jpg"
              alt="Oat serum"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      {/* Main headline */}
      <h1 className="mt-20 text-center text-[clamp(4rem,12vw,11rem)] leading-none font-serif italic tracking-tight">
        Cozy Nest
      </h1>
    </section>
  );
}
