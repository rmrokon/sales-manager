import { Router } from 'express';
import { BillCreationValidationSchema, BillUpdateValidationSchema } from './validations';
import { asyncCatchHandler, isAuthenticated, validateRequestBody } from 'src/api/middlewares';
import { billController } from '../bootstrap';

export const BillRouter = Router();

BillRouter.post('/', [isAuthenticated, validateRequestBody(BillCreationValidationSchema)], asyncCatchHandler(billController.createBill));
BillRouter.get('/', [isAuthenticated], asyncCatchHandler(billController.findBills));
BillRouter.get('/:id', [isAuthenticated], asyncCatchHandler(billController.findBillById))
    .patch('/:id', [isAuthenticated, validateRequestBody(BillUpdateValidationSchema)], asyncCatchHandler(billController.updateBill))
    .delete('/:id', [isAuthenticated], asyncCatchHandler(billController.deleteBill));

