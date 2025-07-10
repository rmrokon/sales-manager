import Bill from './model';
import { ICreateBill, IBill } from './types';
import DefaultRepository from '../default-repo';
import { BaseRepository } from '../baseRepo';

export default class BillRepository extends DefaultRepository<Bill> implements BaseRepository<IBill, ICreateBill> {
  _model;

  constructor(model: typeof Bill) {
    super();
    this._model = model;
  }
}
