"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import Link from "next/link";

interface CartItem {
  productId: string;
  variantId: string;
  nameEn: string;
  nameZh: string;
  imageUrl: string | null;
  weight: string;
  price: number;
  quantity: number;
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("cozy-cart") || "[]");
    setItems(stored);
  }, []);

  const updateQuantity = (index: number, delta: number) => {
    const updated = [...items];
    updated[index].quantity = Math.max(1, updated[index].quantity + delta);
    setItems(updated);
    localStorage.setItem("cozy-cart", JSON.stringify(updated));
  };

  const removeItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    localStorage.setItem("cozy-cart", JSON.stringify(updated));
  };

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <section className="mx-auto max-w-4xl px-8 py-24">
        <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-4">
          Your Bag
        </p>
        <h1 className="font-serif text-5xl md:text-6xl mb-16">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground mb-8">
              Your cart is empty.
            </p>
            <Link href="/products" className="btn-pill-outline">
              Browse Products
            </Link>
          </div>
        ) : (
          <>
            {/* Cart items */}
            <div className="space-y-6 mb-12">
              {items.map((item, i) => (
                <div
                  key={`${item.productId}-${item.variantId}`}
                  className="flex gap-6 py-6 border-b border-border/60"
                >
                  {/* Image */}
                  <div className="w-24 h-32 bg-cream rounded-lg overflow-hidden flex-shrink-0">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.nameEn}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                        No img
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-xl mb-1">{item.nameEn}</h3>
                    <p className="text-xs tracking-wider text-muted-foreground mb-1">
                      {item.nameZh}
                    </p>
                    {item.weight && (
                      <p className="text-[10px] tracking-wider uppercase text-muted-foreground mb-3">
                        {item.weight}
                      </p>
                    )}

                    <div className="flex items-center gap-4">
                      {/* Quantity */}
                      <div className="flex items-center border border-border rounded-full">
                        <button
                          onClick={() => updateQuantity(i, -1)}
                          className="px-3 py-1 text-sm hover:text-accent"
                        >
                          −
                        </button>
                        <span className="px-3 py-1 text-sm min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(i, 1)}
                          className="px-3 py-1 text-sm hover:text-accent"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(i)}
                        className="text-[10px] tracking-wider uppercase text-muted-foreground hover:text-red-500 transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <p className="font-serif text-lg text-accent">
                      HK${(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="border-t border-foreground/10 pt-8">
              <div className="flex justify-between items-baseline mb-8">
                <span className="text-sm tracking-wider uppercase text-muted-foreground">
                  Subtotal
                </span>
                <span className="font-serif text-2xl text-accent">
                  HK${subtotal.toLocaleString()}
                </span>
              </div>

              <Link
                href="/checkout"
                className="btn-pill-dark w-full text-center"
              >
                Proceed to Checkout
              </Link>

              <Link
                href="/products"
                className="block text-center text-xs tracking-wider uppercase text-muted-foreground hover:text-accent transition mt-6"
              >
                Continue Shopping
              </Link>
            </div>
          </>
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
