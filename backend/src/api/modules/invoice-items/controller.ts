import { Request, Response } from 'express';
import { SuccessResponses, BadRequest } from '../../../utils';
import { IInvoiceItemCreationBody, IInvoiceItemUpdateBody } from './types';
import { IInvoiceItemService } from './service';

export default class InvoiceItemController {
  _service: IInvoiceItemService;

  constructor(service: IInvoiceItemService) {
    this._service = service;
  }

  findInvoiceItems = async (req: Request, res: Response) => {
    const invoiceItems = await this._service.findInvoiceItems(req.query as Record<string, unknown>);
    return SuccessResponses(req, res, invoiceItems, {
      statusCode: 200,
    });
  };

  findInvoiceItemById = async (req: Request, res: Response) => {
    const { itemId } = req.params;
    const invoiceItem = await this._service.findInvoiceItemById(itemId);
    
    if (!invoiceItem) {
      throw new BadRequest('Invoice item not found');
    }
    
    return SuccessResponses(req, res, invoiceItem, {
      statusCode: 200,
    });
  };

  findInvoiceItemsByInvoiceId = async (req: Request, res: Response) => {
    const { invoiceId } = req.params;
    const invoiceItems = await this._service.findInvoiceItemsByInvoiceId(invoiceId);
    return SuccessResponses(req, res, invoiceItems, {
      statusCode: 200,
    });
  };

  createInvoiceItem = async (req: Request, res: Response) => {
    const body = req.body as IInvoiceItemCreationBody;
    const invoiceItem = await this._service.createInvoiceItem(body);
    return SuccessResponses(req, res, invoiceItem, {
      statusCode: 201,
    });
  };

  updateInvoiceItem = async (req: Request, res: Response) => {
    const { itemId } = req.params;
    const body = req.body as IInvoiceItemUpdateBody;
    const invoiceItem = await this._service.updateInvoiceItem(itemId, body);
    return SuccessResponses(req, res, invoiceItem, {
      statusCode: 200,
    });
  };

  deleteInvoiceItem = async (req: Request, res: Response) => {
    const { itemId } = req.params;
    const result = await this._service.deleteInvoiceItem(itemId);
    return SuccessResponses(req, res, result, {
      statusCode: 200,
    });
  };
}