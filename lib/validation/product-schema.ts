import { z } from "zod";

/**
 * Product Validation Schema
 * Validates all product fields for create/update operations
 */

// Product Variant Schema - Must be declared first to avoid "used before declaration" error
export const productVariantSchema = z.object({
  id: z.string().optional(), // Empty for new variants, cuid for existing
  weight: z.string().min(1, "Weight is required (e.g., '250g', '500g')"),
  weightGrams: z.number().int().positive("Weight in grams must be positive"),
  priceHkd: z.number().int().positive("Price must be positive"),
  platinumPriceHkd: z.number().int().positive().optional().nullable(),
  stockQuantity: z.number().int().nonnegative("Stock quantity cannot be negative"),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
  sortOrder: z.number().int().nonnegative().default(0),
  shippingWeightKg: z.number().positive().max(50),
  packageLengthCm: z.number().int().positive().max(200),
  packageWidthCm: z.number().int().positive().max(200),
  packageHeightCm: z.number().int().positive().max(200),
});

// Product Schema - Main product validation
export const productSchema = z.object({
  id: z.string()
    .min(1, "Product ID is required")
    .regex(/^[a-z0-9-]+$/, "Product ID must be lowercase alphanumeric with hyphens"),
  
  nameEn: z.string().min(1, "English name is required"),
  nameZh: z.string().min(1, "Chinese name is required"),
  
  // Legacy fields - optional when variants are used
  priceHkd: z.number()
    .int("Price must be an integer")
    .positive("Price must be greater than 0")
    .optional(),
  
  platinumPriceHkd: z.number()
    .int("Platinum price must be an integer")
    .positive("Platinum price must be greater than 0")
    .optional()
    .nullable(),
  
  grade: z.enum(["Premium", "Superior", "Deluxe"]),
  
  // Legacy field - optional when variants are used
  weight: z.string().min(1, "Display weight is required (e.g., '500g', '1kg')").optional(),
  
  // Shipping-specific fields
  shippingWeightKg: z.number()
    .positive("Shipping weight must be greater than 0")
    .max(50, "Shipping weight cannot exceed 50kg"),
  
  packageLengthCm: z.number()
    .int("Package length must be an integer")
    .positive("Package length must be greater than 0")
    .max(200, "Package length cannot exceed 200cm"),
  
  packageWidthCm: z.number()
    .int("Package width must be an integer")
    .positive("Package width must be greater than 0")
    .max(200, "Package width cannot exceed 200cm"),
  
  packageHeightCm: z.number()
    .int("Package height must be an integer")
    .positive("Package height must be greater than 0")
    .max(200, "Package height cannot exceed 200cm"),
  
  imageUrl: z.string().url("Image URL must be valid"),
  
  descriptionEn: z.string().min(10, "English description must be at least 10 characters"),
  descriptionZh: z.string().min(10, "Chinese description must be at least 10 characters"),
  
  origin: z.string().min(1, "Origin is required"),
  originZh: z.string().min(1, "Chinese origin is required"),
  
  preparationTipsEn: z.string().min(10, "English preparation tips must be at least 10 characters"),
  preparationTipsZh: z.string().min(10, "Chinese preparation tips must be at least 10 characters"),
  
  category: z.string().min(1, "Category is required"),
  categoryZh: z.string().min(1, "Chinese category is required"),
  
  stockQuantity: z.number()
    .int("Stock quantity must be an integer")
    .nonnegative("Stock quantity cannot be negative")
    .default(0),
  
  featured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  
  // Product variants array (optional for backward compatibility)
  variants: z.array(productVariantSchema).optional(),
});

// Partial schema for updates (all fields optional except id)
export const productUpdateSchema = z.object({
  id: z.string(),
  nameEn: z.string().min(1).optional(),
  nameZh: z.string().min(1).optional(),
  priceHkd: z.number().int().positive().optional(),
  platinumPriceHkd: z.number().int().positive().optional().nullable(),
  grade: z.enum(["Premium", "Superior", "Deluxe"]).optional(),
  weight: z.string().min(1).optional(),
  shippingWeightKg: z.number().positive().max(50).optional(),
  packageLengthCm: z.number().int().positive().max(200).optional(),
  packageWidthCm: z.number().int().positive().max(200).optional(),
  packageHeightCm: z.number().int().positive().max(200).optional(),
  imageUrl: z.string().url().optional(),
  descriptionEn: z.string().min(10).optional(),
  descriptionZh: z.string().min(10).optional(),
  origin: z.string().min(1).optional(),
  originZh: z.string().min(1).optional(),
  preparationTipsEn: z.string().min(10).optional(),
  preparationTipsZh: z.string().min(10).optional(),
  category: z.string().min(1).optional(),
  categoryZh: z.string().min(1).optional(),
  stockQuantity: z.number().int().nonnegative().optional(),
  featured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  variants: z.array(productVariantSchema).optional(), // Product variants array
});

export type ProductInput = z.infer<typeof productSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
export type ProductVariantInput = z.infer<typeof productVariantSchema>;
