"use client";

import { useState, useEffect } from "react";
import { User, Heart, ShoppingBag, Search, Menu, X } from "lucide-react";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

export function Header() {
  const { data: session } = useSession();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const update = () => {
      const cart = JSON.parse(
        localStorage.getItem("cozy-cart") || "[]"
      ) as any[];
      setCartCount(cart.reduce((sum: number, i: any) => sum + i.quantity, 0));
    };
    update();
    window.addEventListener("storage", update);
    return () => window.removeEventListener("storage", update);
  }, []);

  // Re-check cart on client-side navigation
  useEffect(() => {
    const interval = setInterval(() => {
      const cart = JSON.parse(
        localStorage.getItem("cozy-cart") || "[]"
      ) as any[];
      setCartCount(cart.reduce((sum: number, i: any) => sum + i.quantity, 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="w-full border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-6">
        {/* Left Nav */}
        <nav className="flex items-center gap-10 text-xs tracking-[0.22em] uppercase text-foreground/80">
          <Link href="/products" className="hover:text-accent transition">
            Cosmetics
          </Link>
          <Link href="/about" className="hover:text-accent transition">
            About
          </Link>
        </nav>

        {/* Center Logo */}
        <Link href="/" className="flex flex-col items-center leading-none">
          <span className="font-serif text-3xl tracking-tight">
            cozy nest
          </span>
          <span className="mt-1 text-[9px] tracking-[0.3em] text-muted-foreground">
            COZY NEST
          </span>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-6 text-foreground/70">
          {session ? (
            <button
              onClick={() => signOut()}
              className="text-[10px] tracking-wider uppercase hover:text-accent transition"
            >
              {session.user?.name?.split(" ")[0] || "Account"}
            </button>
          ) : (
            <button
              onClick={() => signIn("google")}
              aria-label="Sign in"
              className="hover:text-accent transition"
            >
              <User size={18} strokeWidth={1.4} />
            </button>
          )}

          <Link
            href="/cart"
            aria-label="Cart"
            className="relative hover:text-accent transition"
          >
            <ShoppingBag size={18} strokeWidth={1.4} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 w-4 h-4 bg-accent text-background text-[9px] rounded-full flex items-center justify-center font-medium">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
