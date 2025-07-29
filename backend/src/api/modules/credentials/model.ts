import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from '@sequelize/core';
import { sequelize } from '../../../configs';
import User from '../users/model';

export default class Credential extends Model<InferAttributes<Credential>, InferCreationAttributes<Credential>> {
  declare id: CreationOptional<string>;
  declare password: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare user_id: CreationOptional<string>;
}

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
    paranoid: true,
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
