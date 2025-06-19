import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, sql } from '@sequelize/core';
import { sequelize } from '../../../configs';

export default class Payment extends Model<InferAttributes<Payment>, InferCreationAttributes<Payment>> {
  declare id: CreationOptional<string>;
  declare invoiceId: string;
  declare amount: number;
  declare paymentDate: Date;
  declare paymentMethod: string;
  declare remarks: CreationOptional<string>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Payment.init(
  {
    id: {
      allowNull: false,
      autoIncrement: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: sql.uuidV4,
    },
    invoiceId: {
      columnName: 'invoice_id',
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    paymentDate: {
      columnName: 'payment_date',
      type: DataTypes.DATE,
      allowNull: false,
    },
    paymentMethod: {
      columnName: 'payment_method',
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    remarks: {
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
    tableName: 'payments',
    modelName: 'Payment',
    sequelize,
    paranoid: true
  },
);