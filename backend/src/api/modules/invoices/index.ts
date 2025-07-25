import { Router } from 'express';
import {
  asyncCatchHandler,
  isAuthenticated,
  validateRequestBody,
} from '../../middlewares';
import { invoiceController } from '../bootstrap';
import { InvoiceCreationValidationSchema, InvoiceUpdateValidationSchema } from './validations';

export const InvoiceRouter = Router();

InvoiceRouter.route('/')
  .get([isAuthenticated], asyncCatchHandler(invoiceController.findInvoices))
  .post(
    [isAuthenticated, validateRequestBody(InvoiceCreationValidationSchema)],
    asyncCatchHandler(invoiceController.createInvoice),
  );

InvoiceRouter.route('/:invoiceId')
  .get([isAuthenticated], asyncCatchHandler(invoiceController.findInvoiceById))
  .patch(
    [isAuthenticated, validateRequestBody(InvoiceUpdateValidationSchema)],
    asyncCatchHandler(invoiceController.updateInvoice),
  )
  .delete(
    [isAuthenticated],
    asyncCatchHandler(invoiceController.deleteInvoice),
  );

InvoiceRouter.route('/:invoiceId/payments')
  .post(
    [isAuthenticated],
    asyncCatchHandler(invoiceController.recordPayment),
  );

InvoiceRouter.route('/:invoiceId/with-items')
  .get([isAuthenticated], asyncCatchHandler(invoiceController.findInvoiceWithItems));

InvoiceRouter.route('/:invoiceId/with-bills')
  .get([isAuthenticated], asyncCatchHandler(invoiceController.findInvoiceWithBills));

InvoiceRouter.route('/:invoiceId/effective-balance')
  .get([isAuthenticated], asyncCatchHandler(invoiceController.getEffectiveBalance));
