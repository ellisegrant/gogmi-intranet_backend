const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Op } = require('sequelize');
const nodemailer = require('nodemailer');

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

    // Generate 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetPasswordToken = resetCode;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send email via Microsoft Graph API
    const fetch = require('node-fetch');

    // Get access token
    const tokenResponse = await fetch(
      `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.AZURE_CLIENT_ID,
          client_secret: process.env.AZURE_CLIENT_SECRET,
          scope: 'https://graph.microsoft.com/.default',
          grant_type: 'client_credentials'
        })
      }
    );
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Password Reset Code - GoGMI Intranet',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #132552 0%, #8e3400 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .code-box { background: white; border: 3px solid #8e3400; border-radius: 10px; padding: 30px; text-align: center; margin: 20px 0; }
            .code { font-size: 48px; font-weight: bold; color: #8e3400; letter-spacing: 10px; font-family: 'Courier New', monospace; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>��� Password Reset Code</h1>
            </div>
            <div class="content">
              <p>Hi <strong>${user.name}</strong>,</p>

              <p>We received a request to reset your password for your GoGMI Intranet account.</p>

              <p>Your password reset code is:</p>

              <div class="code-box">
                <div class="code">${resetCode}</div>
              </div>

              <p><strong>Enter this code on the password reset page to continue.</strong></p>

              <div class="warning">
                <p><strong>⚠️ Security Information:</strong></p>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>This code will expire in <strong>1 hour</strong></li>
                  <li>Do not share this code with anyone</li>
                  <li>If you didn't request this reset, please ignore this email</li>
                </ul>
              </div>

              <p>If you're having trouble, contact IT support at <a href="mailto:info@gogmi.org.gh">info@gogmi.org.gh</a></p>
            </div>
            <div class="footer">
              <p>This is an automated message from GoGMI Intranet. Please do not reply to this email.</p>
              <p>&copy; ${new Date().getFullYear()} Ghana Oil and Gas Management Institute. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    // Send email via Graph API
    const emailBody = {
      message: {
        subject: mailOptions.subject,
        body: { contentType: 'HTML', content: mailOptions.html },
        toRecipients: [{ emailAddress: { address: user.email } }]
      }
    };

    const sendResponse = await fetch(
      `https://graph.microsoft.com/v1.0/users/${process.env.SEND_FROM_EMAIL}/sendMail`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailBody)
      }
    );

    if (!sendResponse.ok) {
      const err = await sendResponse.json();
      throw new Error(err.error?.message || 'Failed to send email');
    }

    res.status(200).json({
      success: true,
      message: 'Password reset code has been sent to your email'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending password reset code. Please try again later.',
      error: error.message
    });
  }
};

// RESET PASSWORD WITH CODE
exports.resetPassword = async (req, res) => {
  try {
    const { code, newPassword } = req.body;

    if (!code || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide reset code and new password'
      });
    }

    // Find user with matching code that hasn't expired
    const user = await User.findOne({
      where: {
        resetPasswordToken: code,
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset code'
      });
    }

    // Check if code has expired
    if (user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Reset code has expired. Please request a new one.'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset fields
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now login with your new password.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password. Please try again later.',
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
      attributes: ['id', 'employeeId', 'name', 'email', 'department', 'position', 'employeeType', 'contractEndDate', 'costCentre', 'band', 'lineManagerId', 'createdAt'],
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

// UPDATE USER
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      department,
      position,
      costCentre,
      band,
      phoneNumber,
      location,
      employeeType,
      lineManagerId
    } = req.body;

    // Find user by ID
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user fields
    await user.update({
      name: name || user.name,
      email: email || user.email,
      department: department || user.department,
      position: position || user.position,
      costCentre: costCentre || user.costCentre,
      band: band || user.band,
      phoneNumber: phoneNumber || user.phoneNumber,
      lineManagerId: lineManagerId !== undefined ? lineManagerId : user.lineManagerId,
      location: location || user.location,
      employeeType: employeeType || user.employeeType
    });

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: user.id,
        employeeId: user.employeeId,
        name: user.name,
        email: user.email,
        department: user.department,
        position: user.position,
        costCentre: user.costCentre,
        band: user.band,
        phoneNumber: user.phoneNumber,
        lineManagerId: user.lineManagerId,
        location: user.location,
        employeeType: user.employeeType
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};
