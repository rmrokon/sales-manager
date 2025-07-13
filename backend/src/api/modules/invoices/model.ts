import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, sql } from '@sequelize/core';
import { sequelize } from '../../../configs';
import User from '../users/model';
import Company from '../companies/model';
import Zone from '../zones/model';
import Provider from '../providers/model';
import { InvoiceType } from './types';
import Bill from '../bills/model';

export default class Invoice extends Model<InferAttributes<Invoice>, InferCreationAttributes<Invoice>> {
  declare id: CreationOptional<string>;
  declare invoiceNumber: CreationOptional<string>;
  declare type: InvoiceType;
  declare fromUserId: string;
  declare toProviderId: CreationOptional<string>;
  declare toZoneId?: CreationOptional<string>;
  declare company_id?: CreationOptional<string>;
  declare totalAmount: number;
  declare paidAmount: number;
  declare dueAmount: number;
  declare invoiceDate: CreationOptional<Date>;
  declare discountType: CreationOptional<'percentage' | 'amount'>;
  declare discountValue: CreationOptional<number>;
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
    invoiceNumber: {
      field: 'invoice_number',
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // ensures no duplicates
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
        model: User,
        key: 'id'
      }
    },
    toProviderId: {
      field: 'to_provider_id',
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: Provider,
        key: 'id'
      }
    },
    toZoneId: {
      field: 'to_zone_id',
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: Zone,
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
    invoiceDate: {
      field: 'invoice_date',
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    discountType: {
      field: 'discount_type',
      type: DataTypes.ENUM('percentage', 'amount'),
      allowNull: true,
      defaultValue: null,
    },
    discountValue: {
      field: 'discount_value',
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
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
      // beforeCreate: async (invoice: Invoice) => {
        
      // },
      beforeValidate: async (invoice: Invoice) => {
        // Ensure proper recipient is set based on type
        if (invoice.type === InvoiceType.PROVIDER && !invoice.toProviderId) {
          throw new Error('Provider invoice must have a toProviderId');
        }
        if (invoice.type === InvoiceType.ZONE && !invoice.toZoneId) {
          throw new Error('Zone invoice must have a toZoneId');
        }
        // Company invoices don't need a specific recipient as they are internal

        // Generate invoice number
        const [result] = await sequelize.query(`SELECT nextval('invoice_number_seq') AS seq`);
        const seq = String((result[0] as any).seq).padStart(6, '0');
        let prefix: string;

        switch (invoice.type) {
          case InvoiceType.ZONE:
            prefix = 'ZN';
            break;
          case InvoiceType.PROVIDER:
            prefix = 'PV';
            break;
          case InvoiceType.COMPANY:
            prefix = 'CO';
            break;
          default:
            prefix = 'IN';
        }

        invoice.invoiceNumber = `${prefix}-${new Date().getFullYear()}-${seq}`;
      }
    }
  },
);

// Set up associations

Company.hasMany(Invoice, {
  foreignKey: {
    name: 'company_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
});

Invoice.belongsTo(Company, {
  foreignKey: {
    name: 'company_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
});

Provider.hasMany(Invoice, {
  foreignKey: {
    name: 'toProviderId',
    field: 'to_provider_id'
  },
  as: 'ReceivedInvoices'
});

Invoice.belongsTo(Provider, {
  foreignKey: {
    name: 'toProviderId',
    field: 'to_provider_id'
  },
  as: 'ReceiverProvider'
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

Invoice.hasMany(Bill, {
  foreignKey: 'invoiceId',
  as: 'bills'
});