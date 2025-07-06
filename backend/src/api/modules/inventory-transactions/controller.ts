import { Request, Response } from 'express';
import { SuccessResponses } from '../../../utils';
import { IInventoryTransactionService } from './service';

export default class InventoryTransactionController {
  _service: IInventoryTransactionService;

  constructor(service: IInventoryTransactionService) {
    this._service = service;
  }

  getTransactions = async (req: Request, res: Response) => {
    const { invoiceId, returnId, productId } = req.query;
    
    let transactions;
    if (invoiceId) {
      transactions = await this._service.findTransactionsByInvoice(invoiceId as string);
    } else if (returnId) {
      transactions = await this._service.findTransactionsByReturn(returnId as string);
    } else if (productId) {
      transactions = await this._service.findTransactionsByProduct(productId as string);
    } else {
      transactions = await this._service.findTransactions({
        company_id: req?.auth?.cid,
      });
    }

    return SuccessResponses(req, res, transactions, {
      statusCode: 200,
    });
  };
}
