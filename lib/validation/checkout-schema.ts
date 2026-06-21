import { z } from 'zod';

// Hong Kong phone: 8 digits
const phoneSchema = z.string().regex(/^[2-9]\d{7}$/, 'Invalid Hong Kong phone number');

// Order item
const orderItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1).optional(),
  quantity: z.number().int().min(1).max(999),
});

// Delivery address
const addressSchema = z.object({
  fullName: z.string().min(1, 'Name required').max(100),
  phone: phoneSchema,
  street: z.string().min(1, 'Address required').max(300),
  district: z.string().max(100).optional(),
});

// Create order
export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1).max(50),
  subtotal: z.number().positive(),
  deliveryFee: z.number().nonnegative(),
  total: z.number().positive(),
  deliveryMethod: z.enum(['home-delivery']),
  deliveryAddress: addressSchema,
  paymentMethod: z.enum(['fps']),
  paymentReceiptUrl: z.string().optional().or(z.literal('')),
  customerNote: z.string().max(500).optional().or(z.literal('')),
  preferredLanguage: z.enum(['en', 'zh']).optional(),
});
