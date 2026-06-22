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
  const [menuOpen, setMenuOpen] = useState(false);
  const cartCount = getTotalItems();
  const { language, toggleLanguage } = useLanguage();

  useEffect(() => { setMounted(true); }, []);

  const nav = {
    en: { cosmetics: "Cosmetics", about: "About" },
    zh: { cosmetics: "產品", about: "關於" },
  };

  return (
    <header className="w-full border-b border-border/60 bg-background/80 backdrop-blur relative" style={{ zIndex: 9999 }}>
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
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-1 md:gap-2 text-[10px] tracking-wider uppercase hover:text-accent transition"
                style={{ position: 'relative', zIndex: 10000 }}
              >
                <User size={16} strokeWidth={1.4} />
                <span className="hidden sm:inline">{session.user?.name?.split(" ")[0] || "Account"}</span>
              </button>

              {menuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    marginTop: '8px',
                    width: '224px',
                    background: '#FAF7F2',
                    border: '1px solid #E5E0D8',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    zIndex: 99999,
                    padding: '8px 0',
                  }}
                >
                  <div style={{ padding: '8px 16px', borderBottom: '1px solid #E5E0D8' }}>
                    <p style={{ fontSize: '14px', color: '#1a1a1a' }}>
                      {session.user?.email}
                    </p>
                  </div>
                  {isAdmin && (
                    <a
                      href="/admin"
                      onClick={() => setMenuOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '12px', color: '#1a1a1a', textDecoration: 'none' }}
                    >
                      <LayoutDashboard size={14} />
                      Admin
                    </a>
                  )}
                  <form action="/api/auth/signout" method="POST">
                    <input type="hidden" name="callbackUrl" value="/" />
                    <button
                      type="submit"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '8px 16px',
                        fontSize: '12px',
                        color: '#666',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <LogOut size={14} />
                      {language === "en" ? "Sign Out" : "登出"}
                    </button>
                  </form>
                </div>
              )}
            </div>
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
