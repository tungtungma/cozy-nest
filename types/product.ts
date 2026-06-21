/**
 * Product and Product Variant Type Definitions
 * 
 * These types are used throughout the application for type safety
 * when working with products and their variants.
 */

export interface ProductVariant {
  id: string;
  productId: string;
  weight: string;
  weightGrams: number;
  priceHkd: number;
  platinumPriceHkd?: number | null;
  shippingWeightKg: number;
  packageLengthCm: number;
  packageWidthCm: number;
  packageHeightCm: number;
  stockQuantity: number;
  isActive: boolean;
  isDefault: boolean;
  sortOrder: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface ProductWithVariants {
  id: string;
  nameEn: string;
  nameZh: string;
  grade: string;
  imageUrl: string;
  descriptionEn: string;
  descriptionZh: string;
  origin: string;
  originZh: string;
  preparationTipsEn: string;
  preparationTipsZh: string;
  category: string;
  categoryZh: string;
  inStock: boolean;
  isActive: boolean;
  featured: boolean;
  variants: ProductVariant[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// Helper type for form data when creating/editing variants
export interface ProductVariantFormData {
  id?: string;
  weight: string;
  weightGrams: number;
  priceHkd: number;
  platinumPriceHkd?: number | null;
  stockQuantity: number;
  isActive?: boolean;
  isDefault: boolean;
  sortOrder: number;
  shippingWeightKg?: number;
  packageLengthCm?: number;
  packageWidthCm?: number;
  packageHeightCm?: number;
}

// Helper type for product form data
export interface ProductFormData {
  id: string;
  nameEn: string;
  nameZh: string;
  grade: "Premium" | "Superior" | "Deluxe";
  imageUrl: string;
  descriptionEn: string;
  descriptionZh: string;
  origin: string;
  originZh: string;
  preparationTipsEn: string;
  preparationTipsZh: string;
  category: string;
  categoryZh: string;
  featured: boolean;
  isActive: boolean;
  shippingWeightKg: number;
  packageLengthCm: number;
  packageWidthCm: number;
  packageHeightCm: number;
  variants: ProductVariantFormData[];
}

// Utility function to get the default variant
export function getDefaultVariant(variants: ProductVariant[]): ProductVariant | undefined {
  return variants.find(v => v.isDefault) || variants[0];
}

// Utility function to calculate effective price based on user tier
export function getVariantPrice(
  variant: ProductVariant,
  userTier: 'member' | 'silver' | 'gold' | 'platinum'
): number {
  if (userTier === 'platinum' && variant.platinumPriceHkd) {
    return variant.platinumPriceHkd;
  }
  return variant.priceHkd;
}

// Utility function to parse weight string to grams
export function parseWeightToGrams(weight: string): number {
  const cleanWeight = weight.toLowerCase().trim();
  
  if (cleanWeight.includes('kg')) {
    const kgValue = parseFloat(cleanWeight.replace(/[^0-9.]/g, ''));
    return Math.round(kgValue * 1000);
  }
  
  if (cleanWeight.includes('g')) {
    return parseInt(cleanWeight.replace(/[^0-9]/g, ''));
  }
  
  // Fallback: assume grams
  return parseInt(cleanWeight) || 500;
}
