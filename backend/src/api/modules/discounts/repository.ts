import Discount from './model';
import { ICreateDiscount, IDiscount } from './types';
import DefaultRepository from '../default-repo';
import { BaseRepository } from '../baseRepo';


export default class DiscountRepository extends DefaultRepository<Discount> implements BaseRepository<IDiscount, ICreateDiscount> {
  _model;

  constructor(model: typeof Discount) {
    super();
    this._model = model;
  }
}