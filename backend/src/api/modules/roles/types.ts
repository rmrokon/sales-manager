import { z } from 'zod';
import { RoleBodyValidationSchema } from './validations';
import { Attributes, CreationAttributes } from '@sequelize/core';
import Role from './model';

export interface IRole extends Attributes<Role>{};
export type ICreateRole = CreationAttributes<Role>;

export type IRoleRequestBody = z.infer<typeof RoleBodyValidationSchema>;
