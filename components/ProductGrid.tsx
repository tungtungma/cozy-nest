import Link from "next/link";

const products = [
  {
    name: "Oat Cream",
    subtitle: "Deep moisturizing enhancement",
    price: "$48",
    img: "/images/product-cream.jpg",
  },
  {
    name: "Oat Serum",
    subtitle: "Brightening botanical complex",
    price: "$62",
    img: "/images/product-serum.jpg",
  },
  {
    name: "Essential Water",
    subtitle: "Hydrating ginseng toner",
    price: "$38",
    img: "/images/product-water.jpg",
  },
  {
    name: "Cleansing Powder",
    subtitle: "Gentle daily polish",
    price: "$34",
    img: "/images/product-powder.jpg",
  },
];

export function ProductGrid() {
  return (
    <section className="relative mx-auto max-w-7xl px-8 py-32">
      {/* Section header */}
      <div className="flex items-end justify-between mb-16">
        <div>
          <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-4">
            Oat Collection
          </p>
          <h2 className="font-serif text-5xl md:text-6xl">
            A complex of <em>essential</em> oils
          </h2>
        </div>
        <Link
          href="/shop"
          className="hidden md:inline-flex items-center justify-center rounded-full border border-foreground/30 px-10 py-4 text-xs tracking-[0.25em] uppercase hover:bg-foreground hover:text-background transition"
        >
          Shop Now
        </Link>
      </div>

      {/* Product cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((p) => (
          <article key={p.name} className="group flex flex-col">
            <div className="relative aspect-[4/5] overflow-hidden bg-cream">
              <img
                src={p.img}
                alt={p.name}
                loading="lazy"
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
            </div>
            <div className="mt-6 flex items-baseline justify-between">
              <div>
                <h3 className="font-serif text-2xl">{p.name}</h3>
                <p className="mt-1 text-xs tracking-wider text-muted-foreground">
                  {p.subtitle}
                </p>
              </div>
              <span className="font-serif text-lg text-accent">{p.price}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
