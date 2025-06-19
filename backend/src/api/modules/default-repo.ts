import type {
  Attributes,
  CountOptions,
  CreateOptions,
  CreationAttributes,
  FindOptions,
  FindOrCreateOptions,
  Model,
  ModelStatic,
  Order,
  UpdateOptions,
} from '@sequelize/core';
import type { BaseRepository } from 'src/api/modules/baseRepo';
import type { Transaction, WhereOptions } from '@sequelize/core';
import { NotFound, PaginatedResponse } from 'src/utils';
import { Paginate } from 'src/utils/paginate';

type Options = { t?: Transaction; order?: Order };

export default abstract class DefaultRepository<M extends Model>
  implements BaseRepository<Attributes<M>, CreationAttributes<M>>
{
  abstract _model: ModelStatic<M>;

  async create(data: CreationAttributes<M>, options?: Options & CreateOptions<Attributes<M>>) {
    const record = await this._model.create(data, { transaction: options?.t, ...options });
    return record;
  }

  async bulkCreate(data: CreationAttributes<M>[], options?: Options & CreateOptions<Attributes<M>>) {
    const records = await this._model.bulkCreate(data, { transaction: options?.t, ...options });
    return records;
  }

  findOrCreate(options: FindOrCreateOptions<Attributes<M>, CreationAttributes<M>>) {
    return this._model.findOrCreate(options);
  }

  protected async __findOne(query: WhereOptions<Attributes<M>>, options?: Options) {
    const record = await this._model.findOne({
      where: query as WhereOptions<Attributes<M>>,
      transaction: options?.t,
    });
    if (!record) throw new NotFound(`${this._model.modelDefinition.modelName} not found!`);
    return record;
  }

  async update(query: WhereOptions<Attributes<M>> | Partial<Attributes<M>>, body: Partial<Attributes<M>>, options?: Options) {
    const record = await this.__findOne(query as WhereOptions<Attributes<M>>, options);
    record.set(body);
    await record.save({ transaction: options?.t });
    return record;
  }

  async bulkUpdate(
    query: WhereOptions<Attributes<M>> | Partial<Attributes<M>>,
    body: Partial<Attributes<M>>,
    options?: Omit<UpdateOptions<M>, 'where'>,
  ) {
    const result = await this._model.update(body, { where: query as WhereOptions<Attributes<M>>, ...options });
    return result;
  }

  async delete(query: WhereOptions<Attributes<M>> | Partial<Attributes<M>>, options?: Options) {
    const record = await this.__findOne(query as WhereOptions<Attributes<M>>, options);
    await record.destroy({ transaction: options?.t });
    return record;
  }

  async bulkDelete(query: WhereOptions<Attributes<M>> | Partial<Attributes<M>>, options?: Options) {
    const rowCount = await this._model.destroy({ where: query as WhereOptions<Attributes<M>>, transaction: options?.t });
    return rowCount;
  }

  async findOne(query: WhereOptions<Attributes<M>> | Partial<Attributes<M>>, options?: Options & FindOptions<Attributes<M>>) {
    const record = await this._model.findOne({
      where: query as WhereOptions<Attributes<M>>,
      transaction: options?.t,
      ...options,
    });
    return record;
  }

  async upsert(body: CreationAttributes<M>) {
    const record = await this._model.upsert(body);
    return record;
  }

  async findById(id: string, options?: Options) {
    return await this.findOne({ id } as unknown as WhereOptions<Attributes<M>> | Partial<Attributes<M>>, options);
  }

  async find(
    _query: ((WhereOptions<Attributes<M>> | Partial<Attributes<M>>) & { limit?: number; offset?: number }) | undefined,
    options?: Options & FindOptions<Attributes<M>>,
  ) {
    const { limit, offset, ...query } = _query ?? {};
    const records = await this._model.findAll({
      where: query as WhereOptions<Attributes<M>>,
      limit: limit ? +limit : undefined,
      offset: offset ? +offset : undefined,
      order: options?.order,
      transaction: options?.t,
      ...options,
    });
    return records;
  }

  async count(
    query: (WhereOptions<Attributes<M>> | Partial<Attributes<M>>) | undefined,
    options?: Options & CountOptions<Attributes<M>>,
  ) {
    const count = await this._model.count({
      where: query as WhereOptions<Attributes<M>>,
      transaction: options?.t,
      ...options,
    });
    return count;
  }

  async findWithPagination(
    _query:
      | ((WhereOptions<Attributes<M>> | Partial<Attributes<M>>) & { limit?: number | string; page?: number | string })
      | undefined,
    options?: Options & FindOptions<Attributes<M>>,
  ) {
    const { limit = 10, page = 1, ...query } = _query ?? {};
    const { order, t, ...otherOptions } = options ?? {};
    let { rows, count } = await this._model.findAndCountAll({
      where: query as WhereOptions<Attributes<M>>,
      limit: +limit || 10,
      offset: (+limit || 10) * ((+page || 1) - 1),
      order: order,
      transaction: t,
      ...otherOptions,
    });
    if (otherOptions?.include) {
      count = await this._model.count({ where: query as WhereOptions<Attributes<M>>, transaction: t });
    }
    const builder = Paginate.builder();
    builder
      .setData(rows)
      .setTotal(count)
      .setQueryParams({ limit: limit as string, page: page as string });
    return builder.build() as unknown as PaginatedResponse<M[]>;
  }
}