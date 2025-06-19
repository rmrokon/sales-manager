import { DataTypes, sql, Model, BelongsToManyAddAssociationMixin, BelongsToManyAddAssociationsMixin, HasOneSetAssociationMixin, InferAttributes, InferCreationAttributes, CreationOptional } from '@sequelize/core';
import { sequelize } from '../../../configs';
import User from '../users/model';

export default class Employee extends Model<InferAttributes<Employee>, InferCreationAttributes<Employee>> {
  declare id: string;
  declare firstName: string;
  declare lastName: string;
  declare image?: CreationOptional<string>;
  declare user_id?: CreationOptional<string>;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt: Date;
}

Employee.init(
  {
    id: {
      allowNull: false,
      autoIncrement: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: sql.uuidV4,
    },
    firstName: {
      columnName: 'first_name',
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    lastName: {
      columnName: 'last_name',
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    image: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: 'https://picsum.photos/50/50'
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
    tableName: 'employees',
    modelName: 'Employee',
    paranoid: true,
    sequelize,
  },
);

  User.hasOne(Employee, {
  foreignKey: {
    name: 'user_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  }
});

Employee.belongsTo(User, {
  foreignKey: {
    name: 'user_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  }
});

