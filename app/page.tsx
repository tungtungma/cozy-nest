"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import Link from "next/link";

interface Product {
  id: string;
  nameEn: string;
  nameZh: string;
  priceHkd: number;
  imageUrl: string | null;
  category: string | null;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .catch(() => {});
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <Hero />

      {/* Product grid from database */}
      <section className="mx-auto max-w-7xl px-8 py-20">
        <p className="text-center text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-6">
          Our Collection
        </p>
        <h2 className="text-center font-serif text-3xl md:text-5xl mb-16">
          Korean <em className="italic">organic</em> skincare
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group block"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-cream rounded-lg mb-6">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.nameEn}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-xs uppercase">
                    No image
                  </div>
                )}
              </div>
              <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-2">
                {product.category}
              </p>
              <h3 className="font-serif text-lg mb-1 group-hover:text-accent transition">
                {product.nameEn}
              </h3>
              <p className="text-xs text-muted-foreground mb-2">
                {product.nameZh}
              </p>
              <p className="font-serif text-base text-accent">
                HK${product.priceHkd}
              </p>
            </Link>
          ))}
        </div>

        {products.length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 opacity-50">
            {[...Array(6)].map((_, i) => (
              <div key={i}>
                <div className="aspect-[4/5] bg-cream rounded-lg mb-6 animate-pulse" />
                <div className="h-3 w-1/3 bg-cream rounded mb-2" />
                <div className="h-5 w-3/4 bg-cream rounded mb-2" />
                <div className="h-4 w-1/4 bg-cream rounded" />
              </div>
            ))}
          </div>
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
