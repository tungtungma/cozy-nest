import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/data/products';
import type { VIPTier } from '@/types/vip-tier';
import type { ProductVariant } from '@/types/product';

export interface CartItem {
  product: Product;
  variant: ProductVariant;  // NEW: Track selected variant
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  userTier: VIPTier | null;
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => void;
  removeItem: (productId: string, variantId: string) => void;
  updateQuantity: (productId: string, variantId: string, quantity: number) => void;
  clearCart: () => void;
  setUserTier: (tier: VIPTier | null) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getSubtotal: () => number;
  getDiscount: () => number;
  getTotalWithDiscount: () => number;
  getItemQuantity: (productId: string, variantId: string) => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      userTier: null,

      addItem: (product, variant, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product.id === product.id && item.variant.id === variant.id
          );

          const stockLimit = variant.stockQuantity;
          const currentCartQuantity = existingItem ? existingItem.quantity : 0;
          const maxAddable = Math.max(0, stockLimit - currentCartQuantity);
          const quantityToAdd = Math.min(quantity, maxAddable);

          // Don't add if no stock available
          if (quantityToAdd <= 0) {
            return state;
          }

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id && item.variant.id === variant.id
                  ? { ...item, quantity: item.quantity + quantityToAdd }
                  : item
              ),
            };
          }

          return {
            items: [...state.items, { product, variant, quantity: quantityToAdd }],
          };
        });
      },

      removeItem: (productId, variantId) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.product.id === productId && item.variant.id === variantId)
          ),
        }));
      },

      updateQuantity: (productId, variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId && item.variant.id === variantId
              ? { ...item, quantity }
              : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      setUserTier: (tier) => {
        set({ userTier: tier });
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      // VIP TIER: Calculate subtotal with platinum pricing if applicable
      getSubtotal: () => {
        const tier = get().userTier;
        
        return get().items.reduce((total, item) => {
          // Use variant pricing instead of product pricing
          const price = (tier === 'platinum' && item.variant.platinumPriceHkd)
            ? item.variant.platinumPriceHkd
            : item.variant.priceHkd;
          return total + price * item.quantity;
        }, 0);
      },

      // VIP TIER: Calculate discount (Gold tier gets 5%)
      getDiscount: () => {
        const tier = get().userTier;
        
        // Only Gold tier gets cart discount
        if (tier === 'gold') {
          const subtotal = get().getSubtotal();
          return Math.round(subtotal * 0.05); // 5% discount
        }
        
        return 0;
      },

      // VIP TIER: Calculate total with discount applied
      getTotalWithDiscount: () => {
        return get().getSubtotal() - get().getDiscount();
      },

      // Legacy method - kept for backward compatibility
      getTotalPrice: () => {
        return get().getSubtotal();
      },

      getItemQuantity: (productId, variantId) => {
        const item = get().items.find(
          (item) => item.product.id === productId && item.variant.id === variantId
        );
        return item ? item.quantity : 0;
      },
    }),
    {
      name: 'heritage-ocean-cart',
      partialize: (state) => ({
        items: state.items,
        // Don't persist userTier - fetch fresh on load
      }),
    }
  )
);
