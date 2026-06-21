"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import CartSidebar from "./CartSidebar";

interface CartSidebarContextType {
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

const CartSidebarContext = createContext<CartSidebarContextType | undefined>(undefined);

export function useCartSidebar() {
  const context = useContext(CartSidebarContext);
  if (!context) throw new Error("useCartSidebar must be used within GlobalCartProvider");
  return context;
}

export function GlobalCartProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen(!isOpen);

  return (
    <CartSidebarContext.Provider value={{ isOpen, openCart, closeCart, toggleCart }}>
      {children}
      <CartSidebar isOpen={isOpen} onClose={closeCart} />
    </CartSidebarContext.Provider>
  );
}
