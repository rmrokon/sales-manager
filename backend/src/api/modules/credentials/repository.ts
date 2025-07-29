import { ICreateCredential, ICredential } from './types';
import { BaseModel } from '../base-model';
import { Transaction } from '@sequelize/core';
import DefaultRepository from '../default-repo';
import { BaseRepository } from '../baseRepo';
import Credential from './model';

export default class CredentialRepository extends DefaultRepository<Credential> implements BaseRepository<ICredential, ICreateCredential> {
  _model;

  constructor(model: typeof Credential) {
    super();
    this._model = model;
  }
}
