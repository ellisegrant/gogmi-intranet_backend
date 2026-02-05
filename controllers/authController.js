const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Op } = require('sequelize');
// ADMIN REGISTRATION (Corporate Affairs only)
exports.adminRegister = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      department, 
      position, 
      location, 
      employeeType, 
      contractEndDate,
      employeeId,
      phoneNumber,
      lineManager,
      costCentre
    } = req.body;

    if (!name || !email || !password || !department || !employeeType || !employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (name, email, password, department, employeeType, employeeId)'
      });
    }

    if (!['Full-time', 'Contract'].includes(employeeType)) {
      return res.status(400).json({
        success: false,
        message: 'Employee type must be either Full-time or Contract'
      });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    const existingEmployeeId = await User.findOne({ where: { employeeId } });
    if (existingEmployeeId) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      employeeId,
      name,
      email,
      password: hashedPassword,
      department: department || 'general',
      position: position || 'Employee',
      location: location || 'Accra',
      employeeType,
      contractEndDate: employeeType === 'Contract' ? contractEndDate : null,
      phoneNumber: phoneNumber || null,
      lineManager: lineManager || null,
      costCentre: costCentre || null
    });

    res.status(201).json({
      success: true,
      message: 'Employee registered successfully',
      user: {
        id: user.id,
        employeeId: user.employeeId,
        name: user.name,
        email: user.email,
        department: user.department,
        position: user.position,
        employeeType: user.employeeType,
        contractEndDate: user.contractEndDate,
        phoneNumber: user.phoneNumber,
        lineManager: user.lineManager,
        costCentre: user.costCentre
      }
    });
  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering employee',
      error: error.message
    });
  }
};

// LOGIN USER
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


// Fetch line manager details if exists
    let lineManagerName = null;
    if (user.lineManagerId) {
      const lineManager = await User.findOne({
        where: { employeeId: user.lineManagerId },
        attributes: ['name']
      });
      if (lineManager) {
        lineManagerName = lineManager.name;
      }
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
          id: user.id,
        employeeId: user.employeeId,
        name: user.name,
        email: user.email,
        department: user.department,
        position: user.position,
        location: user.location,
        employeeType: user.employeeType,
        contractEndDate: user.contractEndDate,
        lineManagerId: user.lineManagerId,
        lineManager: lineManagerName,
        profilePicture: user.profilePicture,
        dateOfBirth: user.dateOfBirth,
        joinDate: user.joinDate,
        phoneNumber: user.phoneNumber
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

// FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email address'
      });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this email address'
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    res.status(200).json({
      success: true,
      message: 'Password reset link generated',
      resetToken,
      resetUrl,
      info: 'In production, this would be sent via email'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing request',
      error: error.message
    });
  }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide new password'
      });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: {
          [require('sequelize').Op.gt]: Date.now()
        }
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
      error: error.message
    });
  }
};

// REQUEST ACCESS (Public)
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
      message: 'Access request submitted. Corporate Affairs will review your request.'
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

// VERIFY DEPARTMENT ACCESS
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

// GET ALL USERS
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'employeeId', 'name', 'email', 'department', 'position', 'employeeType', 'contractEndDate', 'costCentre', 'band', 'createdAt'],
      order: [['employeeId', 'ASC']]
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

// GET SINGLE USER
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: ['id', 'employeeId', 'name', 'email', 'department', 'position', 'location', 'employeeType', 'contractEndDate', 'createdAt']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};
// UPDATE PROFILE
exports.updateProfile = async (req, res) => {
  try {
    const { userId, name, phoneNumber, dateOfBirth } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (name) user.name = name;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        employeeId: user.employeeId,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        dateOfBirth: user.dateOfBirth,
        department: user.department,
        position: user.position,
        joinDate: user.joinDate,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};
// UPLOAD PROFILE PICTURE
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/profiles');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `profile-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const profileUpload = multer({
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
}).single('profilePicture');

exports.uploadProfilePicture = (req, res) => {
  profileUpload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    try {
      const { userId } = req.body;
      const user = await User.findByPk(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Delete old profile picture if exists
      if (user.profilePicture) {
        const oldPath = path.join(__dirname, '..', user.profilePicture);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      user.profilePicture = `/uploads/profiles/${req.file.filename}`;
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Profile picture uploaded successfully',
        profilePicture: user.profilePicture
      });
    } catch (error) {
      console.error('Upload profile picture error:', error);
      res.status(500).json({
        success: false,
        message: 'Error uploading profile picture',
        error: error.message
      });
    }
  });
};

// GET UPCOMING BIRTHDAYS
exports.getUpcomingBirthdays = async (req, res) => {
  try {
    const { period = 'month' } = req.query; // 'week' or 'month'
    
    const users = await User.findAll({
      attributes: ['name', 'dateOfBirth'],
      where: {
        dateOfBirth: {
          [Op.not]: null
        }
      }
    });

    const today = new Date();
    const upcomingBirthdays = users.filter(user => {
      const dob = new Date(user.dateOfBirth);
      const thisYearBirthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
      
      const daysUntil = Math.ceil((thisYearBirthday - today) / (1000 * 60 * 60 * 24));
      
      if (period === 'week') {
        return daysUntil >= 0 && daysUntil <= 7;
      } else {
        return daysUntil >= 0 && daysUntil <= 30;
      }
    }).map(user => {
      const dob = new Date(user.dateOfBirth);
      const thisYearBirthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
      
      return {
        name: user.name,
        date: thisYearBirthday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        avatar: user.name.split(' ').map(n => n[0]).join('').substring(0, 2)
      };
    });

    res.status(200).json({
      success: true,
      birthdays: upcomingBirthdays
    });
  } catch (error) {
    console.error('Get birthdays error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching birthdays',
      error: error.message
    });
  }
};

// GET WORK ANNIVERSARIES
exports.getWorkAnniversaries = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    const users = await User.findAll({
      attributes: ['name', 'joinDate'],
      where: {
        joinDate: {
          [Op.not]: null
        }
      }
    });

    const today = new Date();
    const anniversaries = users.filter(user => {
      const joinDate = new Date(user.joinDate);
      const thisYearAnniversary = new Date(today.getFullYear(), joinDate.getMonth(), joinDate.getDate());
      
      const daysUntil = Math.ceil((thisYearAnniversary - today) / (1000 * 60 * 60 * 24));
      
      if (period === 'week') {
        return daysUntil >= 0 && daysUntil <= 7;
      } else {
        return daysUntil >= 0 && daysUntil <= 30;
      }
    }).map(user => {
      const joinDate = new Date(user.joinDate);
      const years = today.getFullYear() - joinDate.getFullYear();
      
      return {
        name: user.name,
        date: `${joinDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} (${years} year${years !== 1 ? 's' : ''})`
      };
    });

    res.status(200).json({
      success: true,
      anniversaries
    });
  } catch (error) {
    console.error('Get anniversaries error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching anniversaries',
      error: error.message
    });
  }
};
