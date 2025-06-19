import Inventory from './model';
import { ICreateInventory, IInventory } from './types';
import DefaultRepository from '../default-repo';
import { BaseRepository } from '../baseRepo';

export default class InventoryRepository extends DefaultRepository<Inventory> implements BaseRepository<IInventory, ICreateInventory> {
  _model;

  constructor(model: typeof Inventory) {
    super();
    this._model = model;
  }
}