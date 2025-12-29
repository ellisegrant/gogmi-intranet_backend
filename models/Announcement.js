const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Announcement = sequelize.define('Announcement', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('Important', 'General', 'Event'),
    allowNull: false,
    defaultValue: 'General'
  },
  priority: {
    type: DataTypes.ENUM('High', 'Medium', 'Low'),
    allowNull: false,
    defaultValue: 'Medium'
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Name of person who created announcement'
  },
  authorId: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Employee ID of announcement creator'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  expiryDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Optional expiry date for announcement'
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
  tableName: 'Announcements',
  timestamps: true
});

module.exports = Announcement;