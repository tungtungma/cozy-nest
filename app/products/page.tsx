"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import Link from "next/link";

interface Product {
  id: string;
  nameEn: string;
  nameZh: string;
  descriptionEn: string | null;
  descriptionZh: string | null;
  priceHkd: number;
  imageUrl: string | null;
  category: string | null;
  inStock: boolean;
  variants: Array<{
    id: string;
    weight: string;
    priceHkd: number;
    stockQuantity: number;
  }>;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => setProducts(data.products || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <section className="mx-auto max-w-7xl px-8 py-24">
        <div className="mb-16">
          <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-4">
            Our Collection
          </p>
          <h1 className="font-serif text-5xl md:text-6xl">
            Korean <em>organic</em> skincare
          </h1>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/5] bg-cream rounded-lg" />
                <div className="mt-6 h-6 w-3/4 bg-cream rounded" />
                <div className="mt-2 h-4 w-1/2 bg-cream rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group flex flex-col"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-cream rounded-lg">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.nameEn}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                      No image
                    </div>
                  )}
                  {!product.inStock && (
                    <span className="absolute top-4 left-4 px-3 py-1 bg-foreground/80 text-background text-xs rounded-full">
                      Sold Out
                    </span>
                  )}
                </div>
                <div className="mt-6">
                  <h3 className="font-serif text-2xl">{product.nameEn}</h3>
                  <p className="mt-1 text-xs tracking-wider text-muted-foreground">
                    {product.nameZh}
                  </p>
                  <span className="inline-block mt-3 font-serif text-lg text-accent">
                    HK${product.priceHkd.toLocaleString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && products.length === 0 && (
          <p className="text-center text-muted-foreground py-16">
            No products available yet.
          </p>
        )}
      </section>

      <footer className="border-t border-border/60 mt-12">
        <div className="mx-auto max-w-7xl px-8 py-12 flex items-center justify-between text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
          <span>© {new Date().getFullYear()} Cozy Nest</span>
          <span>All rights reserved</span>
        </div>
      </footer>
    </main>
  );
}
