import { Request, Response } from 'express';
import { SuccessResponses, BadRequest } from '../../../utils';
import { IProductReturnItemService } from './service';
import { IProductReturnItemCreationBody, IProductReturnItemUpdateBody } from './types';

export default class ProductReturnItemController {
  _service: IProductReturnItemService;

  constructor(service: IProductReturnItemService) {
    this._service = service;
  }

  getReturnItems = async (req: Request, res: Response) => {
    const { returnId, productId } = req.query;
    
    let returnItems;
    if (returnId) {
      returnItems = await this._service.findReturnItemsByReturn(returnId as string);
    } else {
      const query: Record<string, unknown> = {};
      if (productId) query.productId = productId;
      returnItems = await this._service.findReturnItems(query);
    }

    return SuccessResponses(req, res, returnItems, {
      statusCode: 200,
    });
  };

  getReturnItemById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const returnItem = await this._service.findReturnItemById(id);
    
    if (!returnItem) {
      throw new BadRequest('Return item not found');
    }

    return SuccessResponses(req, res, returnItem, {
      statusCode: 200,
    });
  };

  createReturnItem = async (req: Request, res: Response) => {
    const body = req.body as IProductReturnItemCreationBody;
    const returnItem = await this._service.createReturnItem(body);
    
    return SuccessResponses(req, res, returnItem, {
      statusCode: 201,
    });
  };

  updateReturnItem = async (req: Request, res: Response) => {
    const { id } = req.params;
    const body = req.body as IProductReturnItemUpdateBody;
    const returnItem = await this._service.updateReturnItem(id, body);
    
    return SuccessResponses(req, res, returnItem, {
      statusCode: 200,
    });
  };

  deleteReturnItem = async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await this._service.deleteReturnItem(id);
    
    return SuccessResponses(req, res, result, {
      statusCode: 200,
    });
  };
}
