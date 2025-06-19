import { DataTypes, Model } from '@sequelize/core';
import { sequelize } from '../../../configs';
import Role from '../roles/model';

export default class Permission extends Model {
  declare id: string
}

Permission.init(
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
    tableName: 'permissions',
    modelName: 'Permission',
    sequelize,
    paranoid: true
  },
);


Permission.belongsToMany(Role, { 
  through: 'RolePermissions', 
  foreignKey: 'permission_id', 
  otherKey: 'role_id'
 });
Role.belongsToMany(Permission, { 
  through: 'RolePermissions', 
  foreignKey: 'role_id', 
  otherKey: 'permission_id'
 });
