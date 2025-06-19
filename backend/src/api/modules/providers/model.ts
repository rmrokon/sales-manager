import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from '@sequelize/core';
import { sequelize } from '../../../configs';
import Role from '../roles/model';
import Company from '../companies/model';

export default class Provider extends Model<InferAttributes<Provider>, InferCreationAttributes<Provider>> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare company_id?: CreationOptional<string>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Provider.init(
  {
    id: {
      allowNull: false,
      autoIncrement: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: new DataTypes.STRING(128),
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
    tableName: 'providers',
    modelName: 'Provider',
    sequelize,
    paranoid: true
  },
);

Company.hasMany(Provider, {
  foreignKey: {
    name: 'company_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
});

Provider.belongsTo(Company, {
  foreignKey: {
    name: 'company_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
});


