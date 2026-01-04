const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/register
router.post('/register', authController.register);

// POST /api/login
router.post('/login', authController.login);

// POST /api/request-access
router.post('/request-access', authController.requestAccess);

// POST /api/verify-department
router.post('/verify-department', authController.verifyDepartment);

// GET /api/users
router.get('/users', authController.getAllUsers);

module.exports = router;