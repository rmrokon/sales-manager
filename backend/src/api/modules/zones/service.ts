import { Transaction } from '@sequelize/core';
import { sequelize } from '../../../configs';
import { InternalServerError } from '../../../utils/errors';
import ZoneRepository from './repository';
import { IZone, IZoneCreationBody, IZoneUpdateBody } from './types';

interface IDataValues<T> {
  dataValues: T;
}

export default class ZoneService {
  _repo: ZoneRepository;

  constructor(repo: ZoneRepository) {
    this._repo = repo;
  }

  convertToJson(data: IDataValues<IZone>) {
    if (!data) return null;
    return {
      ...data?.dataValues,
    };
  }

  async createZone(body: IZoneCreationBody, options?: { t: Transaction }) {
    const record = await this._repo.create(body, options);
    return this.convertToJson(record as IDataValues<IZone>)!;
  }

  async findZones(query: Record<string, unknown>, options?: { t: Transaction }) {
    const zones = await this._repo.find(query, options);
    return zones.map(zone => this.convertToJson(zone as IDataValues<IZone>));
  }

  async findZoneById(id: string) {
    const zone = await this._repo.findById(id);
    return zone ? this.convertToJson(zone as IDataValues<IZone>) : null;
  }

  async updateZone(id: string, body: IZoneUpdateBody) {
    const success = await sequelize.transaction(async (t) => {
      return await this._repo.update(id, body, { t });
    });
    
    if (!success) throw new InternalServerError('Update zone failed');
    
    const updatedZone = await this.findZoneById(id);
    return updatedZone;
  }

  async deleteZone(id: string) {
    const success = await sequelize.transaction(async (t) => {
      return await this._repo.delete(id, { t });
    });
    
    if (!success) throw new InternalServerError('Delete zone failed');
    
    return { success: true };
  }
}