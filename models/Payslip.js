const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Payslip = sequelize.define('Payslip', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // Employee Reference
  employeeId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'employeeId'
    }
  },
  
  // Period Information
  month: {
    type: DataTypes.STRING,
    allowNull: false // e.g., "January", "February"
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false // e.g., 2025
  },
  
  // Employee Details (stored for historical accuracy)
  staffNo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  employeeName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false
  },
  position: {
    type: DataTypes.STRING,
    allowNull: true
  },
  costCentre: {
    type: DataTypes.STRING,
    allowNull: true
  },
  region: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Headquarters'
  },
  
  // Salary Information
  band: {
    type: DataTypes.STRING,
    allowNull: true // e.g., "Band H"
  },
  annualSalary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  
  // EARNINGS (in Hours or Amount)
  basicSalaryHrs: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  basicSalaryAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  
  // Allowances
  fuelAllowance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  housingAllowance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  transportAllowance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  utilitySubsidy: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  maintenanceAllowance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  bonus: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  otherAllowances: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  
  // TOTAL EARNINGS
  totalEarnings: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  
  // EMPLOYER CONTRIBUTIONS
  employerSSF: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  totalSSF: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  employerPF: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  totalPF: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  
  // DEDUCTIONS
  ssfEmployee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  incomeTax: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  providentFund: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  loans: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  otherDeductions: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  
  // TOTAL DEDUCTIONS
  totalDeductions: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  
  // NET PAY
  netPay: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  
  // Bank Details
  bankName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  accountNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  // Additional Information
  psfNo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  taxableBenefits: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  
  // Status
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'draft', // draft, approved, paid
  },
  
  // Reference
  referenceNo: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  }
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['employeeId', 'month', 'year']
    }
  ]
});

module.exports = Payslip;