'use strict';
import { DataTypes } from 'sequelize';
import { sequelize } from '../../../configs/db.js';

const Location = sequelize.define('Location', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  municipality: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  department: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  reference: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'locations',
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      unique: true,
      fields: ['name', 'municipality', 'department', 'address'],
      name: 'unique_location',
    },
  ],
});

export default Location;