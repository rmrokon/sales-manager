import { Request, Response } from 'express';
import { SuccessResponses, BadRequest } from '../../../utils';
import { IInventoryCreationBody, IInventoryUpdateBody } from './types';
import { IInventoryService } from './service';

export default class InventoryController {
  _service: IInventoryService;

  constructor(service: IInventoryService) {
    this._service = service;
  }

  findInventory = async (req: Request, res: Response) => {
    const inventory = await this._service.findInventory(req.query as Record<string, unknown>);
    return SuccessResponses(req, res, inventory, {
      statusCode: 200,
    });
  };

  findInventoryById = async (req: Request, res: Response) => {
    const { inventoryId } = req.params;
    const inventory = await this._service.findInventoryById(inventoryId);
    
    if (!inventory) {
      throw new BadRequest('Inventory item not found');
    }
    
    return SuccessResponses(req, res, inventory, {
      statusCode: 200,
    });
  };

  createInventory = async (req: Request, res: Response) => {
    const body = req.body as IInventoryCreationBody;
    const inventory = await this._service.createInventory(body);
    return SuccessResponses(req, res, inventory, {
      statusCode: 201,
    });
  };

  updateInventory = async (req: Request, res: Response) => {
    const { inventoryId } = req.params;
    const body = req.body as IInventoryUpdateBody;
    const inventory = await this._service.updateInventory(inventoryId, body);
    return SuccessResponses(req, res, inventory, {
      statusCode: 200,
    });
  };

  deleteInventory = async (req: Request, res: Response) => {
    const { inventoryId } = req.params;
    const result = await this._service.deleteInventory(inventoryId);
    return SuccessResponses(req, res, result, {
      statusCode: 200,
    });
  };
}