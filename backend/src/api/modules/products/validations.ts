import { z } from 'zod';

export const ProductBodyValidationSchema = z.object({
  name: z.string({ required_error: 'Name is required!' }).min(1, 'Name is required!'),
  price: z.number({ required_error: 'Price is required!' }).min(0, 'Price must be positive!'),
  description: z.string().optional(),
});
