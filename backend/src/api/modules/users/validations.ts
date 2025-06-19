import { CreatedAt } from 'sequelize-typescript';
import z from 'zod';

export const UserBodyValidationSchema = z.object({
  id: z.string().optional(),
  email: z.string({required_error: 'Email is required!'}),
  type: z.string().optional(),
});
