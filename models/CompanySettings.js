const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CompanySettings = sequelize.define('CompanySettings', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  companyName: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'GULF OF GUINEA MARITIME INSTITUTE'
  },
  companyAcronym: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'GoGMI'
  },
  logoFilename: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Filename of the uploaded logo'
  },
  logoPath: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Full path to the logo file'
  },
  hrEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'hr@gogmi.org.gh'
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'CompanySettings',
  timestamps: true
});

module.exports = CompanySettings;