import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, sql } from '@sequelize/core';
import { sequelize } from '../../../configs';
import Invoice from '../invoices/model';
import Product from '../products/model';

export default class InvoiceItem extends Model<InferAttributes<InvoiceItem>, InferCreationAttributes<InvoiceItem>> {
  declare id: CreationOptional<string>;
  declare invoiceId: string;
  declare productId: string;
  declare quantity: number;
  declare unitPrice: number;
  declare discountPercent: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

InvoiceItem.init(
  {
    id: {
      allowNull: false,
      autoIncrement: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: sql.uuidV4,
    },
    invoiceId: {
      field: 'invoice_id',
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Invoice,
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
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    unitPrice: {
      field: 'unit_price',
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    discountPercent: {
      field: 'discount_percent',
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100
      }
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
    tableName: 'invoice_items',
    modelName: 'InvoiceItem',
    sequelize,
    paranoid: true
  },
);

// Set up associations
Invoice.hasMany(InvoiceItem, {
  foreignKey: {
    name: 'invoiceId',
    field: 'invoice_id',
    onDelete: 'CASCADE'
  },
});

InvoiceItem.belongsTo(Invoice, {
  foreignKey: {
    name: 'invoiceId',
    field: 'invoice_id',
    onDelete: 'CASCADE'
  }
});

Product.hasMany(InvoiceItem, {
  foreignKey: {
    name: 'productId',
    field: 'product_id'
  }
});

InvoiceItem.belongsTo(Product, {
  foreignKey: {
    name: 'productId',
    field: 'product_id'
  }
});