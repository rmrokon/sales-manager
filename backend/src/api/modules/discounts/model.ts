import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, sql } from '@sequelize/core';
import { sequelize } from '../../../configs';
import Product from '../products/model';
import Company from '../companies/model';

export default class Discount extends Model<InferAttributes<Discount>, InferCreationAttributes<Discount>> {
  declare id: CreationOptional<string>;
  declare productId?: string;
  declare companyId: string;
  declare percent: number;
  declare validFrom: Date;
  declare validTo: CreationOptional<Date>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Discount.init(
  {
    id: {
      allowNull: false,
      autoIncrement: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: sql.uuidV4,
    },
    productId: {
      columnName: 'product_id',
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Product,
        key: 'id'
      }
    },
    companyId: {
      columnName: 'company_id',
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Company,
        key: 'id'
      }
    },
    percent: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      validate: {
        min: 0,
        max: 100
      }
    },
    validFrom: {
      columnName: 'valid_from',
      type: DataTypes.DATE,
      allowNull: false,
    },
    validTo: {
      columnName: 'valid_to',
      type: DataTypes.DATE,
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
    tableName: 'discounts',
    modelName: 'Discount',
    sequelize,
    paranoid: true
  },
);

// Set up associations
Product.hasMany(Discount, {
  foreignKey: {
    name: 'productId',
    columnName: 'product_id'
  }
});

Discount.belongsTo(Product, {
  foreignKey: {
    name: 'productId',
    columnName: 'product_id'
  }
});

Company.hasMany(Discount, {
  foreignKey: {
    name: 'companyId',
    columnName: 'company_id'
  }
});

Discount.belongsTo(Company, {
  foreignKey: {
    name: 'companyId',
    columnName: 'company_id'
  }
});