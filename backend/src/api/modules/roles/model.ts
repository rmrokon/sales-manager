import { BelongsToManyGetAssociationsMixin, BelongsToManySetAssociationsMixin, CreationOptional, DataTypes, IncludeOptions, InferAttributes, InferCreationAttributes, Model } from '@sequelize/core';
import { sequelize } from '../../../configs';
import User from '../users/model';
import Permission from '../permissions/model';
import { IRole } from './types';
import { DefaultRoles } from '../../../utils';

export default class Role extends Model<InferAttributes<Role>, InferCreationAttributes<Role>> {
  declare id: CreationOptional<string>;
  declare name: DefaultRoles | string;;
  declare user_id?: CreationOptional<string>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare setPermissions: BelongsToManySetAssociationsMixin<Permission, Permission["id"]>;
  declare getPermissions: BelongsToManyGetAssociationsMixin<Permission>;
}

Role.init(
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
    tableName: 'roles',
    modelName: 'Role',
    sequelize,
    paranoid: true
  },
);

User.hasMany(Role, {
  foreignKey: {
    name: 'user_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  }
});

Role.belongsTo(User, {
  foreignKey: {
    name: 'user_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  }
});

