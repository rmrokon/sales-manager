import { Request, Response } from 'express';
import { SuccessResponses, BadRequest } from '../../../utils';
import { IProductReturnService } from './service';
import { IProductReturnCreationBody, IProductReturnUpdateBody } from './types';

export default class ProductReturnController {
  _service: IProductReturnService;

  constructor(service: IProductReturnService) {
    this._service = service;
  }

  getReturns = async (req: Request, res: Response) => {
    const { invoiceId, zoneId, status } = req.query;
    
    let returns;
    if (invoiceId) {
      returns = await this._service.findReturnsByInvoice(invoiceId as string);
    } else if (zoneId) {
      returns = await this._service.findReturnsByZone(zoneId as string);
    } else {
      const query: Record<string, unknown> = {};
      if (status) query.status = status;
      returns = await this._service.findReturns(query);
    }

    return SuccessResponses(req, res, returns, {
      statusCode: 200,
    });
  };

  getReturnById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const productReturn = await this._service.findReturnById(id);
    
    if (!productReturn) {
      throw new BadRequest('Product return not found');
    }

    return SuccessResponses(req, res, productReturn, {
      statusCode: 200,
    });
  };

  createReturn = async (req: Request, res: Response) => {
    const body = req.body as IProductReturnCreationBody;
    const productReturn = await this._service.createReturn(body);
    
    return SuccessResponses(req, res, productReturn, {
      statusCode: 201,
    });
  };

  updateReturn = async (req: Request, res: Response) => {
    const { id } = req.params;
    const body = req.body as IProductReturnUpdateBody;
    const productReturn = await this._service.updateReturn(id, body);
    
    return SuccessResponses(req, res, productReturn, {
      statusCode: 200,
    });
  };

  approveReturn = async (req: Request, res: Response) => {
    const { id } = req.params;
    const productReturn = await this._service.approveReturn(id);
    
    return SuccessResponses(req, res, productReturn, {
      statusCode: 200,
    });
  };

  rejectReturn = async (req: Request, res: Response) => {
    const { id } = req.params;
    const productReturn = await this._service.rejectReturn(id);
    
    return SuccessResponses(req, res, productReturn, {
      statusCode: 200,
    });
  };
}
