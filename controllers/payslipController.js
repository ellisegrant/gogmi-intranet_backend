const Payslip = require('../models/Payslip');

// ============================================
// CREATE PAYSLIP
// ============================================

exports.create = async (req, res) => {
  try {
    const {
      employeeId,
      month,
      year,
      staffNo,
      employeeName,
      department,
      position,
      costCentre,
      region,
      band,
      annualSalary,
      basicSalaryHrs,
      basicSalaryAmount,
      bonus,
      otherAllowances,
      employerSSF,
      totalSSF,
      employerPF,
      totalPF,
      ssfEmployee,
      incomeTax,
      providentFund,
      loans,
      otherDeductions,
      bankName,
      accountNumber,
      psfNo,
      taxableBenefits
    } = req.body;

    // Validate required fields
    if (!employeeId || !employeeName || !month || !year || !basicSalaryAmount) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID, name, month, year, and basic salary are required'
      });
    }

    // Calculate totals
    const totalEarnings = 
      parseFloat(basicSalaryAmount || 0) + 
      parseFloat(bonus || 0) + 
      parseFloat(otherAllowances || 0);

    const totalDeductions = 
      parseFloat(ssfEmployee || 0) + 
      parseFloat(incomeTax || 0) + 
      parseFloat(providentFund || 0) + 
      parseFloat(loans || 0) + 
      parseFloat(otherDeductions || 0);

    const netPay = totalEarnings - totalDeductions;

    const payslip = await Payslip.create({
      employeeId,
      month,
      year,
      staffNo: staffNo || employeeId,
      employeeName,
      department,
      position,
      costCentre,
      region,
      band,
      annualSalary,
      basicSalaryHrs,
      basicSalaryAmount,
      bonus,
      otherAllowances,
      employerSSF,
      totalSSF,
      employerPF,
      totalPF,
      ssfEmployee,
      incomeTax,
      providentFund,
      loans,
      otherDeductions,
      bankName,
      accountNumber,
      psfNo,
      taxableBenefits,
      totalEarnings,
      totalDeductions,
      netPay
    });

    res.status(201).json({
      success: true,
      message: 'Payslip created successfully',
      payslip
    });
  } catch (error) {
    console.error('Create payslip error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payslip',
      error: error.message
    });
  }
};





// ============================================
// GET ALL PAYSLIPS
// ============================================
exports.getAll = async (req, res) => {
  try {
    const payslips = await Payslip.findAll({
      order: [
        ['year', 'DESC'],
        ['month', 'DESC']
      ]
    });

    res.status(200).json({
      success: true,
      count: payslips.length,
      payslips
    });
  } catch (error) {
    console.error('Get payslips error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payslips',
      error: error.message
    });
  }
};

// ============================================
// GET PAYSLIP BY ID
// ============================================
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const payslip = await Payslip.findByPk(id);

    if (!payslip) {
      return res.status(404).json({
        success: false,
        message: 'Payslip not found'
      });
    }

    res.status(200).json({
      success: true,
      payslip
    });
  } catch (error) {
    console.error('Get payslip error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payslip',
      error: error.message
    });
  }
};

// ============================================
// GET PAYSLIPS BY EMPLOYEE
// ============================================
exports.getByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const payslips = await Payslip.findAll({
      where: { employeeId },
      order: [
        ['year', 'DESC'],
        ['month', 'DESC']
      ]
    });

    res.status(200).json({
      success: true,
      count: payslips.length,
      payslips
    });
  } catch (error) {
    console.error('Get employee payslips error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payslips',
      error: error.message
    });
  }
};
