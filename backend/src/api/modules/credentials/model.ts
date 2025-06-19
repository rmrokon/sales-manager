import { DataTypes, Model } from '@sequelize/core';
import { sequelize } from '../../../configs';
import User from '../users/model';

export default class Credential extends Model {}

Credential.init(
  {
    id: {
      allowNull: false,
      autoIncrement: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    password: {
      type: new DataTypes.STRING(255),
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
    tableName: 'credentials',
    modelName: 'Credential',
    sequelize,
  },
);

User.hasOne(Credential, {
  foreignKey: {
    name: 'user_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
});

Credential.belongsTo(User, {
  foreignKey: {
    name: 'user_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
});
