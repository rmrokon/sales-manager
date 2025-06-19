import { ICreateProduct, IProduct } from './types';
import DefaultRepository from '../default-repo';
import { BaseRepository } from '../baseRepo';
import Product from './model';

export default class ProductRepository extends DefaultRepository<Product> implements BaseRepository<IProduct, ICreateProduct> {
  _model;

  constructor(model: typeof Product) {
    super();
    this._model = model;
  }
}
