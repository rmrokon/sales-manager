import Invoice from './model';
import { ICreateInvoice, IInvoice } from './types';
import DefaultRepository from '../default-repo';
import { BaseRepository } from '../baseRepo';

export default class InvoiceRepository extends DefaultRepository<Invoice> implements BaseRepository<IInvoice, ICreateInvoice> {
  _model;

  constructor(model: typeof Invoice) {
    super();
    this._model = model;
  }
}