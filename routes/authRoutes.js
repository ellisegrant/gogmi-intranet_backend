const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/admin/register - Admin registration by Corporate Affairs
router.post('/admin/register', authController.adminRegister);

// POST /api/login
router.post('/login', authController.login);

// POST /api/forgot-password
router.post('/forgot-password', authController.forgotPassword);

// POST /api/reset-password/:token
router.post('/reset-password/:token', authController.resetPassword);

// POST /api/request-access - Public access request
router.post('/request-access', authController.requestAccess);

// POST /api/verify-department
router.post('/verify-department', authController.verifyDepartment);

// GET /api/users - Get all users
router.get('/users', authController.getAllUsers);

// GET /api/users/:id - Get single user
router.get('/users/:id', authController.getUserById);

// PUT /api/profile - Update user profile
router.put("/profile", authController.updateProfile);

// POST /api/profile/picture - Upload profile picture
router.post("/profile/picture", authController.uploadProfilePicture);
// GET /api/birthdays - Get upcoming birthdays
router.get('/birthdays', authController.getUpcomingBirthdays);

// GET /api/anniversaries - Get work anniversaries
router.get('/anniversaries', authController.getWorkAnniversaries);



module.exports = router;
