"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AdminNav() {
  const { language, toggleLanguage } = useLanguage();

  const nav = {
    en: {
      title: "Cozy Nest — Admin",
      overview: "Dashboard",
      products: "Products",
      orders: "Orders",
      members: "Members",
      restock: "Stock",
      backToSite: "← Store",
      langToggle: "繁中",
    },
    zh: {
      title: "Cozy Nest — 管理",
      overview: "儀表板",
      products: "產品",
      orders: "訂單",
      members: "會員",
      restock: "庫存",
      backToSite: "← 商店",
      langToggle: "EN",
    },
  };

  const t = nav[language];
  const links = [
    { href: "/admin", label: t.overview },
    { href: "/admin/products", label: t.products },
    { href: "/admin/orders", label: t.orders },
    { href: "/admin/members", label: t.members },
    { href: "/admin/restock", label: t.restock },
  ];

  return (
    <nav className="border-b border-border bg-background sticky top-0" style={{ zIndex: 90 }}>
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-3 md:py-4 flex items-center justify-between">
        {/* Left: title */}
        <Link href="/admin" className="font-serif text-lg md:text-xl text-foreground tracking-tight">
          {t.title}
        </Link>

        {/* Center: nav links */}
        <div className="flex gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-3 py-1.5 text-xs tracking-wider uppercase text-muted-foreground hover:text-foreground hover:bg-cream rounded transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleLanguage}
            className="text-[10px] tracking-wider uppercase text-muted-foreground hover:text-foreground transition"
          >
            {t.langToggle}
          </button>
          <Link
            href="/"
            className="text-xs tracking-wider text-muted-foreground hover:text-foreground transition"
          >
            {t.backToSite}
          </Link>
        </div>
      </div>
    </nav>
  );
}
