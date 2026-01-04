const Leave = require('../models/Leave');
const { Op } = require('sequelize');

// ============================================
// CREATE LEAVE REQUEST
// ============================================
exports.create = async (req, res) => {
  try {
    const { employeeId, employeeName, leaveType, startDate, endDate, numberOfDays, reason } = req.body;

    if (!employeeId || !employeeName || !leaveType || !startDate || !endDate || !numberOfDays || !reason) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    const leave = await Leave.create({
      employeeId,
      employeeName,
      leaveType,
      startDate,
      endDate,
      numberOfDays,
      reason,
      status: 'Pending'
    });

    res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully',
      leave
    });
  } catch (error) {
    console.error('Create leave error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating leave request',
      error: error.message
    });
  }
};

// ============================================
// GET LEAVE REQUESTS BY EMPLOYEE
// ============================================
exports.getByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const leaves = await Leave.findAll({
      where: { employeeId },
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: leaves.length,
      leaves
    });
  } catch (error) {
    console.error('Get employee leaves error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leave requests',
      error: error.message
    });
  }
};

// ============================================
// GET ALL LEAVE REQUESTS (Admin)
// ============================================
exports.getAll = async (req, res) => {
  try {
    const { status } = req.query;

    let whereClause = {};
    if (status) {
      whereClause.status = status;
    }

    const leaves = await Leave.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: leaves.length,
      leaves
    });
  } catch (error) {
    console.error('Get all leaves error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leave requests',
      error: error.message
    });
  }
};

// ============================================
// GET SINGLE LEAVE REQUEST
// ============================================
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const leave = await Leave.findByPk(id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    res.status(200).json({
      success: true,
      leave
    });
  } catch (error) {
    console.error('Get leave error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leave request',
      error: error.message
    });
  }
};

// ============================================
// APPROVE/REJECT LEAVE REQUEST
// ============================================
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approvedBy, approvedById, rejectionReason } = req.body;

    if (!status || !approvedBy || !approvedById) {
      return res.status(400).json({
        success: false,
        message: 'Status, approvedBy, and approvedById are required'
      });
    }

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either Approved or Rejected'
      });
    }

    const leave = await Leave.findByPk(id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending leave requests can be approved or rejected'
      });
    }

    leave.status = status;
    leave.approvedBy = approvedBy;
    leave.approvedById = approvedById;
    leave.approvedDate = new Date();
    if (status === 'Rejected' && rejectionReason) {
      leave.rejectionReason = rejectionReason;
    }

    await leave.save();

    res.status(200).json({
      success: true,
      message: `Leave request ${status.toLowerCase()} successfully`,
      leave
    });
  } catch (error) {
    console.error('Update leave status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating leave request',
      error: error.message
    });
  }
};

// ============================================
// CANCEL LEAVE REQUEST (Employee)
// ============================================
exports.cancel = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId } = req.body;

    const leave = await Leave.findByPk(id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    if (leave.employeeId !== employeeId) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own leave requests'
      });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending leave requests can be cancelled'
      });
    }

    leave.status = 'Cancelled';
    await leave.save();

    res.status(200).json({
      success: true,
      message: 'Leave request cancelled successfully',
      leave
    });
  } catch (error) {
    console.error('Cancel leave error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling leave request',
      error: error.message
    });
  }
};

// ============================================
// GET LEAVE BALANCE BY EMPLOYEE
// ============================================
exports.getBalance = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Get all approved leaves for this employee in current year
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31);

    const approvedLeaves = await Leave.findAll({
      where: {
        employeeId,
        status: 'Approved',
        startDate: {
          [Op.between]: [startOfYear, endOfYear]
        }
      }
    });

    // Calculate used days by leave type
    const leaveTypes = {
      'Annual Leave': { total: 22, used: 0 },
      'Sick Leave': { total: 5, used: 0 },
      'Compassionate Leave': { total: 5, used: 0 },
      'Paternity Leave': { total: 5, used: 0 }
    };

    approvedLeaves.forEach(leave => {
      if (leaveTypes[leave.leaveType]) {
        leaveTypes[leave.leaveType].used += leave.numberOfDays;
      }
    });

    // Calculate remaining days
    const balance = Object.keys(leaveTypes).map(type => ({
      type,
      total: leaveTypes[type].total,
      used: leaveTypes[type].used,
      remaining: leaveTypes[type].total - leaveTypes[type].used
    }));

    res.status(200).json({
      success: true,
      balance
    });
  } catch (error) {
    console.error('Get leave balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leave balance',
      error: error.message
    });
  }
};