import { Transaction } from '@sequelize/core';
import { sequelize } from '../../../configs';
import { InternalServerError } from '../../../utils/errors';
import PaymentRepository from './repository';
import { IPayment, IPaymentCreationBody, IPaymentUpdateBody } from './types';

interface IDataValues<T> {
  dataValues: T;
}

export default class PaymentService {
  _repo: PaymentRepository;

  constructor(repo: PaymentRepository) {
    this._repo = repo;
  }

  convertToJson(data: IDataValues<IPayment>) {
    if (!data) return null;
    return {
      ...data?.dataValues,
    };
  }

  async createPayment(body: IPaymentCreationBody, options?: { t: Transaction }) {
    const record = await this._repo.create(body, options);
    return this.convertToJson(record as IDataValues<IPayment>)!;
  }

  async findPayments(query: Record<string, unknown>, options?: { t: Transaction }) {
    const payments = await this._repo.find(query, options);
    return payments.map(payment => this.convertToJson(payment as IDataValues<IPayment>));
  }

  async findPaymentById(id: string) {
    const payment = await this._repo.findById(id);
    return payment ? this.convertToJson(payment as IDataValues<IPayment>) : null;
  }

  async updatePayment(id: string, body: IPaymentUpdateBody) {
    const success = await sequelize.transaction(async (t) => {
      return await this._repo.update({id}, body, { t });
    });
    
    if (!success) throw new InternalServerError('Update payment failed');
    
    const updatedPayment = await this.findPaymentById(id);
    return updatedPayment;
  }

  async deletePayment(id: string) {
    const success = await sequelize.transaction(async (t) => {
      return await this._repo.delete({id}, { t });
    });
    
    if (!success) throw new InternalServerError('Delete payment failed');
    
    return { success: true };
  }
}