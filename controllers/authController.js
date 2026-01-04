const User = require('../models/User');
const bcrypt = require('bcryptjs');

// ============================================
// REGISTER NEW USER
// ============================================
exports.register = async (req, res) => {
  try {
    const { name, email, password, department, position, location, employeeId } = req.body;

    if (!name || !email || !password || !department || !employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      department: department || 'general',
      position: position || 'Employee',
      location: location || 'Accra',
      employeeId
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        department: user.department,
        position: user.position,
        employeeId: user.employeeId
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
};

// ============================================
// LOGIN USER
// ============================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        department: user.department,
        position: user.position,
        location: user.location,
        employeeId: user.employeeId
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
};

// ============================================
// REQUEST ACCESS
// ============================================
exports.requestAccess = async (req, res) => {
  try {
    const { name, email, reason } = req.body;

    if (!name || !email || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    console.log('Access request received:', { name, email, reason });

    res.status(200).json({
      success: true,
      message: 'Access request submitted successfully. An admin will review your request.'
    });
  } catch (error) {
    console.error('Request access error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting access request',
      error: error.message
    });
  }
};

// ============================================
// VERIFY DEPARTMENT ACCESS
// ============================================
exports.verifyDepartment = async (req, res) => {
  try {
    const { department, accessCode } = req.body;

    if (!department || !accessCode) {
      return res.status(400).json({
        success: false,
        message: 'Department and access code are required'
      });
    }

    const departmentCodes = {
      'admin-finance': 'ADMIN2025',
      'technical': 'TECH2025',
      'corporate-affairs': 'CORP2025',
      'directorate': 'DIR2025'
    };

    if (departmentCodes[department] === accessCode) {
      res.status(200).json({
        success: true,
        message: 'Access granted',
        department
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid access code'
      });
    }
  } catch (error) {
    console.error('Verify department error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying department access',
      error: error.message
    });
  }
};

// ============================================
// GET ALL USERS
// ============================================
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'department', 'position', 'employeeId', 'createdAt']
    });

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};