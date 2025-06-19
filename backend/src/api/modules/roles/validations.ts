import { z } from 'zod';

export const RoleBodyValidationSchema = z.object({
  name: z.string({ required_error: 'Name is required!' }).min(1, 'Name is required!'),
  user_id: z.string().optional()
});
