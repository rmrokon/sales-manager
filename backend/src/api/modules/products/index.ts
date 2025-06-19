import { Router } from 'express';
import {
  asyncCatchHandler,
  isAuthenticated,
  validateRequestBody,
} from '../../middlewares';
import { productController } from '../bootstrap';
import { ProductBodyValidationSchema } from './validations';

export const ProductRouter = Router();

ProductRouter.route('/')
  .get([isAuthenticated], asyncCatchHandler(productController.findProducts))
  .post(
    [isAuthenticated, validateRequestBody(ProductBodyValidationSchema)],
    asyncCatchHandler(productController.createProduct),
  );

ProductRouter.route('/:productId')
  .patch(
    [isAuthenticated, validateRequestBody(ProductBodyValidationSchema)],
    asyncCatchHandler(productController.updateProduct),
  )
  .delete(
    [isAuthenticated],
    asyncCatchHandler(productController.deleteProduct),
  );
