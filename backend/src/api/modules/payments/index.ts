import { Router } from 'express';
import { asyncCatchHandler, isAuthenticated, validateRequestBody } from '../../middlewares';
import { paymentController } from '../bootstrap';
import { PaymentCreationValidationSchema, PaymentUpdateValidationSchema } from './validations';

export const PaymentRouter = Router();

PaymentRouter.route('/')
  .get([isAuthenticated], asyncCatchHandler(paymentController.getPayments))
  .post(
    [isAuthenticated, validateRequestBody(PaymentCreationValidationSchema)],
    asyncCatchHandler(paymentController.createPayment)
  );

PaymentRouter.route('/:paymentId')
  .get([isAuthenticated], asyncCatchHandler(paymentController.getPaymentById))
  .patch(
    [isAuthenticated, validateRequestBody(PaymentUpdateValidationSchema)],
    asyncCatchHandler(paymentController.updatePayment)
  )
  .delete([isAuthenticated], asyncCatchHandler(paymentController.deletePayment));