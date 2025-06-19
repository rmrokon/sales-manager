import { z } from 'zod';
import { ZoneCreationValidationSchema, ZoneUpdateValidationSchema } from './validations';
import { Attributes, CreationAttributes } from '@sequelize/core';
import Zone from './model';

export interface IZone extends Attributes<Zone>{};
export type ICreateZone = CreationAttributes<Zone>;

export type IZoneCreationBody = z.infer<typeof ZoneCreationValidationSchema>;
export type IZoneUpdateBody = z.infer<typeof ZoneUpdateValidationSchema>;