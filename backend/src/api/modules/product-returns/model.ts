import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, sql } from '@sequelize/core';
import { sequelize } from '../../../configs';
import Invoice from '../invoices/model';
import Zone from '../zones/model';

export enum ReturnStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export default class ProductReturn extends Model<InferAttributes<ProductReturn>, InferCreationAttributes<ProductReturn>> {
  declare id: CreationOptional<string>;
  declare originalInvoiceId: string;
  declare zoneId: string;
  declare returnDate: CreationOptional<Date>;
  declare totalReturnAmount: number;
  declare status: ReturnStatus;
  declare remarks?: CreationOptional<string>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

ProductReturn.init(
  {
    id: {
      allowNull: false,
      autoIncrement: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: sql.uuidV4,
    },
    originalInvoiceId: {
      field: 'original_invoice_id',
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Invoice,
        key: 'id'
      }
    },
    zoneId: {
      field: 'zone_id',
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Zone,
        key: 'id'
      }
    },
    returnDate: {
      field: 'return_date',
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    totalReturnAmount: {
      field: 'total_return_amount',
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(ReturnStatus)),
      allowNull: false,
      defaultValue: ReturnStatus.PENDING,
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tableName: 'product_returns',
    modelName: 'ProductReturn',
    sequelize,
    paranoid: true
  },
);

// Set up associations
Invoice.hasMany(ProductReturn, {
  foreignKey: {
    name: 'originalInvoiceId',
    field: 'original_invoice_id'
  },
  as: 'Returns'
});

ProductReturn.belongsTo(Invoice, {
  foreignKey: {
    name: 'originalInvoiceId',
    field: 'original_invoice_id'
  },
  as: 'OriginalInvoice'
});

Zone.hasMany(ProductReturn, {
  foreignKey: {
    name: 'zoneId',
    field: 'zone_id'
  }
});

ProductReturn.belongsTo(Zone, {
  foreignKey: {
    name: 'zoneId',
    field: 'zone_id'
  }
});
