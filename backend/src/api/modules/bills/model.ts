import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, sql } from '@sequelize/core';
import { sequelize } from '../../../configs';
import Invoice from '../invoices/model';

export default class Bill extends Model<InferAttributes<Bill>, InferCreationAttributes<Bill>> {
  declare id: CreationOptional<string>;
  declare title: string;
  declare description: CreationOptional<string>;
  declare amount: number;
  declare invoiceId: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Bill.init(
  {
    id: {
      allowNull: false,
      autoIncrement: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: sql.uuidV4,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
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
    tableName: 'bills',
    modelName: 'Bill',
    sequelize,
    paranoid: true,
  },
);
