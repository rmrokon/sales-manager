import { z } from 'zod';

export const DiscountCreationValidationSchema = z.object({
  productId: z.string({required_error: 'Product ID is required'}),
  companyId: z.string({required_error: 'Company ID is required'}),
  percent: z.number({required_error: 'Discount percentage is required'})
    .min(0, 'Percentage must be between 0 and 100')
    .max(100, 'Percentage must be between 0 and 100'),
  validFrom: z.string().or(z.date()).transform(val => new Date(val)),
  validTo: z.string().or(z.date()).transform(val => new Date(val)).optional()
});

export const DiscountUpdateValidationSchema = z.object({
  productId: z.string().optional(),
  companyId: z.string().optional(),
  percent: z.number()
    .min(0, 'Percentage must be between 0 and 100')
    .max(100, 'Percentage must be between 0 and 100')
    .optional(),
  validFrom: z.string().or(z.date()).transform(val => new Date(val)).optional(),
  validTo: z.string().or(z.date()).transform(val => new Date(val)).optional()
});