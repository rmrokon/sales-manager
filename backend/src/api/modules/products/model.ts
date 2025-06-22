import { BelongsToManySetAssociationsMixin, CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from '@sequelize/core';
import { sequelize } from '../../../configs';
import Provider from '../providers/model';
import Company from '../companies/model';

export default class Product extends Model<InferAttributes<Product>, InferCreationAttributes<Product>> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare company_id?: CreationOptional<string>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare setProviders: BelongsToManySetAssociationsMixin<Provider, Provider["id"]>;
}

Product.init(
  {
    id: {
      allowNull: false,
      autoIncrement: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdAt: {
      columnName: 'created_at',
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      columnName: 'updated_at',
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
    tableName: 'products',
    modelName: 'Product',
    sequelize,
    paranoid: true
  },
);

Provider.belongsToMany(Product, {
  through: 'ProviderProducts',
  foreignKey: 'provider_id',
  otherKey: 'product_id',
});

Product.belongsToMany(Provider, {
  through: 'ProviderProducts',
  foreignKey: 'product_id',
  otherKey: 'provider_id',
});


Company.hasMany(Product, {
  foreignKey: {
    name: 'company_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
});

Product.belongsTo(Company, {
  foreignKey: {
    name: 'company_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
});