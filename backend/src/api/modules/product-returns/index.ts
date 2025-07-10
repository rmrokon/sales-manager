import { Router } from 'express';
import { asyncCatchHandler, isAuthenticated, validateRequestBody } from '../../middlewares';
import { productReturnController } from '../bootstrap';
import { ProductReturnCreationValidationSchema, ProductReturnUpdateValidationSchema } from './validations';

export const ProductReturnRouter = Router();

ProductReturnRouter.route('/')
  .get([isAuthenticated], asyncCatchHandler(productReturnController.getReturns))
  .post(
    [isAuthenticated, validateRequestBody(ProductReturnCreationValidationSchema)],
    asyncCatchHandler(productReturnController.createReturn)
  );

ProductReturnRouter.route('/:id')
  .get([isAuthenticated], asyncCatchHandler(productReturnController.getReturnById))
  .put(
    [isAuthenticated, validateRequestBody(ProductReturnUpdateValidationSchema)],
    asyncCatchHandler(productReturnController.updateReturn)
  );

ProductReturnRouter.route('/:id/approve')
  .put([isAuthenticated], asyncCatchHandler(productReturnController.approveReturn));

ProductReturnRouter.route('/:id/reject')
  .put([isAuthenticated], asyncCatchHandler(productReturnController.rejectReturn));
