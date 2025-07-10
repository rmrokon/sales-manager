import { Transaction } from '@sequelize/core';
import ProductReturnItem from './model';
import { IProductReturnItem, ICreateProductReturnItem } from './types';
import DefaultRepository from '../default-repo';
import { BaseRepository } from '../baseRepo';

export default class ProductReturnItemRepository extends DefaultRepository<ProductReturnItem> implements BaseRepository<IProductReturnItem, ICreateProductReturnItem> {
  _model;
  constructor(model: typeof ProductReturnItem) {
    super();
    this._model = model;
  }
}
