"use client";

import { useCart } from "@/store/useCart";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import Link from "next/link";
import { X, Plus, Minus, ShoppingBag } from "lucide-react";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { items, getSubtotal, getDiscount, getTotalWithDiscount, getTotalItems, removeItem, updateQuantity, setUserTier, userTier } = useCart();
  const { language } = useLanguage();
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.tier) {
      setUserTier(session.user.tier as any);
    } else {
      setUserTier('member');
    }
  }, [session, setUserTier]);

  return (
    <>
      <div
        className={`fixed inset-0 bg-foreground/30 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      <div
        className={`fixed right-0 top-0 h-full w-full sm:w-[450px] bg-background shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-6 border-b border-border">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-accent" />
              <h2 className="font-serif text-2xl text-foreground">
                {language === "en" ? "Your Cart" : "購物車"}
              </h2>
              <span className="text-sm font-sans text-muted-foreground">
                ({getTotalItems()})
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-cream rounded-lg transition-colors"
              aria-label={language === "en" ? "Close cart" : "關閉購物車"}
            >
              <X className="w-5 h-5 text-foreground" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-24 h-24 bg-cream rounded-full flex items-center justify-center mb-4">
                  <ShoppingBag className="w-10 h-10 text-muted-foreground" />
                </div>
                <p className="font-serif text-xl text-muted-foreground mb-2">
                  {language === "en" ? "Your cart is empty" : "購物車是空的"}
                </p>
                <Link
                  href="/products"
                  onClick={onClose}
                  className="text-xs tracking-wider uppercase text-accent hover:underline mt-4"
                >
                  {language === "en" ? "Browse Products" : "瀏覽產品"}
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => {
                  const displayName = language === "en" ? item.product.name_en : item.product.name_zh;
                  return (
                    <div
                      key={`${item.product.id}-${item.variant.id}`}
                      className="flex gap-4 bg-cream/50 rounded-xl p-4"
                    >
                      {/* Product Image */}
                      <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-white">
                        {item.product.image_url ? (
                          <img
                            src={item.product.image_url}
                            alt={displayName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                            No img
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif text-sm text-foreground mb-1 truncate">
                          {displayName}
                        </h3>
                        <p className="text-[10px] tracking-wider text-muted-foreground mb-2">
                          {item.variant?.weight || item.product?.weight || ''}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.variant.id, item.quantity - 1)}
                              className="w-6 h-6 rounded-full border border-border text-muted-foreground hover:bg-foreground hover:text-background transition-all flex items-center justify-center"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm font-medium text-foreground min-w-[1.5rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.variant.id, item.quantity + 1)}
                              className="w-6 h-6 rounded-full border border-border text-muted-foreground hover:bg-foreground hover:text-background transition-all flex items-center justify-center"
                              disabled={item.variant.stockQuantity !== undefined && item.quantity >= item.variant.stockQuantity}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="font-serif text-accent">
                              HK${((userTier === 'platinum' && item.variant.platinumPriceHkd)
                                ? item.variant.platinumPriceHkd
                                : item.variant.priceHkd) * item.quantity}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeItem(item.product.id, item.variant.id)}
                          className="text-[10px] tracking-wider text-muted-foreground hover:text-red-500 mt-1"
                        >
                          {language === "en" ? "Remove" : "移除"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-border px-6 py-6 bg-cream/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  {language === "en" ? "Subtotal" : "小計"}
                </span>
                <span className="font-serif text-xl text-foreground">
                  HK${getSubtotal()}
                </span>
              </div>
              {userTier === 'gold' && getDiscount() > 0 && (
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-accent">
                    {language === "en" ? "Gold Discount (5%)" : "金卡折扣 (5%)"}
                  </span>
                  <span className="font-serif text-accent">
                    -HK${getDiscount()}
                  </span>
                </div>
              )}
              {userTier === 'gold' && getDiscount() > 0 && (
                <div className="flex items-center justify-between mb-4 pt-2 border-t border-border">
                  <span className="text-sm font-medium text-foreground">
                    {language === "en" ? "Total" : "總計"}
                  </span>
                  <span className="font-serif text-xl text-foreground">
                    HK${getTotalWithDiscount()}
                  </span>
                </div>
              )}
              <Link href="/checkout" onClick={onClose} className="block w-full mt-4">
                <button className="btn-pill-dark w-full">
                  {language === "en" ? "Proceed to Checkout" : "前往結帳"}
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
