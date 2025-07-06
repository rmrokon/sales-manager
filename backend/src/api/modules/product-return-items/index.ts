import { Router } from 'express';
import { asyncCatchHandler, isAuthenticated, validateRequestBody } from '../../middlewares';
import { productReturnItemController } from '../bootstrap';
import { ProductReturnItemCreationValidationSchema, ProductReturnItemUpdateValidationSchema } from './validations';

export const ProductReturnItemRouter = Router();

ProductReturnItemRouter.route('/')
  .get([isAuthenticated], asyncCatchHandler(productReturnItemController.getReturnItems))
  .post(
    [isAuthenticated, validateRequestBody(ProductReturnItemCreationValidationSchema)],
    asyncCatchHandler(productReturnItemController.createReturnItem)
  );

ProductReturnItemRouter.route('/:id')
  .get([isAuthenticated], asyncCatchHandler(productReturnItemController.getReturnItemById))
  .put(
    [isAuthenticated, validateRequestBody(ProductReturnItemUpdateValidationSchema)],
    asyncCatchHandler(productReturnItemController.updateReturnItem)
  )
  .delete([isAuthenticated], asyncCatchHandler(productReturnItemController.deleteReturnItem));
