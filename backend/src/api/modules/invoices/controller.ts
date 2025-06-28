import { Request, Response } from 'express';
import { SuccessResponses, BadRequest } from '../../../utils';
import { IInvoiceCreationBody, IInvoiceUpdateBody } from './types';
import { IInvoiceService } from './service';

export default class InvoiceController {
  _service: IInvoiceService;

  constructor(service: IInvoiceService) {
    this._service = service;
  }

  findInvoices = async (req: Request, res: Response) => {
    const { page, limit, ...otherQuery } = req.query;

    // If pagination parameters are provided, use paginated method
    if (page || limit) {
      const result = await this._service.findInvoicesWithPagination({
        ...otherQuery,
        company_id: req.auth?.cid,
        page: page || 1,
        limit: limit || 10
      } as Record<string, unknown>);

      return SuccessResponses(req, res, result.nodes, {
        statusCode: 200,
        pagination: result.page_info
      });
    }

    // Otherwise, return all invoices without pagination
    const invoices = await this._service.findInvoices({...otherQuery, company_id: req.auth?.cid} as Record<string, unknown>);
    return SuccessResponses(req, res, invoices, {
      statusCode: 200,
    });
  };

  findInvoiceById = async (req: Request, res: Response) => {
    const { invoiceId } = req.params;
    const invoice = await this._service.findInvoiceById(invoiceId);
    
    if (!invoice) {
      throw new BadRequest('Invoice not found');
    }
    
    return SuccessResponses(req, res, invoice, {
      statusCode: 200,
    });
  };

  findInvoiceWithItems = async (req: Request, res: Response) => {
    const { invoiceId } = req.params;
    const invoice = await this._service.findInvoiceWithItems(invoiceId);
    
    if (!invoice) {
      throw new BadRequest('Invoice not found');
    }
    
    return SuccessResponses(req, res, invoice, {
      statusCode: 200,
    });
  };

  createInvoice = async (req: Request, res: Response) => {
    const body = req.body as IInvoiceCreationBody;
    const invoice = await this._service.createInvoice({...body, company_id: req.auth?.cid});
    return SuccessResponses(req, res, invoice, {
      statusCode: 201,
    });
  };

  updateInvoice = async (req: Request, res: Response) => {
    const { invoiceId } = req.params;
    const body = req.body as IInvoiceUpdateBody;
    const invoice = await this._service.updateInvoice(invoiceId, body);
    return SuccessResponses(req, res, invoice, {
      statusCode: 200,
    });
  };

  deleteInvoice = async (req: Request, res: Response) => {
    const { invoiceId } = req.params;
    const result = await this._service.deleteInvoice(invoiceId);
    return SuccessResponses(req, res, result, {
      statusCode: 200,
    });
  };

  recordPayment = async (req: Request, res: Response) => {
    const { invoiceId } = req.params;
    const { amount } = req.body;
    
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      throw new BadRequest('Valid payment amount is required');
    }
    
    const invoice = await this._service.recordPayment(invoiceId, amount);
    return SuccessResponses(req, res, invoice, {
      statusCode: 200,
    });
  };
}
