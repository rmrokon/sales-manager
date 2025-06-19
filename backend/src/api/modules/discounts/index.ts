import { Router } from 'express';
import { asyncCatchHandler, isAuthenticated, validateRequestBody } from '../../middlewares';
import { discountController } from '../bootstrap';
import { DiscountCreationValidationSchema, DiscountUpdateValidationSchema } from './validations';

export const DiscountRouter = Router();

DiscountRouter.route('/')
  .get([isAuthenticated], asyncCatchHandler(discountController.getDiscounts))
  .post(
    [isAuthenticated, validateRequestBody(DiscountCreationValidationSchema)],
    asyncCatchHandler(discountController.createDiscount)
  );

DiscountRouter.route('/active')
  .get([isAuthenticated], asyncCatchHandler(discountController.getActiveDiscounts));

DiscountRouter.route('/:discountId')
  .get([isAuthenticated], asyncCatchHandler(discountController.getDiscountById))
  .patch(
    [isAuthenticated, validateRequestBody(DiscountUpdateValidationSchema)],
    asyncCatchHandler(discountController.updateDiscount)
  )
  .delete([isAuthenticated], asyncCatchHandler(discountController.deleteDiscount));