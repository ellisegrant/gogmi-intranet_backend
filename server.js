const express = require('express');
const cors = require('cors');
const { sequelize, testConnection } = require('./config/database');
const User = require('./models/User');
require('dotenv').config();

const app = express();

// Enable CORS (allow frontend to access backend)
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// ============================================
// DEPARTMENT IDS (Access Codes)
// Store these securely in production
// ============================================
const DEPARTMENT_IDS = {
  'admin-finance': 'ADMIN2025',
  'technical': 'TECH2025',
  'corporate-affairs': 'CORP2025',
  'directorate': 'DIR2025'
};

// ============================================
// ENDPOINT 1: HOME / HEALTH CHECK
// Type: GET
// URL: http://localhost:5000/
// Purpose: Check if server is running
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
// Type: POST
// URL: http://localhost:5000/api/register
// Purpose: Create a new employee/user
// Required: employeeId, username, password, name, department
// Optional: email, position
// ============================================
app.post('/api/register', async (req, res) => {
  try {
    // Get data from request
    const { employeeId, username, password, name, email, department, position } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({
      where: { employeeId }
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this Employee ID already exists'
      });
    }
    
    // Create new user (password will be automatically hashed by the model)
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
// Type: POST
// URL: http://localhost:5000/api/login
// Purpose: Authenticate user and return user data
// Required: username, password
// ============================================
app.post('/api/login', async (req, res) => {
  try {
    // Get username and password from request
    const { username, password } = req.body;
    
    // Check if username and password provided
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username and password'
      });
    }
    
    // Find user by username
    const user = await User.findOne({
      where: { username }
    });
    
    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }
    
    // Check if password matches using bcrypt
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }
    
    // Success! Send back user data
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
// Type: GET
// URL: http://localhost:5000/api/users
// Purpose: Retrieve list of all employees
// Note: Password is excluded for security
// ============================================
app.get('/api/users', async (req, res) => {
  try {
    // Get all users from database (exclude password!)
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
// ENDPOINT 5: REQUEST ACCESS (Auto-create account for company emails)
// Type: POST
// URL: http://localhost:5000/api/request-access
// Purpose: Auto-create account for @gogmi.org.gh emails
// Required: email, username, name
// ============================================
app.post('/api/request-access', async (req, res) => {
  try {
    const { email, username, name, department } = req.body;

    // Validate required fields
    if (!email || !username || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email, username, and name are required'
      });
    }

    // Check if email is from company domain
    if (!email.endsWith('@gogmi.org.gh')) {
      return res.status(400).json({
        success: false,
        message: 'Only @gogmi.org.gh emails are allowed'
      });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'This email is already registered'
      });
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'This username is already taken'
      });
    }

    // Auto-generate Employee ID
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

    // Generate temporary password
    const tempPassword = 'Welcome2025!';

    // Create user account
    const newUser = await User.create({
      employeeId: newEmployeeId,
      username,
      password: tempPassword,
      name,
      email,
      department: department || 'general',
      position: 'Employee'
    });

    // Return credentials
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
// Type: POST
// URL: http://localhost:5000/api/verify-department
// Purpose: Check if Department ID is correct
// Required: department, accessCode
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

    // General department doesn't need verification
    if (department === 'general') {
      return res.status(200).json({
        success: true,
        message: 'Access granted to General department'
      });
    }

    // Check if access code is correct
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
// SERVER STARTUP FUNCTION
// ============================================
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    // Create tables if they don't exist
    await sequelize.sync();
    console.log('✅ Database tables created!');
    
    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log('\n📋 Available Endpoints:');
      console.log('   GET  http://localhost:' + PORT + '/');
      console.log('   POST http://localhost:' + PORT + '/api/register');
      console.log('   POST http://localhost:' + PORT + '/api/login');
      console.log('   GET  http://localhost:' + PORT + '/api/users');
      console.log('   POST http://localhost:' + PORT + '/api/request-access');
      console.log('   POST http://localhost:' + PORT + '/api/verify-department');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Error starting server:', error.message);
  }
};

// Start the server
startServer();