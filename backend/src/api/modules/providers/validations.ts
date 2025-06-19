import { z } from 'zod';

export const ProviderBodyValidationSchema = z.object({
  name: z.string({ required_error: 'Name is required!' }).min(1, 'Name is required!'),
  company_id: z.string().optional(),
});
