import { IDataValues, InternalServerError } from '../../../utils';
import { IBill, IBillCreationBody, IBillUpdateBody } from './types';
import BillRepository from './repository';
import { Transaction } from '@sequelize/core';

export interface IBillService {
  findBills(query: Record<string, unknown>): Promise<IBill[]>;
  updateBill(id: string, body: IBillUpdateBody): Promise<IBill>;
  deleteBill(id: string): Promise<{ success: boolean }>;
  createBill(body: IBillCreationBody): Promise<IBill>;
  createBillInBulk(bills: IBillCreationBody[], transaction?: Transaction): Promise<IBill[]>;
  findBillById(id: string): Promise<IBill | null>;
}

export default class BillService implements IBillService {
  _repo: BillRepository;

  constructor(repo: BillRepository) {
    this._repo = repo;
  }

  convertToJson(data: IDataValues<IBill>) {
    if (!data) return null;
    return {
      ...data?.dataValues,
    };
  }

  async createBill(body: IBillCreationBody) {
    const bill = await this._repo.create(body);
    if (!bill) throw new InternalServerError('Create bill failed');
    return this.convertToJson(bill) as IBill;
  }

  async createBillInBulk(bills: IBillCreationBody[], transaction?: Transaction) {
    const createdBills: IBill[] = [];
    for (const billData of bills) {
      const bill = await this._repo.create(billData, { t: transaction });
      if (!bill) throw new InternalServerError('Create bill failed');
      createdBills.push(this.convertToJson(bill) as IBill);
    }
    return createdBills;
  }

  async updateBill(id: string, body: IBillUpdateBody) {
    const record = await this._repo.update({ id }, body);
    if (!record) throw new InternalServerError('Update bill failed');
    return this.convertToJson(record as IDataValues<IBill>) as IBill;
  }

  async deleteBill(id: string) {
    await this._repo.delete({ id });
    return { success: true };
  }

  async findBills(query: Record<string, unknown>) {
    const records = await this._repo.find(query);
    return records.map((record) => this.convertToJson(record as IDataValues<IBill>)!);
  }

  async findBillById(id: string) {
    const record = await this._repo.findById(id);
    return record ? this.convertToJson(record as IDataValues<IBill>) : null;
  }
}