import { z } from 'zod';

export const ProductBodyValidationSchema = z.object({
  name: z.string({ required_error: 'Name is required!' }).min(1, 'Name is required!'),
  purchasePrice: z.number({ required_error: 'Purchase price is required!' }).min(0, 'Purchase price must be positive!'),
  sellingPrice: z.number({ required_error: 'Selling price is required!' }).min(0, 'Selling price must be positive!'),
  price: z.number().min(0, 'Price must be positive!').optional(), // Keep for backward compatibility
  description: z.string().optional(),
  company_id: z.string().optional(),
  providerIds: z.array(z.string()).optional(),
});
