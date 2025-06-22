import { ICreateProduct, IProduct } from './types';
import DefaultRepository from '../default-repo';
import { BaseRepository } from '../baseRepo';
import Product from './model';
import Provider from '../providers/model';

export default class ProductRepository extends DefaultRepository<Product> implements BaseRepository<IProduct, ICreateProduct> {
  _model;

  constructor(model: typeof Product) {
    super();
    this._model = model;
  }
  
  async find(query: Record<string, unknown>, options?: any) {
    const includeOptions = [];
    
    // Include providers if specified
    if (query.include && Array.isArray(query.include) && query.include.includes('providers')) {
      includeOptions.push({
        model: Provider,
        through: { attributes: [] } // Don't include junction table attributes
      });
      delete query.include; // Remove include from query to avoid Sequelize errors
    }
    
    return this._model.findAll({
      where: query,
      include: includeOptions.length > 0 ? includeOptions : undefined,
      transaction: options?.t
    });
  }
}
