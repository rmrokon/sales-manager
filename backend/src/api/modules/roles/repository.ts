import { ICreateRole, IRole } from './types';
import DefaultRepository from '../default-repo';
import { BaseRepository } from '../baseRepo';
import Role from './model';

export default class RoleRepository extends DefaultRepository<Role> implements BaseRepository<IRole, ICreateRole> {
  _model;

  constructor(model: typeof Role) {
    super();
    this._model = model;
  }
}
