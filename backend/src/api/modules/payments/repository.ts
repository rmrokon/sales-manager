import { Transaction } from '@sequelize/core';
import Payment from './model';
import { IPayment } from './types';
import DefaultRepository from '../default-repo';
import { BaseRepository } from '../baseRepo';

type BaseModel<T> = typeof Payment;

export default class PaymentRepository extends DefaultRepository<Payment> implements BaseRepository<IPayment, IPayment> {
  _model;

  constructor(model: typeof Payment) {
    super();
    this._model = model;
  }
}