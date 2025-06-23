import { z } from 'zod';

export const InvoiceItemCreationValidationSchema = z.object({
  invoiceId: z.string({required_error: 'Invoice ID is required'}),
  productId: z.string({required_error: 'Product ID is required'}),
  quantity: z.number({required_error: 'Quantity is required'})
    .int('Quantity must be an integer')
    .min(1, 'Quantity must be at least 1'),
  unitPrice: z.number({required_error: 'Unit price is required'})
    .min(0, 'Unit price cannot be negative'),
  discountPercent: z.number()
    .min(0, 'Discount percent cannot be negative')
    .max(100, 'Discount percent cannot exceed 100%')
    .default(0)
});

export const InvoiceItemUpdateValidationSchema = z.object({
  quantity: z.number()
    .int('Quantity must be an integer')
    .min(1, 'Quantity must be at least 1')
    .optional(),
  unitPrice: z.number()
    .min(0, 'Unit price cannot be negative')
    .optional(),
  discountPercent: z.number()
    .min(0, 'Discount percent cannot be negative')
    .max(100, 'Discount percent cannot exceed 100%')
    .optional()
});

export const BulkInvoiceItemCreationValidationSchema = z.array(z.object({
  productId: z.string({required_error: 'Product ID is required'}),
  quantity: z.number({required_error: 'Quantity is required'})
    .int('Quantity must be an integer')
    .min(1, 'Quantity must be at least 1'),
  unitPrice: z.number({required_error: 'Unit price is required'})
    .min(0, 'Unit price cannot be negative'),
  discountPercent: z.number()
    .min(0, 'Discount percent cannot be negative')
    .max(100, 'Discount percent cannot exceed 100%')
    .default(0)
}));