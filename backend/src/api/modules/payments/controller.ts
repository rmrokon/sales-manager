import { Request, Response } from 'express';
import PaymentService from './service';
import { IPaymentCreationBody, IPaymentUpdateBody } from './types';

export default class PaymentController {
  _service: PaymentService;

  constructor(service: PaymentService) {
    this._service = service;
  }

  getPayments = async (req: Request, res: Response) => {
    const query = req.query || {};
    const payments = await this._service.findPayments(query as Record<string, unknown>);
    return res.status(200).json({ data: payments });
  };

  getPaymentById = async (req: Request, res: Response) => {
    const { paymentId } = req.params;
    const payment = await this._service.findPaymentById(paymentId);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    return res.status(200).json({ data: payment });
  };

  createPayment = async (req: Request, res: Response) => {
    const body = req.body as IPaymentCreationBody;
    const payment = await this._service.createPayment(body);
    return res.status(201).json({ data: payment });
  };

  updatePayment = async (req: Request, res: Response) => {
    const { paymentId } = req.params;
    const body = req.body as IPaymentUpdateBody;
    const payment = await this._service.updatePayment(paymentId, body);
    return res.status(200).json({ data: payment });
  };

  deletePayment = async (req: Request, res: Response) => {
    const { paymentId } = req.params;
    await this._service.deletePayment(paymentId);
    return res.status(200).json({ message: 'Payment deleted successfully' });
  };
}