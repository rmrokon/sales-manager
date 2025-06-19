import { Router } from 'express';
import {
  asyncCatchHandler,
  isAuthenticated,
  validateRequestBody,
} from '../../middlewares';
import { invoiceItemController } from '../bootstrap';
import { InvoiceItemCreationValidationSchema, InvoiceItemUpdateValidationSchema } from './validations';

export const InvoiceItemRouter = Router();

InvoiceItemRouter.route('/')
  .get([isAuthenticated], asyncCatchHandler(invoiceItemController.findInvoiceItems))
  .post(
    [isAuthenticated, validateRequestBody(InvoiceItemCreationValidationSchema)],
    asyncCatchHandler(invoiceItemController.createInvoiceItem),
  );

InvoiceItemRouter.route('/:itemId')
  .get([isAuthenticated], asyncCatchHandler(invoiceItemController.findInvoiceItemById))
  .patch(
    [isAuthenticated, validateRequestBody(InvoiceItemUpdateValidationSchema)],
    asyncCatchHandler(invoiceItemController.updateInvoiceItem),
  )
  .delete(
    [isAuthenticated],
    asyncCatchHandler(invoiceItemController.deleteInvoiceItem),
  );