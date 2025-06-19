import Zone from './model';
import { ICreateZone, IZone } from './types';
import DefaultRepository from '../default-repo';
import { BaseRepository } from '../baseRepo';


export default class ZoneRepository extends DefaultRepository<Zone> implements BaseRepository<IZone, ICreateZone> {
  _model;

  constructor(model: typeof Zone) {
    super();    this._model = model;
  }
}