const express = require('express');
const router = express.Router();
const payslipController = require('../controllers/payslipController');

// POST /api/payslips
router.post('/', payslipController.create);

// GET /api/payslips
router.get('/', payslipController.getAll);

// GET /api/payslips/employee/:employeeId
router.get('/employee/:employeeId', payslipController.getByEmployee);

// GET /api/payslips/:id
router.get('/:id', payslipController.getById);

module.exports = router;