"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { useCart } from "@/store/useCart";
import { useLanguage } from "@/contexts/LanguageContext";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCart();
  const { language } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("");
  const [note, setNote] = useState("");
  const [receiptUrl, setReceiptUrl] = useState("");

  const subtotal = getSubtotal();
  const deliveryFee = 0;
  const total = subtotal + deliveryFee;

  const t = {
    en: {
      title: "Checkout",
      secure: "Secure Checkout",
      deliveryInfo: "Delivery Information",
      fullName: "Full Name *",
      phone: "Phone *",
      address: "Address *",
      district: "District",
      payment: "Payment",
      fpsTitle: "FPS — Fast Payment System",
      fpsQr: "FPS QR Code",
      bankDetails: "Bank Transfer Details",
      fpsNote: "After placing your order, scan the QR code or transfer to our FPS ID. We verify payments manually via online banking.",
      receipt: "Payment Receipt (screenshot URL)",
      note: "Order Note (optional)",
      summary: "Order Summary",
      subtotal: "Subtotal",
      delivery: "Delivery",
      total: "Total",
      free: "Free",
      place: "Place Order",
      placing: "Placing Order...",
      emptyCart: "Your cart is empty.",
      browseProducts: "Browse products",
    },
    zh: {
      title: "結帳",
      secure: "安全結帳",
      deliveryInfo: "送貨資料",
      fullName: "姓名 *",
      phone: "電話 *",
      address: "地址 *",
      district: "地區",
      payment: "付款",
      fpsTitle: "FPS — 轉數快",
      fpsQr: "FPS 二維碼",
      bankDetails: "銀行轉賬詳情",
      fpsNote: "下單後，掃描二維碼或轉賬至我們的 FPS ID。我們通過網上銀行手動核對付款。",
      receipt: "付款收據（截圖鏈接）",
      note: "訂單備註（可選）",
      summary: "訂單摘要",
      subtotal: "小計",
      delivery: "運費",
      total: "總計",
      free: "免費",
      place: "下單",
      placing: "下單中...",
      emptyCart: "購物車是空的。",
      browseProducts: "瀏覽產品",
    },
  };

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <Header />
        <section className="mx-auto max-w-4xl px-4 md:px-8 py-24 text-center">
          <p className="font-serif text-2xl text-muted-foreground mb-6">{t[language].emptyCart}</p>
          <button onClick={() => router.push("/products")} className="btn-pill-outline">
            {t[language].browseProducts}
          </button>
        </section>
      </main>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !address) {
      setError(language === "en" ? "Please fill in all required fields" : "請填寫所有必填欄位");
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
            productId: i.product.id,
            variantId: i.variant.id,
            quantity: i.quantity,
          })),
          subtotal,
          deliveryFee,
          total,
          deliveryMethod: "home-delivery",
          deliveryAddress: { fullName, phone, street: address, district },
          paymentMethod: "fps",
          paymentReceiptUrl: receiptUrl || null,
          customerNote: note || null,
          preferredLanguage: language,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        clearCart();
        router.push(`/orders/${data.order.id}`);
      } else {
        setError(data.error || data.message || "Failed to place order");
      }
    } catch {
      setError(language === "en" ? "Network error. Please try again." : "網絡錯誤，請重試。");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <section className="mx-auto max-w-4xl px-4 md:px-8 py-12 md:py-24">
        <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-4">{t[language].secure}</p>
        <h1 className="font-serif text-3xl md:text-6xl mb-8 md:mb-16">{t[language].title}</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 md:gap-12">
            <div className="lg:col-span-3 space-y-8 md:space-y-10">
              <div>
                <h2 className="font-serif text-xl md:text-2xl mb-4 md:mb-6">{t[language].deliveryInfo}</h2>
                <div className="space-y-4">
                  {[
                    { label: t[language].fullName, value: fullName, set: setFullName, placeholder: "Your full name" },
                    { label: t[language].phone, value: phone, set: setPhone, placeholder: "+852 XXXX XXXX", type: "tel" },
                    { label: t[language].address, value: address, set: setAddress, placeholder: "Street address" },
                    { label: t[language].district, value: district, set: setDistrict, placeholder: "Central, Kowloon" },
                  ].map((f, i) => (
                    <div key={i}>
                      <label className="block text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2">{f.label}</label>
                      <input
                        type={f.type || "text"}
                        value={f.value}
                        onChange={(e) => f.set(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-border rounded-lg text-sm focus:border-accent outline-none transition"
                        placeholder={f.placeholder}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="font-serif text-xl md:text-2xl mb-4 md:mb-6">{t[language].payment}</h2>
                <div className="bg-cream rounded-lg p-4 md:p-6 space-y-4 md:space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-foreground" />
                    <span className="font-serif text-base md:text-lg">{t[language].fpsTitle}</span>
                  </div>
                  <div className="flex justify-center">
                    <div className="w-40 h-40 md:w-48 md:h-48 bg-white border-2 border-dashed border-border rounded-lg flex items-center justify-center">
                      <div className="text-center px-4">
                        <span className="text-2xl md:text-3xl block mb-2">📱</span>
                        <p className="text-[10px] tracking-wider text-muted-foreground">{t[language].fpsQr}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-sm">
                    <p className="text-xs text-muted-foreground">{t[language].fpsNote}</p>
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2">{t[language].receipt}</label>
                    <input
                      type="url"
                      value={receiptUrl}
                      onChange={(e) => setReceiptUrl(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-border rounded-lg text-sm focus:border-accent outline-none transition"
                      placeholder="Upload to Google Drive and paste link"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2">{t[language].note}</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-white border border-border rounded-lg text-sm focus:border-accent outline-none transition resize-none"
                />
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-cream rounded-lg p-6 md:p-8 lg:sticky lg:top-24">
                <h2 className="font-serif text-xl md:text-2xl mb-4 md:mb-6">{t[language].summary}</h2>
                <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
                  {items.map((item) => (
                    <div key={`${item.product.id}-${item.variant.id}`} className="flex justify-between text-xs md:text-sm">
                      <span className="text-foreground/70">
                        {language === "en" ? item.product.name_en : item.product.name_zh}
                        {item.variant.weight ? ` (${item.variant.weight})` : ""} ×{item.quantity}
                      </span>
                      <span className="font-medium">HK${(item.variant.priceHkd * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border pt-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">{t[language].subtotal}</span><span>HK${subtotal.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">{t[language].delivery}</span><span>{deliveryFee === 0 ? t[language].free : `HK$${deliveryFee}`}</span></div>
                  <div className="flex justify-between font-serif text-lg md:text-xl pt-2 border-t border-border mt-2"><span>{t[language].total}</span><span className="text-accent">HK${total.toLocaleString()}</span></div>
                </div>

                {/* Order Note */}
                <div className="mt-6">
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2">{t[language].note}</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 bg-white border border-border rounded-lg text-sm focus:border-accent outline-none transition resize-none"
                    placeholder={language === "en" ? "Special instructions..." : "特別指示..."}
                  />
                </div>

                {error && <p className="text-red-500 text-xs mt-4 bg-red-50 p-3 rounded-lg">{error}</p>}
                <button type="submit" disabled={submitting} className="btn-pill-dark w-full mt-4 md:mt-6 disabled:opacity-50">
                  {submitting ? t[language].placing : t[language].place}
                </button>
              </div>
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}
