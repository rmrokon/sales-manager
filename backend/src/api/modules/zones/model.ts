import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, sql } from '@sequelize/core';
import { sequelize } from 'src/configs';
import Company from 'src/api/modules/companies/model';

export default class Zone extends Model<InferAttributes<Zone>, InferCreationAttributes<Zone>> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare company_id: CreationOptional<string>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Zone.init(
  {
    id: {
      allowNull: false,
      autoIncrement: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: sql.uuidV4,
    },
    name: {
      type: DataTypes.STRING(128),
      allowNull: false,
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
    tableName: 'zones',
    modelName: 'Zone',
    sequelize,
    paranoid: true
  },
);

// Set up associations
Company.hasMany(Zone, {
  foreignKey: {
    name: 'company_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
});

Zone.belongsTo(Company, {
  foreignKey: {
    name: 'company_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
});