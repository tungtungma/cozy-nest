"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";

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

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("");
  const [note, setNote] = useState("");
  const [receiptUrl, setReceiptUrl] = useState("");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("cozy-cart") || "[]");
    setItems(stored);
    if (stored.length === 0) router.push("/cart");
  }, [router]);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryFee = 0; // Free delivery for now
  const total = subtotal + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !address) {
      setError("Please fill in all required fields");
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
          })),
          subtotal,
          deliveryFee,
          total,
          deliveryMethod: "home-delivery",
          deliveryAddress: {
            fullName,
            phone,
            street: address,
            district,
          },
          paymentMethod: "fps",
          paymentReceiptUrl: receiptUrl || null,
          customerNote: note || null,
          preferredLanguage: "en",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.removeItem("cozy-cart");
        router.push(`/orders/${data.order.id}`);
      } else {
        setError(data.error || data.message || "Failed to place order");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <section className="mx-auto max-w-4xl px-8 py-24">
        <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-4">
          Secure Checkout
        </p>
        <h1 className="font-serif text-5xl md:text-6xl mb-16">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Left: Form */}
            <div className="lg:col-span-3 space-y-10">
              {/* Delivery Information */}
              <div>
                <h2 className="font-serif text-2xl mb-6">Delivery Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-border rounded-lg text-sm focus:border-accent outline-none transition"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-border rounded-lg text-sm focus:border-accent outline-none transition"
                      placeholder="+852 XXXX XXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2">
                      Address *
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-border rounded-lg text-sm focus:border-accent outline-none transition"
                      placeholder="Street address"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2">
                      District
                    </label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-border rounded-lg text-sm focus:border-accent outline-none transition"
                      placeholder="e.g. Central, Kowloon"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h2 className="font-serif text-2xl mb-6">Payment</h2>
                <div className="bg-cream rounded-lg p-6 space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-foreground" />
                    <span className="font-serif text-lg">FPS — Fast Payment System</span>
                  </div>

                  {/* QR Code */}
                  <div className="flex justify-center">
                    <div className="w-48 h-48 bg-white border-2 border-dashed border-border rounded-lg flex items-center justify-center">
                      <div className="text-center px-4">
                        <span className="text-3xl block mb-2">📱</span>
                        <p className="text-[10px] tracking-wider text-muted-foreground leading-relaxed">
                          FPS QR Code<br />
                          <span className="text-accent">(upload to /public/fps-qr.png)</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 text-sm space-y-2">
                    <p className="font-medium text-foreground">Bank Transfer Details</p>
                    <p className="text-muted-foreground text-xs">
                      FPS ID: <span className="text-foreground font-mono">(your FPS ID)</span>
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      After placing your order, scan the QR code or transfer to our
                      FPS ID. We verify payments manually via online banking.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2">
                      Payment Receipt (screenshot URL)
                    </label>
                    <input
                      type="url"
                      value={receiptUrl}
                      onChange={(e) => setReceiptUrl(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-border rounded-lg text-sm focus:border-accent outline-none transition"
                      placeholder="Upload to Google Drive and paste link here"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2">
                  Order Note (optional)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-white border border-border rounded-lg text-sm focus:border-accent outline-none transition resize-none"
                  placeholder="Special instructions..."
                />
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-2">
              <div className="bg-cream rounded-lg p-8 sticky top-24">
                <h2 className="font-serif text-2xl mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div
                      key={`${item.productId}-${item.variantId}`}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-foreground/70">
                        {item.nameEn}
                        {item.weight ? ` (${item.weight})` : ""} ×{" "}
                        {item.quantity}
                      </span>
                      <span className="font-medium">
                        HK${(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>HK${subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery</span>
                    <span>{deliveryFee === 0 ? "Free" : `HK$${deliveryFee}`}</span>
                  </div>
                  <div className="flex justify-between font-serif text-xl pt-2 border-t border-border mt-2">
                    <span>Total</span>
                    <span className="text-accent">HK${total.toLocaleString()}</span>
                  </div>
                </div>

                {error && (
                  <p className="text-red-500 text-xs mt-4 bg-red-50 p-3 rounded-lg">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting || items.length === 0}
                  className="btn-pill-dark w-full mt-6 disabled:opacity-50"
                >
                  {submitting ? "Placing Order..." : "Place Order"}
                </button>
              </div>
            </div>
          </div>
        </form>
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
