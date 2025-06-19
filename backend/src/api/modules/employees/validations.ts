import { z } from 'zod';

export const EmployeeCreationValidationSchema = z.object({
  firstName: z.string({required_error: 'Employee first name is required'}),
  lastName: z.string({required_error: 'Employee last name is required'}),
  image: z.string().optional(),
  channel_id: z.string().optional(),
  user_id: z.string().optional()
});


export const EmployeeUpdateValidationSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  image: z.string().optional(),
  user_id: z.string().optional()
});

