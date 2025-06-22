/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ICreateUser, IUser } from './types';
import { BaseModel } from '../base-model';
import { Transaction } from '@sequelize/core';
import {ErrorFactory, ErrorTypes} from '../../../utils';
import DefaultRepository from '../default-repo';
import { BaseRepo, BaseRepository } from '../baseRepo';
import User from './model';

export default class UserRepository extends DefaultRepository<User> implements BaseRepository<IUser, ICreateUser>{
  _model;

  constructor(model: typeof User){
    super();
    this._model = model;
  }
}