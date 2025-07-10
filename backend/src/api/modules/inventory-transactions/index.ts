import { Router } from 'express';
import { asyncCatchHandler, isAuthenticated } from '../../middlewares';
import { inventoryTransactionController } from '../bootstrap';

export const InventoryTransactionRouter = Router();

InventoryTransactionRouter.route('/')
  .get([isAuthenticated], asyncCatchHandler(inventoryTransactionController.getTransactions));
