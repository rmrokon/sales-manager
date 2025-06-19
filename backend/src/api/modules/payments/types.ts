import { z } from 'zod';
import { PaymentCreationValidationSchema, PaymentUpdateValidationSchema } from './validations';
import { Attributes, CreationAttributes } from '@sequelize/core';
import Payment from './model';

export interface IPayment extends Attributes<Payment>{};
export type ICreatePayment = CreationAttributes<Payment>;

export type IPaymentCreationBody = z.infer<typeof PaymentCreationValidationSchema>;
export type IPaymentUpdateBody = z.infer<typeof PaymentUpdateValidationSchema>;