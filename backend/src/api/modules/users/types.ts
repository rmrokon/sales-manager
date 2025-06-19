import z from 'zod';
import { UserBodyValidationSchema } from './validations';
import { Attributes, CreationAttributes } from '@sequelize/core';
import User from './model';

export enum UserType {
  Organization = 'ORGANIZATION',
  Individual = 'INDIVIDUAL',
  Member = 'MEMBER',
  Admin = 'ADMIN',
  Parent = 'PARENT',
}

export interface IUser extends Attributes<User>{};
export type ICreateUser = CreationAttributes<User>;

export type IUserRequestBody = z.infer<typeof UserBodyValidationSchema>;
