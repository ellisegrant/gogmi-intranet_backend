const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');

// POST /api/leaves
router.post('/', leaveController.create);

// GET /api/leaves (all - admin)
router.get('/', leaveController.getAll);

// GET /api/leaves/employee/:employeeId
router.get('/employee/:employeeId', leaveController.getByEmployee);

// GET /api/leaves/balance/:employeeId
router.get('/balance/:employeeId', leaveController.getBalance);

// GET /api/leaves/:id
router.get('/:id', leaveController.getById);

// PUT /api/leaves/:id/status (approve/reject)
router.put('/:id/status', leaveController.updateStatus);

// PUT /api/leaves/:id/cancel (employee cancel)
router.put('/:id/cancel', leaveController.cancel);

module.exports = router;