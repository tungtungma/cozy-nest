"use client";

import { User, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { useCart } from "@/store/useCart";
import { useCartSidebar } from "@/components/GlobalCartProvider";

export function Header() {
  const { data: session } = useSession();
  const { getTotalItems } = useCart();
  const { openCart } = useCartSidebar();
  const cartCount = getTotalItems();

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
          <span className="font-serif text-3xl tracking-tight">cozy nest</span>
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

          <button
            onClick={openCart}
            aria-label="Cart"
            className="relative hover:text-accent transition"
          >
            <ShoppingBag size={18} strokeWidth={1.4} />
            {cartCount > 0 && (
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
