import { z } from 'zod';

// Hong Kong phone number validation
const hkPhoneSchema = z.string()
  .regex(/^[2-9]\d{7}$/, 'Invalid Hong Kong phone number')
  .length(8, 'Phone number must be exactly 8 digits');

// Name validation
const nameSchema = z.string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name too long')
  .regex(/^[a-zA-Z\u4e00-\u9fa5\s]+$/, 'Name can only contain letters and spaces');

// Create address schema
export const createAddressSchema = z.object({
  label: z.string()
    .min(1, 'Label required')
    .max(50, 'Label too long')
    .regex(/^[a-zA-Z\u4e00-\u9fa5\s]+$/, 'Label can only contain letters and spaces'),
  
  fullName: nameSchema,
  
  phone: hkPhoneSchema,
  
  addressLine1: z.string()
    .min(3, 'Address line 1 required')
    .max(200, 'Address too long'),
  
  addressLine2: z.string()
    .max(200, 'Address too long')
    .optional()
    .or(z.literal('')),
  
  district: z.string()
    .min(2, 'District required')
    .max(50, 'District too long'),
  
  isDefault: z.boolean().default(false),
});

// Update address schema (includes ID, all fields optional for partial updates)
export const updateAddressSchema = createAddressSchema.partial().extend({
  id: z.string().min(1, 'Address ID required'),
});

// Delete address schema
export const deleteAddressSchema = z.object({
  id: z.string().min(1, 'Address ID required'),
});
