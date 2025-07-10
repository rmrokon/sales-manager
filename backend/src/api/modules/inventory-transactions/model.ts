import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, sql } from '@sequelize/core';
import { sequelize } from '../../../configs';
import Product from '../products/model';
import Invoice from '../invoices/model';
import Provider from '../providers/model';
import Zone from '../zones/model';

export enum TransactionType {
  PURCHASE = 'PURCHASE',
  DISTRIBUTION = 'DISTRIBUTION',
  RETURN = 'RETURN'
}

export default class InventoryTransaction extends Model<InferAttributes<InventoryTransaction>, InferCreationAttributes<InventoryTransaction>> {
  declare id: CreationOptional<string>;
  declare productId: string;
  declare transactionType: TransactionType;
  declare quantity: number; // positive for additions, negative for deductions
  declare unitPrice: number;
  declare relatedInvoiceId?: CreationOptional<string>;
  declare relatedReturnId?: CreationOptional<string>;
  declare providerId?: CreationOptional<string>;
  declare zoneId?: CreationOptional<string>;
  declare remarks?: CreationOptional<string>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

InventoryTransaction.init(
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
    transactionType: {
      field: 'transaction_type',
      type: DataTypes.ENUM(...Object.values(TransactionType)),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    unitPrice: {
      field: 'unit_price',
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    relatedInvoiceId: {
      field: 'related_invoice_id',
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: Invoice,
        key: 'id'
      }
    },
    relatedReturnId: {
      field: 'related_return_id',
      type: DataTypes.UUID,
      allowNull: true,
    },
    providerId: {
      field: 'provider_id',
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: Provider,
        key: 'id'
      }
    },
    zoneId: {
      field: 'zone_id',
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: Zone,
        key: 'id'
      }
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
    tableName: 'inventory_transactions',
    modelName: 'InventoryTransaction',
    sequelize,
    paranoid: true
  },
);

// Set up associations
Product.hasMany(InventoryTransaction, {
  foreignKey: {
    name: 'productId',
    field: 'product_id'
  }
});

InventoryTransaction.belongsTo(Product, {
  foreignKey: {
    name: 'productId',
    field: 'product_id'
  }
});

Invoice.hasMany(InventoryTransaction, {
  foreignKey: {
    name: 'relatedInvoiceId',
    field: 'related_invoice_id'
  }
});

InventoryTransaction.belongsTo(Invoice, {
  foreignKey: {
    name: 'relatedInvoiceId',
    field: 'related_invoice_id'
  }
});

Provider.hasMany(InventoryTransaction, {
  foreignKey: {
    name: 'providerId',
    field: 'provider_id'
  }
});

InventoryTransaction.belongsTo(Provider, {
  foreignKey: {
    name: 'providerId',
    field: 'provider_id'
  }
});

Zone.hasMany(InventoryTransaction, {
  foreignKey: {
    name: 'zoneId',
    field: 'zone_id'
  }
});

InventoryTransaction.belongsTo(Zone, {
  foreignKey: {
    name: 'zoneId',
    field: 'zone_id'
  }
});
