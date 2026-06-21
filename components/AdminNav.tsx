"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AdminNav() {
  const { language, toggleLanguage } = useLanguage();

  const nav = {
    en: {
      title: "🛠️ Admin Dashboard",
      overview: "Overview",
      products: "📦 Products",
      orders: "📋 Orders",
      members: "👥 Members",
      restock: "📊 Restock",
      backToSite: "← Back to Site",
      langToggle: "繁中"
    },
    zh: {
      title: "🛠️ 管理後台",
      overview: "總覽",
      products: "📦 產品管理",
      orders: "📋 訂單管理",
      members: "👥 會員管理",
      restock: "📊 補貨儀表板",
      backToSite: "← 返回網站",
      langToggle: "EN"
    }
  };

  const t = nav[language];

  return (
    <nav className="bg-teal text-white shadow-lg">
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="text-2xl font-playfair font-bold">
              {t.title}
            </Link>
            <div className="flex gap-4 font-lora">
              <Link
                href="/admin"
                className="px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                {t.overview}
              </Link>
              <Link
                href="/admin/products"
                className="px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                {t.products}
              </Link>
              <Link
                href="/admin/orders"
                className="px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                {t.orders}
              </Link>
              <Link
                href="/admin/members"
                className="px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                {t.members}
              </Link>
              <Link
                href="/admin/restock"
                className="px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                {t.restock}
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleLanguage}
              className="px-5 py-2.5 text-sm font-lora font-medium text-white bg-amber rounded-xl hover:bg-amber-dark transition-all duration-200 shadow-md"
              aria-label="Toggle language"
            >
              {t.langToggle}
            </button>
            <Link
              href="/"
              className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors font-lora"
            >
              {t.backToSite}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
