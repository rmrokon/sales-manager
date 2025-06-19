import { Router } from 'express';
import {
  asyncCatchHandler,
  isAuthenticated,
  validateRequestBody,
} from '../../middlewares';
import { inventoryController } from '../bootstrap';
import { InventoryCreationValidationSchema, InventoryUpdateValidationSchema } from './validations';

export const InventoryRouter = Router();

InventoryRouter.route('/')
  .get([isAuthenticated], asyncCatchHandler(inventoryController.findInventory))
  .post(
    [isAuthenticated, validateRequestBody(InventoryCreationValidationSchema)],
    asyncCatchHandler(inventoryController.createInventory),
  );

InventoryRouter.route('/:inventoryId')
  .get([isAuthenticated], asyncCatchHandler(inventoryController.findInventoryById))
  .patch(
    [isAuthenticated, validateRequestBody(InventoryUpdateValidationSchema)],
    asyncCatchHandler(inventoryController.updateInventory),
  )
  .delete(
    [isAuthenticated],
    asyncCatchHandler(inventoryController.deleteInventory),
  );