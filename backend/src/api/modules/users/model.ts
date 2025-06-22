import { DataTypes, sql, Model, IncludeOptions, HasManyGetAssociationsMixin, CreationOptional, InferAttributes, InferCreationAttributes } from '@sequelize/core';
import { sequelize } from 'src/configs';
import Company from '../companies/model';
import Employee from '../employees/model';
import Role from '../roles/model';
import Credential from '../credentials/model';
import { ICompany } from '../companies/types';
import { HasOneGetAssociationMixin } from 'sequelize';

export default class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<string>;
  declare email: string;
  declare companies?: CreationOptional<ICompany>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare getCompanies: HasManyGetAssociationsMixin<Company>;
  declare getEmployee: HasOneGetAssociationMixin<Employee>;
  declare getRoles: HasManyGetAssociationsMixin<Role>;
  declare getCredential: HasOneGetAssociationMixin<Credential>;
}

User.init(
  {
    id: {
      allowNull: false,
      autoIncrement: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: sql.uuidV4,
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: false
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
    tableName: 'users',
    modelName: 'User',
    paranoid: true,
    sequelize,
  },
);

