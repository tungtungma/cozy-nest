"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/Header";
import Link from "next/link";
import { useCart } from "@/store/useCart";
import { useCartSidebar } from "@/components/GlobalCartProvider";
import type { ProductVariant } from "@/types/product";

interface Variant {
  id: string;
  weight: string;
  priceHkd: number;
  platinumPriceHkd: number | null | undefined;
  stockQuantity: number;
}

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
  variants: Variant[];
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const { openCart } = useCartSidebar();

  useEffect(() => {
    if (!id) return;
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setProduct(data.product);
        if (data.product?.variants?.length > 0) {
          setSelectedVariant(data.product.variants[0]);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const addToCart = () => {
    if (!product || !selectedVariant) return;
    addItem(
      {
        id: product.id,
        name_en: product.nameEn,
        name_zh: product.nameZh,
        price_hkd: selectedVariant.priceHkd,
        grade: "Premium" as any,
        weight: selectedVariant.weight,
        image_url: product.imageUrl || "",
        description_en: product.descriptionEn || "",
        description_zh: product.descriptionZh || "",
        origin: "",
        origin_zh: "",
        preparation_tips_en: "",
        preparation_tips_zh: "",
        category: product.category || "",
        category_zh: "",
        in_stock: product.inStock,
      },
      {
        id: selectedVariant.id,
        weight: selectedVariant.weight,
        priceHkd: selectedVariant.priceHkd,
        platinumPriceHkd: selectedVariant.platinumPriceHkd,
        stockQuantity: selectedVariant.stockQuantity,
      } as ProductVariant,
      quantity
    );
    setAdded(true);
    openCart(); // Auto-open sidebar
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="mx-auto max-w-7xl px-8 py-24 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="aspect-[4/5] bg-cream rounded-lg" />
            <div className="space-y-6">
              <div className="h-8 w-3/4 bg-cream rounded" />
              <div className="h-4 w-1/2 bg-cream rounded" />
              <div className="h-32 bg-cream rounded" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="mx-auto max-w-7xl px-8 py-24 text-center">
          <h1 className="font-serif text-4xl">Product not found</h1>
          <Link href="/products" className="btn-pill-outline mt-8">
            Back to products
          </Link>
        </div>
      </main>
    );
  }

  const displayPrice = selectedVariant?.priceHkd || product.priceHkd;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <section className="mx-auto max-w-7xl px-8 py-16">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-xs tracking-wider uppercase text-muted-foreground hover:text-accent transition mb-8"
        >
          ← Back to products
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Image */}
          <div className="aspect-[4/5] overflow-hidden bg-cream rounded-lg">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.nameEn}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No image
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center">
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-4">
              {product.category || "Skincare"}
            </p>
            <h1 className="font-serif text-4xl md:text-5xl mb-3">
              {product.nameEn}
            </h1>
            <p className="text-sm tracking-wider text-muted-foreground mb-6">
              {product.nameZh}
            </p>

            {product.descriptionEn && (
              <p className="text-sm leading-relaxed text-foreground/70 mb-8 max-w-lg">
                {product.descriptionEn}
              </p>
            )}

            {/* Variant selector */}
            {product.variants.length > 0 && (
              <div className="mb-6">
                <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3">
                  Size / Weight
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => {
                        setSelectedVariant(v);
                        setQuantity(1);
                      }}
                      disabled={v.stockQuantity <= 0}
                      className={`px-4 py-2 text-xs rounded-full border transition ${
                        selectedVariant?.id === v.id
                          ? "border-foreground bg-foreground text-background"
                          : "border-border hover:border-foreground/40"
                      } ${v.stockQuantity <= 0 ? "opacity-40 cursor-not-allowed" : ""}`}
                    >
                      {v.weight}
                      {v.stockQuantity <= 0 && " (sold out)"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price */}
            <p className="font-serif text-3xl text-accent mb-8">
              HK${displayPrice.toLocaleString()}
            </p>

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-8">
              <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                Qty
              </p>
              <div className="flex items-center border border-border rounded-full">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 text-sm hover:text-accent transition"
                >
                  −
                </button>
                <span className="px-4 py-2 text-sm font-medium min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 text-sm hover:text-accent transition"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to cart */}
            <button
              onClick={addToCart}
              disabled={
                !product.inStock ||
                (selectedVariant ? selectedVariant.stockQuantity <= 0 : false)
              }
              className={`btn-pill-dark w-full md:w-auto ${
                added ? "bg-green-600" : ""
              } ${
                !product.inStock ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {added
                ? "✓ Added to cart"
                : product.inStock
                ? "Add to Cart"
                : "Sold Out"}
            </button>

            <button
              onClick={openCart}
              className="inline-flex items-center justify-center rounded-full border border-foreground/30 px-10 py-4 text-xs tracking-[0.25em] uppercase hover:bg-foreground hover:text-background transition mt-4 text-center"
            >
              View Cart
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60">
        <div className="mx-auto max-w-7xl px-8 py-12 flex items-center justify-between text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
          <span>© {new Date().getFullYear()} Cozy Nest</span>
          <span>All rights reserved</span>
        </div>
      </footer>
    </main>
  );
}
