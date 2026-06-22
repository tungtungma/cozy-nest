"use client";

import { User, ShoppingBag, LayoutDashboard, LogOut } from "lucide-react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useCart } from "@/store/useCart";
import { useCartSidebar } from "@/components/GlobalCartProvider";
import { useMemberStatus } from "@/hooks/useMemberStatus";
import { useLanguage } from "@/contexts/LanguageContext";

export function Header() {
  const { data: session } = useSession();
  const { getTotalItems } = useCart();
  const { openCart } = useCartSidebar();
  const { isAdmin } = useMemberStatus();
  const [mounted, setMounted] = useState(false);
  const cartCount = getTotalItems();
  const { language, toggleLanguage } = useLanguage();

  useEffect(() => { setMounted(true); }, []);

  const handleSignOut = (e: React.MouseEvent) => {
    e.preventDefault();
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/api/auth/signout';
    form.innerHTML = '<input type="hidden" name="callbackUrl" value="/" />';
    document.body.appendChild(form);
    form.submit();
  };

  const nav = {
    en: { cosmetics: "Cosmetics", about: "About" },
    zh: { cosmetics: "產品", about: "關於" },
  };

  return (
    <header className="w-full border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 md:px-8 py-4 md:py-6">
        <nav className="hidden sm:flex items-center gap-6 md:gap-10 text-[10px] md:text-xs tracking-[0.22em] uppercase text-foreground/80">
          <Link href="/products" className="hover:text-accent transition">{nav[language].cosmetics}</Link>
          <Link href="/about" className="hover:text-accent transition">{nav[language].about}</Link>
        </nav>

        <Link href="/" className="flex flex-col items-center leading-none">
          <span className="font-serif text-2xl md:text-3xl tracking-tight">cozy nest</span>
          <span className="mt-1 text-[8px] md:text-[9px] tracking-[0.3em] text-muted-foreground">COZY NEST</span>
        </Link>

        <div className="flex items-center gap-3 md:gap-6 text-foreground/70">
          <button
            onClick={toggleLanguage}
            className="text-[9px] md:text-[10px] tracking-wider uppercase text-muted-foreground hover:text-foreground transition px-2 py-1"
          >
            {language === "en" ? "繁中" : "EN"}
          </button>

          {mounted && session ? (
            <details className="relative group">
              <summary className="flex items-center gap-1 md:gap-2 text-[10px] tracking-wider uppercase hover:text-accent transition cursor-pointer list-none marker:content-none">
                <User size={16} strokeWidth={1.4} />
                <span className="hidden sm:inline">{session.user?.name?.split(" ")[0] || "Account"}</span>
              </summary>

              <div className="absolute right-0 mt-2 w-56 bg-background border border-border rounded-lg shadow-lg py-2 z-50">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-medium text-foreground truncate">
                    {session.user?.email}
                  </p>
                </div>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 px-4 py-2 text-xs text-foreground hover:bg-cream transition block"
                  >
                    <LayoutDashboard size={14} />
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 w-full px-4 py-2 text-xs text-muted-foreground hover:text-red-600 hover:bg-cream transition text-left"
                >
                  <LogOut size={14} />
                  {language === "en" ? "Sign Out" : "登出"}
                </button>
              </div>
            </details>
          ) : (
            <button onClick={() => signIn("google")} aria-label="Sign in" className="hover:text-accent transition">
              <User size={18} strokeWidth={1.4} />
            </button>
          )}

          <button onClick={openCart} aria-label="Cart" className="relative hover:text-accent transition">
            <ShoppingBag size={18} strokeWidth={1.4} />
            {mounted && cartCount > 0 && (
              <span className="absolute -top-2 -right-2 w-4 h-4 bg-accent text-background text-[9px] rounded-full flex items-center justify-center font-medium">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
