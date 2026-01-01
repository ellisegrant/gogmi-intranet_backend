const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Leave = sequelize.define('Leave', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  employeeId: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Employee ID who requested leave'
  },
  employeeName: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Name of employee'
  },
  leaveType: {
    type: DataTypes.ENUM('Annual Leave', 'Sick Leave', 'Compassionate Leave', 'Paternity Leave', 'Maternity Leave'),
    allowNull: false
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Leave start date'
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Leave end date'
  },
  numberOfDays: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Total days of leave'
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Reason for leave'
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Approved', 'Rejected', 'Cancelled'),
    allowNull: false,
    defaultValue: 'Pending'
  },
  approvedBy: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Name of person who approved/rejected'
  },
  approvedById: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Employee ID of approver'
  },
  approvedDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date when approved/rejected'
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Reason for rejection if rejected'
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
  tableName: 'Leaves',
  timestamps: true
});

module.exports = Leave;