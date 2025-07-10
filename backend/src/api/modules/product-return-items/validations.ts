import { z } from 'zod';

export const ProductReturnItemCreationValidationSchema = z.object({
  returnId: z.string({
    required_error: 'Return ID is required',
  }),
  productId: z.string({
    required_error: 'Product ID is required',
  }),
  returnedQuantity: z.number({
    required_error: 'Returned quantity is required',
  }).min(1, 'Returned quantity must be at least 1'),
  unitPrice: z.number({
    required_error: 'Unit price is required',
  }).min(0, 'Unit price cannot be negative'),
  returnAmount: z.number({
    required_error: 'Return amount is required',
  }).min(0, 'Return amount cannot be negative'),
});

export const ProductReturnItemUpdateValidationSchema = ProductReturnItemCreationValidationSchema.partial();
