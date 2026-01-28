// ============================================
// DEPENDENCIES
// ============================================
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./config/database');
const path = require('path');

// ============================================
// IMPORT ROUTES
// ============================================
const authRoutes = require('./routes/authRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const payslipRoutes = require('./routes/payslipRoutes');
const companyRoutes = require('./routes/companyRoutes');
const assetRoutes = require('./routes/assetRoutes');

// ============================================
// IMPORT MIDDLEWARE
// ============================================
const errorHandler = require('./middleware/errorHandler');

// ============================================
// INITIALIZE APP
// ============================================
const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/assets', assetRoutes);

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Intranet API Server is running!' });
});

// Auth routes
app.use('/api', authRoutes);

// Announcement routes
app.use('/api/announcements', announcementRoutes);

// Leave routes
app.use('/api/leaves', leaveRoutes);

// Payslip routes
app.use('/api/payslips', payslipRoutes);

// Company settings routes
app.use('/api/company-settings', companyRoutes);

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================
app.use(errorHandler);

// ============================================
// START SERVER
// ============================================
async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log(' Database connection established');

    // Sync models
    await sequelize.authenticate();
    console.log('Database connection successful');

    // Start server
    app.listen(PORT, () => {
      console.log('');
      console.log('============================================');
      console.log('  INTRANET BACKEND SERVER');
      console.log(' ============================================');
      console.log('');
      console.log(` Server running on: http://localhost:${PORT}`);
      console.log('');
      console.log(' Available Endpoints:');
      console.log('   GET  http://localhost:' + PORT + '/');
      console.log('');
      console.log('    Authentication:');
      console.log('   POST http://localhost:' + PORT + '/api/register');
      console.log('   POST http://localhost:' + PORT + '/api/login');
      console.log('   POST http://localhost:' + PORT + '/api/request-access');
      console.log('   POST http://localhost:' + PORT + '/api/verify-department');
      console.log('   GET  http://localhost:' + PORT + '/api/users');
      console.log('');
      console.log('    Announcements:');
      console.log('   POST http://localhost:' + PORT + '/api/announcements');
      console.log('   GET  http://localhost:' + PORT + '/api/announcements');
      console.log('   GET  http://localhost:' + PORT + '/api/announcements/all');
      console.log('   GET  http://localhost:' + PORT + '/api/announcements/:id');
      console.log('   PUT  http://localhost:' + PORT + '/api/announcements/:id');
      console.log('   DELETE http://localhost:' + PORT + '/api/announcements/:id');
      console.log('');
      console.log('   🏖️ Leaves:');
      console.log('   POST http://localhost:' + PORT + '/api/leaves');
      console.log('   GET  http://localhost:' + PORT + '/api/leaves');
      console.log('   GET  http://localhost:' + PORT + '/api/leaves/employee/:employeeId');
      console.log('   GET  http://localhost:' + PORT + '/api/leaves/:id');
      console.log('   PUT  http://localhost:' + PORT + '/api/leaves/:id/status');
      console.log('   PUT  http://localhost:' + PORT + '/api/leaves/:id/cancel');
      console.log('   GET  http://localhost:' + PORT + '/api/leaves/balance/:employeeId');
      console.log('');
      console.log('    Payslips:');
      console.log('   POST http://localhost:' + PORT + '/api/payslips');
      console.log('   GET  http://localhost:' + PORT + '/api/payslips');
      console.log('   GET  http://localhost:' + PORT + '/api/payslips/:id');
      console.log('   GET  http://localhost:' + PORT + '/api/payslips/employee/:employeeId');
      console.log('');
      console.log('    Company Settings:');
      console.log('   POST http://localhost:' + PORT + '/api/company-settings/upload-logo');
      console.log('   PUT  http://localhost:' + PORT + '/api/company-settings');
      console.log('   GET  http://localhost:' + PORT + '/api/company-settings');
      console.log('');
      console.log(' ============================================');
      console.log('');
    });
  } catch (error) {
    console.error(' Unable to start server:', error);
    process.exit(1);
  }
}

startServer();
