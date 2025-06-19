/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Transaction } from '@sequelize/core';
import { ErrorFactory, ErrorTypes, IDataValues } from '../../../utils';
import { BaseRepository } from '../baseRepo';
import {
 IEmployee,
 IEmployeeCreationBody,
} from './types';
import Employee from './model';

export interface IEmployeeService {
  createEmployee(args: IEmployeeCreationBody): Promise<IEmployee>;
  updateEmployee(
    query: Partial<IEmployeeCreationBody> & { id: string },
    body: Partial<IEmployeeCreationBody>,
    options?: { t: Transaction },
  ): Promise<IDataValues<IEmployee>>;
  find(query: Record<string, unknown>, options?: { t: Transaction }): Promise<Partial<IEmployee>[]>;
  deleteEmployee(id: string): Promise<Partial<IEmployee>>;
}

export type IEmployeeServiceRepo = BaseRepository<Partial<IEmployee>>;

export default class EmployeeService implements IEmployeeService {
  _repo: IEmployeeServiceRepo;

  constructor(repo: IEmployeeServiceRepo) {
    this._repo = repo;
  }

  convertToJson(data: IDataValues<IEmployee>) {
    if (!data) return null;
    return {
      ...data?.dataValues,
    };
  }

  async createEmployee(body: IEmployeeCreationBody, options?: { t: Transaction }) {
    const employee = await this._repo.create(body, options);
    return this.convertToJson(employee as IDataValues<IEmployee>)!;
  }

  async find(query: Record<string, unknown>, options?: { t: Transaction }) {
    const employees = await this._repo.find(query, options);
    return employees;
  }

  async createCompanyRaw(body: IEmployeeCreationBody, options?: { t: Transaction }) {
    const employee = await this._repo.create(body, options);
    return employee as IDataValues<IEmployee>;
  }

  async updateEmployee(
    query: Partial<IEmployeeCreationBody> & { id: string },
    body: Partial<IEmployeeCreationBody>,
    options?: { t: Transaction },
  ) {
    const updatedEmployee = await this._repo.update(query, body, options);
    return updatedEmployee as IDataValues<IEmployee>;
  }

  async findEmployeeById(id: string, options?: { t: Transaction }) {
    const employee = await this._repo.findById(id, options);
    return this.convertToJson(employee as unknown as IDataValues<IEmployee>);
  }

  async findRawEmployeeById(id: string, options?: { t: Transaction }) {
    const employee = await this._repo.findOne({ id }, options);
    return employee;
  }

  async deleteEmployee(id: string): Promise<Partial<IEmployee>> {
    const res = await this._repo.delete({id});
    return res;
  }
}