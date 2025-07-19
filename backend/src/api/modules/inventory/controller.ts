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
    const inventory = await this._service.findInventory({...req.query, companyId: req.auth?.cid} as Record<string, unknown>);
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
    if(!req.auth?.cid) throw new Error("Company ID is missing");
    const inventory = await this._service.updateInventory(inventoryId, {...body, companyId: req.auth?.cid});
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

  getInventoryStats = async (req: Request, res: Response) => {
    if(!req.auth?.cid) throw new Error("Company ID is missing");
    const stats = await this._service.getInventoryStats(req.auth?.cid);
    return SuccessResponses(req, res, stats, {
      statusCode: 200,
    });
  };

  getLowStockItems = async (req: Request, res: Response) => {
    const { threshold } = req.query;
    if(!req.auth?.cid) throw new Error("Company ID is missing");
    const lowStockItems = await this._service.getLowStockItems(
      req.auth?.cid,
      threshold ? parseInt(threshold as string) : undefined
    );
    return SuccessResponses(req, res, lowStockItems, {
      statusCode: 200,
    });
  };
}