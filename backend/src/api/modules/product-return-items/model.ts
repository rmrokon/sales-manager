import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, sql } from '@sequelize/core';
import { sequelize } from '../../../configs';
import ProductReturn from '../product-returns/model';
import Product from '../products/model';

export default class ProductReturnItem extends Model<InferAttributes<ProductReturnItem>, InferCreationAttributes<ProductReturnItem>> {
  declare id: CreationOptional<string>;
  declare returnId: string;
  declare productId: string;
  declare returnedQuantity: number;
  declare unitPrice: number;
  declare returnAmount: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

ProductReturnItem.init(
  {
    id: {
      allowNull: false,
      autoIncrement: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: sql.uuidV4,
    },
    returnId: {
      field: 'return_id',
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: ProductReturn,
        key: 'id'
      }
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
    returnedQuantity: {
      field: 'returned_quantity',
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    unitPrice: {
      field: 'unit_price',
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    returnAmount: {
      field: 'return_amount',
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
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
    tableName: 'product_return_items',
    modelName: 'ProductReturnItem',
    sequelize,
    paranoid: true
  },
);

// Set up associations
ProductReturn.hasMany(ProductReturnItem, {
  foreignKey: {
    name: 'returnId',
    field: 'return_id'
  },
  as: 'ReturnItems'
});

ProductReturnItem.belongsTo(ProductReturn, {
  foreignKey: {
    name: 'returnId',
    field: 'return_id'
  }
});

Product.hasMany(ProductReturnItem, {
  foreignKey: {
    name: 'productId',
    field: 'product_id'
  }
});

ProductReturnItem.belongsTo(Product, {
  foreignKey: {
    name: 'productId',
    field: 'product_id'
  }
});
