import { z } from 'zod';

export const InventoryCreationValidationSchema = z.object({
  productId: z.string({required_error: 'Product ID is required'}),
  providerId: z.string({required_error: 'Provider ID is required'}),
  companyId: z.string({required_error: 'Company ID is required'}),
  quantity: z.number({required_error: 'Quantity is required'})
    .int('Quantity must be an integer')
    .min(0, 'Quantity cannot be negative'),
  unitPrice: z.number({required_error: 'Unit price is required'})
    .min(0, 'Unit price cannot be negative')
});

export const InventoryUpdateValidationSchema = z.object({
  productId: z.string().optional(),
  providerId: z.string().optional(),
  quantity: z.number()
    .int('Quantity must be an integer')
    .min(0, 'Quantity cannot be negative')
    .optional(),
  unitPrice: z.number()
    .min(0, 'Unit price cannot be negative')
    .optional()
});