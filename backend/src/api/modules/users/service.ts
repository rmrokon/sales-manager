/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Transaction } from '@sequelize/core';
import { ErrorFactory, ErrorTypes, IDataValues } from '../../../utils';
import { BaseRepository } from '../baseRepo';
import { IUser, IUserRequestBody } from './types';
import Employee from '../employees/model';
import User from './model';
import UserRepository from './repository';


export interface IUserService {
  createUser(args: IUserRequestBody): Promise<IUser>;
  updateUser(
    query: Partial<IUserRequestBody> & { id: string },
    body: Partial<IUserRequestBody>,
    options?: { t: Transaction },
  ): Promise<IDataValues<IUser>>;
  find(query: Record<string, unknown>, options?: { t: Transaction }): Promise<Partial<IUser>[]>;
  deleteUser(id: string): Promise<Partial<IUser>>;
  getUserWithAllData(id: string): Promise<any>;
}

export default class UserService implements IUserService {
  _repo: UserRepository;

  constructor(repo: UserRepository) {
    this._repo = repo;
  }

  convertToJson(data: IDataValues<IUser>) {
    if (!data) return null;
    return {
      ...data?.dataValues,
    };
  }

  async createUser(body: IUserRequestBody, options?: { t: Transaction }) {
    const user = await this._repo.create(body, options);
    return this.convertToJson(user as IDataValues<IUser>)!;
  }

  async find(query: Record<string, unknown>, options?: { t: Transaction }) {
    const users = await this._repo.find(query, options);
    return users;
  }

  async createUserRaw(body: IUserRequestBody, options?: { t: Transaction }) {
    const user = await this._repo.create(body, options);
    return user as IDataValues<IUser>;
  }

  async updateUser(
    query: Partial<IUserRequestBody> & { id: string },
    body: Partial<IUserRequestBody>,
    options?: { t: Transaction },
  ) {
    const updatedUser = await this._repo.update(query, body, options);
    return updatedUser as IDataValues<IUser>;
  }

  async findUserById(id: string, options?: { t: Transaction }) {
    const user = await this._repo.findById(id, options);
    return this.convertToJson(user as unknown as IDataValues<IUser>);
  }

  async findRawUserById(id: string, options?: { t: Transaction }) {
    const user = await this._repo.findOne({ id }, options);
    return user;
  }

  async findUserByRaw(query: Record<string, unknown>, options?: { t: Transaction }) {
    const user = await this._repo.findOne(query, options);
    return user;
  }

  async findUserBy(query: Record<string, unknown>, options?: { t: Transaction }) {
    const users = await this._repo.find(query, options);
    return users;
  }

  async deleteUser(id: string){
    const result = await this._repo.delete({id});
    return result;
  }

  async getUserWithAllData(id: string){
    const user = await this._repo.findById(id);
    if(!user) throw ErrorFactory.createError(ErrorTypes.BadRequest, "User not found!");
    const companyWithChannels = await user.getCompanies();
    console.log({companyWithChannels});
    return {user, company: companyWithChannels}
  }
}
