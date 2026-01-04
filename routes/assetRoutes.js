const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');

// POST /api/assets - Create asset (auto-generates sequential ID)
router.post('/', assetController.create);

// GET /api/assets - Get all assets (ordered by assetId ASC)
router.get('/', assetController.getAll);

// GET /api/assets/stats - Get asset statistics
router.get('/stats', assetController.getStats);

// GET /api/assets/employee/:employeeId - Get assets by employee
router.get('/employee/:employeeId', assetController.getByEmployee);

// GET /api/assets/asset-id/:assetId - Get asset by assetId (e.g., AST-001)
router.get('/asset-id/:assetId', assetController.getByAssetId);

// GET /api/assets/:id - Get single asset by database ID
router.get('/:id', assetController.getById);

// PUT /api/assets/:id - Update asset (assetId cannot be changed)
router.put('/:id', assetController.update);

// DELETE /api/assets/:id - Delete asset
router.delete('/:id', assetController.delete);

module.exports = router;