import InvoiceItem from './model';
import { ICreateInvoiceItem, IInvoiceItem } from './types';
import DefaultRepository from '../default-repo';
import { BaseRepository } from '../baseRepo';

export default class InvoiceItemRepository extends DefaultRepository<InvoiceItem> implements BaseRepository<IInvoiceItem, ICreateInvoiceItem> {
  _model;

  constructor(model: typeof InvoiceItem) {
    super();
    this._model = model;
  }
}