import { Request, Response } from 'express';
import { SuccessResponses, BadRequest } from '../../../utils';
import { IBillCreationBody, IBillUpdateBody } from './types';
import { IBillService } from './service';

export default class BillController {
  _service: IBillService;

  constructor(service: IBillService) {
    this._service = service;
  }

  findBills = async (req: Request, res: Response) => {
    const bills = await this._service.findBills(req.query);
    return SuccessResponses(req, res, bills, {
      statusCode: 200,
    });
  };

  findBillById = async (req: Request, res: Response) => {
    const { billId } = req.params;
    const bill = await this._service.findBillById(billId);
    
    if (!bill) {
      throw new BadRequest('Bill not found');
    }
    
    return SuccessResponses(req, res, bill, {
      statusCode: 200,
    });
  };

  createBill = async (req: Request, res: Response) => {
    const body = req.body as IBillCreationBody;
    const bill = await this._service.createBill(body);
    return SuccessResponses(req, res, bill, {
      statusCode: 201,
    });
  };

  updateBill = async (req: Request, res: Response) => {
    const { billId } = req.params;
    const body = req.body as IBillUpdateBody;
    const bill = await this._service.updateBill(billId, body);
    return SuccessResponses(req, res, bill, {
      statusCode: 200,
    });
  };

  deleteBill = async (req: Request, res: Response) => {
    const { billId } = req.params;
    const result = await this._service.deleteBill(billId);
    return SuccessResponses(req, res, result, {
      statusCode: 200,
    });
  };
}