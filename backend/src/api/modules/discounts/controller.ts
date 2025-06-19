import { Request, Response } from 'express';
import DiscountService from './service';
import { IDiscountCreationBody, IDiscountUpdateBody } from './types';

export default class DiscountController {
  _service: DiscountService;

  constructor(service: DiscountService) {
    this._service = service;
  }

  getDiscounts = async (req: Request, res: Response) => {
    const query = req.query || {};
    const discounts = await this._service.findDiscounts(query as Record<string, unknown>);
    return res.status(200).json({ data: discounts });
  };

  getDiscountById = async (req: Request, res: Response) => {
    const { discountId } = req.params;
    const discount = await this._service.findDiscountById(discountId);
    
    if (!discount) {
      return res.status(404).json({ message: 'Discount not found' });
    }
    
    return res.status(200).json({ data: discount });
  };

  createDiscount = async (req: Request, res: Response) => {
    const body = req.body as IDiscountCreationBody;
    const discount = await this._service.createDiscount(body);
    return res.status(201).json({ data: discount });
  };

  updateDiscount = async (req: Request, res: Response) => {
    const { discountId } = req.params;
    const body = req.body as IDiscountUpdateBody;
    const discount = await this._service.updateDiscount(discountId, body);
    return res.status(200).json({ data: discount });
  };

  deleteDiscount = async (req: Request, res: Response) => {
    const { discountId } = req.params;
    await this._service.deleteDiscount(discountId);
    return res.status(200).json({ message: 'Discount deleted successfully' });
  };

  getActiveDiscounts = async (req: Request, res: Response) => {
    const { productId, companyId } = req.query;
    
    if (!productId || !companyId) {
      return res.status(400).json({ message: 'Product ID and Company ID are required' });
    }
    
    const discounts = await this._service.findActiveDiscounts(
      productId as string, 
      companyId as string
    );
    
    return res.status(200).json({ data: discounts });
  };
}