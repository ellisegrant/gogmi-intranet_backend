const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CompanySetting = sequelize.define('CompanySetting', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  companyName: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Your Company Name'
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  website: {
    type: DataTypes.STRING,
    allowNull: true
  },
  logoPath: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'company_settings',
  timestamps: true
});

module.exports = CompanySetting;