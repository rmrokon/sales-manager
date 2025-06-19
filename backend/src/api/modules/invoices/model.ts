import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, sql } from '@sequelize/core';
import { sequelize } from '../../../configs';
import User from '../users/model';
import Company from '../companies/model';
import Zone from '../zones/model';

export enum InvoiceType {
  COMPANY = 'company',
  ZONE = 'zone'
}

export default class Invoice extends Model<InferAttributes<Invoice>, InferCreationAttributes<Invoice>> {
  declare id: CreationOptional<string>;
  declare type: InvoiceType;
  declare fromUserId: string;
  declare toCompanyId: CreationOptional<string>;
  declare toZoneId: CreationOptional<string>;
  declare totalAmount: number;
  declare paidAmount: number;
  declare dueAmount: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Invoice.init(
  {
    id: {
      allowNull: false,
      autoIncrement: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: sql.uuidV4,
    },
    type: {
      type: DataTypes.ENUM(...Object.values(InvoiceType)),
      allowNull: false,
    },
    fromUserId: {
      field: 'from_user_id',
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    toCompanyId: {
      field: 'to_company_id',
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'companies',
        key: 'id'
      }
    },
    toZoneId: {
      field: 'to_zone_id',
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'zones',
        key: 'id'
      }
    },
    totalAmount: {
      field: 'total_amount',
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    paidAmount: {
      field: 'paid_amount',
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    dueAmount: {
      field: 'due_amount',
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
    tableName: 'invoices',
    modelName: 'Invoice',
    sequelize,
    paranoid: true,
    hooks: {
      beforeValidate: (invoice: Invoice) => {
        // Ensure either toCompanyId or toZoneId is set based on type
        if (invoice.type === InvoiceType.COMPANY && !invoice.toCompanyId) {
          throw new Error('Company invoice must have a toCompanyId');
        }
        if (invoice.type === InvoiceType.ZONE && !invoice.toZoneId) {
          throw new Error('Zone invoice must have a toZoneId');
        }
      }
    }
  },
);

// Set up associations
User.hasMany(Invoice, {
  foreignKey: {
    name: 'fromUserId',
    field: 'from_user_id'
  },
  as: 'SentInvoices'
});

Invoice.belongsTo(User, {
  foreignKey: {
    name: 'fromUserId',
    field: 'from_user_id'
  },
  as: 'Sender'
});

Company.hasMany(Invoice, {
  foreignKey: {
    name: 'toCompanyId',
    field: 'to_company_id'
  },
  as: 'ReceivedInvoices'
});

Invoice.belongsTo(Company, {
  foreignKey: {
    name: 'toCompanyId',
    field: 'to_company_id'
  },
  as: 'ReceiverCompany'
});

Zone.hasMany(Invoice, {
  foreignKey: {
    name: 'toZoneId',
    field: 'to_zone_id'
  },
  as: 'ReceivedInvoices'
});

Invoice.belongsTo(Zone, {
  foreignKey: {
    name: 'toZoneId',
    field: 'to_zone_id'
  },
  as: 'ReceiverZone'
});