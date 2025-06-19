import { ICreateProvider, IProvider } from './types';
import DefaultRepository from '../default-repo';
import { BaseRepository } from '../baseRepo';
import Provider from './model';

export default class ProviderRepository extends DefaultRepository<Provider> implements BaseRepository<IProvider, ICreateProvider> {
  _model;

  constructor(model: typeof Provider) {
    super();
    this._model = model;
  }
}
