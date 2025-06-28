import { Request, Response } from 'express';
import { SuccessResponses } from '../../../utils/responses';
import { IProductRequestBody } from './types';
import { IProductService } from './service';
import { BadRequest } from '../../../utils';

export default class ProductController {
  _service: IProductService;

  constructor(service: IProductService) {
    this._service = service;
  }

  findProducts = async (req: Request, res: Response) => {
    const { page, limit, ...otherQuery } = req.query;

    // If pagination parameters are provided, use paginated method
    if (page || limit) {
      const result = await this._service.findProductsWithPagination({
        ...otherQuery,
        company_id: req?.auth?.cid,
        page: page || 1,
        limit: limit || 10
      } as Record<string, unknown>);

      return SuccessResponses(req, res, result.nodes, {
        statusCode: 200,
        pagination: result.page_info
      });
    }

    // Otherwise, return all products without pagination
    const products = await this._service.findProducts({
      ...otherQuery,
      company_id: req?.auth?.cid,
      include: ['providers'] // Include providers in the response
    });
    return SuccessResponses(req, res, products, {
      statusCode: 200,
    });
  };

  createProduct = async (req: Request, res: Response) => {
    const body = req.body as IProductRequestBody;
    if (!req?.auth?.cid) throw new BadRequest('Company needs to be selected to create a product');
    const product = await this._service.createProduct({
      ...body,
    });
    return SuccessResponses(req, res, product, {
      statusCode: 200,
    });
  };

  updateProduct = async (req: Request, res: Response) => {
    const body = req.body as IProductRequestBody;
    const { productId } = req.params as { productId: string };
    if (!req?.auth?.cid) throw new BadRequest('Company needs to be selected to create a product');
    const product = await this._service.updateProduct(
      { id: productId },
      {
        ...body,
      },
    );
    return SuccessResponses(req, res, product, {
      statusCode: 200,
    });
  };

  deleteProduct = async (req: Request, res: Response) => {
    const { productId } = req.params as { productId: string };
    if (!req?.auth?.cid) throw new BadRequest('Company needs to be selected to create a product');
    const product = await this._service.deleteProduct({
      id: productId,
    });
    return SuccessResponses(req, res, product, {
      statusCode: 200,
    });
  };
}
