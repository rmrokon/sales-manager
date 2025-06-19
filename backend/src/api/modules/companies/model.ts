import { DataTypes, sql, Model, CreationOptional } from '@sequelize/core';
import { sequelize } from 'src/configs';
import User from '../users/model';

export default class Company extends Model {
  declare id: string;
  declare name: string;
  declare logo: string;
  declare user_id: CreationOptional<string>;
  declare default: boolean;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Company.init(
  {
    id: {
      allowNull: false,
      autoIncrement: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: sql.uuidV4,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    logo: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: 'https://picsum.photos/50/50'
    },
    default: {
      type: DataTypes.BOOLEAN,
      allowNull: true
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
    deletedAt: {
      field: 'deleted_at',
      type: DataTypes.DATE,
      allowNull: true
    },
  },
  {
    timestamps: false,
    tableName: 'companies',
    modelName: 'Company',
    paranoid: true,
    sequelize,
  },
);

User.hasMany(Company, {
  as: 'companies',
  foreignKey: {
    name: 'user_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  }
});

Company.belongsTo(User, {
  foreignKey: {
    name: 'user_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  as: 'user'
})

