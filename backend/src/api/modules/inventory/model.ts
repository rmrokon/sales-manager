import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, sql } from '@sequelize/core';
import { sequelize } from '../../../configs';
import Product from '../products/model';
import Provider from '../providers/model';
import Company from '../companies/model';

export default class Inventory extends Model<InferAttributes<Inventory>, InferCreationAttributes<Inventory>> {
  declare id: CreationOptional<string>;
  declare productId: string;
  declare providerId: string;
  declare quantity: number;
  declare companyId?: string;
  declare unitPrice: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Inventory.init(
  {
    id: {
      allowNull: false,
      autoIncrement: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: sql.uuidV4,
    },
    productId: {
      field: 'product_id',
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Product,
        key: 'id'
      }
    },
    providerId: {
      field: 'provider_id',
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Provider,
        key: 'id'
      }
    },
    companyId: {
      field: 'company_id',
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Company,
        key: 'id'
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    unitPrice: {
      field: 'unit_price',
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    createdAt: {
      field: 'created_at',
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      field: 'updated_at',
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
    tableName: 'inventory',
    modelName: 'Inventory',
    sequelize,
    paranoid: true
  },
);

// Set up associations
Product.hasMany(Inventory, {
  foreignKey: {
    name: 'productId',
    field: 'product_id'
  }
});

Inventory.belongsTo(Product, {
  foreignKey: {
    name: 'productId',
    field: 'product_id'
  }
});

Provider.hasMany(Inventory, {
  foreignKey: {
    name: 'providerId',
    field: 'provider_id'
  }
});

Inventory.belongsTo(Provider, {
  foreignKey: {
    name: 'providerId',
    field: 'provider_id'
  }
});

Company.hasMany(Inventory, {
  foreignKey: {
    name: 'companyId',
    field: 'company_id'
  }
});

Inventory.belongsTo(Company, {
  foreignKey: {
    name: 'companyId',
    field: 'company_id'
  }
});

