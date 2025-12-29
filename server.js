const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { sequelize, testConnection } = require('./config/database');
const User = require('./models/User');
const Payslip = require('./models/Payslip');
const CompanySettings = require('./models/CompanySettings');
const Announcement = require('./models/Announcement');
require('dotenv').config();

const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Enable CORS
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// ============================================
// DEPARTMENT IDS (Access Codes)
// ============================================
const DEPARTMENT_IDS = {
  'admin-finance': 'ADMIN2025',
  'technical': 'TECH2025',
  'corporate-affairs': 'CORP2025',
  'directorate': 'DIR2025'
};

// ============================================
// ENDPOINT 1: HOME / HEALTH CHECK
// ============================================
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Company Intranet API!',
    status: 'Server is running',
    database: 'Connected to PostgreSQL'
  });
});

// ============================================
// ENDPOINT 2: REGISTER NEW USER
// ============================================
app.post('/api/register', async (req, res) => {
  try {
    const { employeeId, username, password, name, email, department, position } = req.body;
    
    const existingUser = await User.findOne({
      where: { employeeId }
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this Employee ID already exists'
      });
    }
    
    const newUser = await User.create({
      employeeId,
      username,
      password,
      name,
      email,
      department,
      position
    });
    
    res.status(201).json({
      success: true,
      message: 'User created successfully!',
      user: {
        id: newUser.id,
        employeeId: newUser.employeeId,
        username: newUser.username,
        name: newUser.name,
        department: newUser.department
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
});

// ============================================
// ENDPOINT 3: LOGIN USER
// ============================================
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username and password'
      });
    }
    
    const user = await User.findOne({
      where: { username }
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Login successful!',
      user: {
        id: user.id,
        employeeId: user.employeeId,
        username: user.username,
        name: user.name,
        email: user.email,
        department: user.department,
        position: user.position
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login error',
      error: error.message
    });
  }
});

// ============================================
// ENDPOINT 4: GET ALL USERS
// ============================================
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'employeeId', 'username', 'name', 'email', 'department', 'position', 'createdAt']
    });
    
    res.status(200).json({
      success: true,
      count: users.length,
      users: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// ============================================
// ENDPOINT 5: REQUEST ACCESS
// ============================================
app.post('/api/request-access', async (req, res) => {
  try {
    const { email, username, name, department } = req.body;

    if (!email || !username || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email, username, and name are required'
      });
    }

    if (!email.endsWith('@gogmi.org.gh')) {
      return res.status(400).json({
        success: false,
        message: 'Only @gogmi.org.gh emails are allowed'
      });
    }

    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'This email is already registered'
      });
    }

    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'This username is already taken'
      });
    }

    const lastUser = await User.findOne({
      order: [['createdAt', 'DESC']],
      attributes: ['employeeId']
    });

    let newEmployeeId;
    if (lastUser && lastUser.employeeId) {
      const lastNumber = parseInt(lastUser.employeeId.split('-')[2]);
      const newNumber = (lastNumber + 1).toString().padStart(3, '0');
      newEmployeeId = `EMP-GEN-${newNumber}`;
    } else {
      newEmployeeId = 'EMP-GEN-001';
    }

    const tempPassword = 'Welcome2025!';

    const newUser = await User.create({
      employeeId: newEmployeeId,
      username,
      password: tempPassword,
      name,
      email,
      department: department || 'general',
      position: 'Employee'
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      credentials: {
        employeeId: newUser.employeeId,
        username: newUser.username,
        tempPassword: tempPassword,
        email: newUser.email
      },
      user: {
        id: newUser.id,
        employeeId: newUser.employeeId,
        username: newUser.username,
        name: newUser.name,
        email: newUser.email,
        department: newUser.department
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating account',
      error: error.message
    });
  }
});

// ============================================
// ENDPOINT 6: VERIFY DEPARTMENT ID
// ============================================
app.post('/api/verify-department', async (req, res) => {
  try {
    const { department, accessCode } = req.body;

    if (!department || !accessCode) {
      return res.status(400).json({
        success: false,
        message: 'Department and access code are required'
      });
    }

    if (department === 'general') {
      return res.status(200).json({
        success: true,
        message: 'Access granted to General department'
      });
    }

    if (DEPARTMENT_IDS[department] === accessCode) {
      return res.status(200).json({
        success: true,
        message: 'Access granted'
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid department access code'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying department access',
      error: error.message
    });
  }
});

// ============================================
// ENDPOINT 7: CREATE PAYSLIP
// ============================================
app.post('/api/payslips', async (req, res) => {
  try {
    const payslipData = req.body;
    
    const existingPayslip = await Payslip.findOne({
      where: {
        employeeId: payslipData.employeeId,
        month: payslipData.month,
        year: payslipData.year
      }
    });
    
    if (existingPayslip) {
      return res.status(400).json({
        success: false,
        message: `Payslip already exists for ${payslipData.month} ${payslipData.year}`
      });
    }
    
    const totalEarnings = parseFloat(payslipData.basicSalaryAmount || 0) +
                         parseFloat(payslipData.bonus || 0) +
                         parseFloat(payslipData.otherAllowances || 0);
    
    const totalDeductions = parseFloat(payslipData.ssfEmployee || 0) +
                           parseFloat(payslipData.incomeTax || 0) +
                           parseFloat(payslipData.providentFund || 0) +
                           parseFloat(payslipData.loans || 0) +
                           parseFloat(payslipData.otherDeductions || 0);
    
    const netPay = totalEarnings - totalDeductions;
    
    const referenceNo = `PAY${payslipData.year}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${Date.now()}`;
    
    const payslip = await Payslip.create({
      ...payslipData,
      totalEarnings,
      totalDeductions,
      netPay,
      referenceNo,
      status: 'approved'
    });
    
    res.status(201).json({
      success: true,
      message: 'Payslip created successfully',
      payslip
    });
  } catch (error) {
    console.error('Payslip creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payslip',
      error: error.message
    });
  }
});

// ============================================
// ENDPOINT 8: GET ALL PAYSLIPS
// ============================================
app.get('/api/payslips', async (req, res) => {
  try {
    const payslips = await Payslip.findAll({
      order: [['year', 'DESC'], ['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      count: payslips.length,
      payslips
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching payslips',
      error: error.message
    });
  }
});

// ============================================
// ENDPOINT 9: GET EMPLOYEE PAYSLIPS
// ============================================
app.get('/api/payslips/employee/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    const payslips = await Payslip.findAll({
      where: { employeeId },
      order: [['year', 'DESC'], ['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      count: payslips.length,
      payslips
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching payslips',
      error: error.message
    });
  }
});

// ============================================
// ENDPOINT 10: GET SINGLE PAYSLIP
// ============================================
app.get('/api/payslips/:id', async (req, res) => {
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
    res.status(500).json({
      success: false,
      message: 'Error fetching payslip',
      error: error.message
    });
  }
});

// ============================================
// ENDPOINT 11: UPLOAD COMPANY LOGO
// ============================================
app.post('/api/company-settings/upload-logo', upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Get or create company settings
    let settings = await CompanySettings.findOne();
    
    // Delete old logo file if exists
    if (settings && settings.logoPath) {
      const oldPath = path.join(__dirname, settings.logoPath);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    const logoPath = `uploads/${req.file.filename}`;
    const logoUrl = `http://localhost:5000/${logoPath}`;

    if (!settings) {
      settings = await CompanySettings.create({
        logoFilename: req.file.filename,
        logoPath: logoPath
      });
    } else {
      settings.logoFilename = req.file.filename;
      settings.logoPath = logoPath;
      await settings.save();
    }

    res.status(200).json({
      success: true,
      message: 'Logo uploaded successfully',
      logoUrl: logoUrl,
      logoPath: logoPath
    });
  } catch (error) {
    console.error('Logo upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading logo',
      error: error.message
    });
  }
});

// ============================================
// ENDPOINT 12: UPDATE COMPANY SETTINGS
// ============================================
app.put('/api/company-settings', async (req, res) => {
  try {
    const { companyName, companyAcronym, hrEmail, address, phone } = req.body;

    let settings = await CompanySettings.findOne();

    if (!settings) {
      settings = await CompanySettings.create({
        companyName,
        companyAcronym,
        hrEmail,
        address,
        phone
      });
    } else {
      settings.companyName = companyName || settings.companyName;
      settings.companyAcronym = companyAcronym || settings.companyAcronym;
      settings.hrEmail = hrEmail || settings.hrEmail;
      settings.address = address || settings.address;
      settings.phone = phone || settings.phone;
      await settings.save();
    }

    res.status(200).json({
      success: true,
      message: 'Company settings updated successfully',
      settings
    });
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating settings',
      error: error.message
    });
  }
});

// ============================================
// ENDPOINT 13: GET COMPANY SETTINGS
// ============================================
app.get('/api/company-settings', async (req, res) => {
  try {
    let settings = await CompanySettings.findOne();

    if (!settings) {
      // Create default settings if none exist
      settings = await CompanySettings.create({
        companyName: 'GULF OF GUINEA MARITIME INSTITUTE',
        companyAcronym: 'GoGMI',
        hrEmail: 'hr@gogmi.org.gh'
      });
    }

    // Add full logo URL
    const response = {
      success: true,
      settings: {
        id: settings.id,
        companyName: settings.companyName,
        companyAcronym: settings.companyAcronym,
        hrEmail: settings.hrEmail,
        address: settings.address,
        phone: settings.phone,
        logoUrl: settings.logoPath ? `http://localhost:5000/${settings.logoPath}` : null,
        logoPath: settings.logoPath
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching settings',
      error: error.message
    });
  }
});






// ENDPOINT 14: CREATE ANNOUNCEMENT

app.post('/api/announcements', async (req, res) => {
  try {
    const { title, content, category, priority, author, authorId, expiryDate } = req.body;

    if (!title || !content || !author || !authorId) {
      return res.status(400).json({
        success: false,
        message: 'Title, content, author, and authorId are required'
      });
    }

    const announcement = await Announcement.create({
      title,
      content,
      category: category || 'General',
      priority: priority || 'Medium',
      author,
      authorId,
      expiryDate: expiryDate || null,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      announcement
    });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating announcement',
      error: error.message
    });
  }
});

// ============================================
// ENDPOINT 15: GET ACTIVE ANNOUNCEMENTS (for all users)
// ============================================
app.get('/api/announcements', async (req, res) => {
  try {
    const announcements = await Announcement.findAll({
      where: { isActive: true },
      order: [
        ['priority', 'ASC'], // High priority first
        ['createdAt', 'DESC']
      ]
    });

    // Filter out expired announcements
    const activeAnnouncements = announcements.filter(announcement => {
      if (!announcement.expiryDate) return true;
      return new Date(announcement.expiryDate) > new Date();
    });

    res.status(200).json({
      success: true,
      count: activeAnnouncements.length,
      announcements: activeAnnouncements
    });
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching announcements',
      error: error.message
    });
  }
});

// ============================================
// ENDPOINT 16: GET ALL ANNOUNCEMENTS (admin only - includes inactive)
// ============================================
app.get('/api/announcements/all', async (req, res) => {
  try {
    const announcements = await Announcement.findAll({
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: announcements.length,
      announcements
    });
  } catch (error) {
    console.error('Get all announcements error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching announcements',
      error: error.message
    });
  }
});


// ENDPOINT 17: GET SINGLE ANNOUNCEMENT

app.get('/api/announcements/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const announcement = await Announcement.findByPk(id);
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    res.status(200).json({
      success: true,
      announcement
    });
  } catch (error) {
    console.error('Get announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching announcement',
      error: error.message
    });
  }
});


// ENDPOINT 18: UPDATE ANNOUNCEMENT

app.put('/api/announcements/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, priority, isActive, expiryDate } = req.body;

    const announcement = await Announcement.findByPk(id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Update fields
    if (title) announcement.title = title;
    if (content) announcement.content = content;
    if (category) announcement.category = category;
    if (priority) announcement.priority = priority;
    if (typeof isActive !== 'undefined') announcement.isActive = isActive;
    if (expiryDate !== undefined) announcement.expiryDate = expiryDate;

    await announcement.save();

    res.status(200).json({
      success: true,
      message: 'Announcement updated successfully',
      announcement
    });
  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating announcement',
      error: error.message
    });
  }
});

// ENDPOINT 19: DELETE ANNOUNCEMENT

app.delete('/api/announcements/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findByPk(id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    await announcement.destroy();

    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting announcement',
      error: error.message
    });
  }
});


// ============================================
// SERVER STARTUP FUNCTION
// ============================================
const startServer = async () => {
  try {
    await testConnection();
    await sequelize.sync();
    console.log(' Database tables created!');
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log('\n Available Endpoints:');
      console.log('   GET  http://localhost:' + PORT + '/');
      console.log('   POST http://localhost:' + PORT + '/api/register');
      console.log('   POST http://localhost:' + PORT + '/api/login');
      console.log('   GET  http://localhost:' + PORT + '/api/users');
      console.log('   POST http://localhost:' + PORT + '/api/request-access');
      console.log('   POST http://localhost:' + PORT + '/api/verify-department');
      console.log('   POST http://localhost:' + PORT + '/api/payslips');
      console.log('   GET  http://localhost:' + PORT + '/api/payslips');
      console.log('   GET  http://localhost:' + PORT + '/api/payslips/:id');
      console.log('   GET  http://localhost:' + PORT + '/api/payslips/employee/:employeeId');
      console.log('   POST http://localhost:' + PORT + '/api/company-settings/upload-logo');
      console.log('   PUT  http://localhost:' + PORT + '/api/company-settings');
      console.log('   GET  http://localhost:' + PORT + '/api/company-settings');
      
      console.log('   POST http://localhost:' + PORT + '/api/announcements');
      console.log('   GET  http://localhost:' + PORT + '/api/announcements');
      console.log('   GET  http://localhost:' + PORT + '/api/announcements/all');
      console.log('   GET  http://localhost:' + PORT + '/api/announcements/:id');
      console.log('   PUT  http://localhost:' + PORT + '/api/announcements/:id');
      console.log('   DELETE http://localhost:' + PORT + '/api/announcements/:id');
      console.log('');
    });
  } catch (error) {
    console.error(' Error starting server:', error.message);
  }
};

startServer();