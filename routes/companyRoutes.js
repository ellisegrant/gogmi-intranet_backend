const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');

// POST /api/company-settings/upload-logo
router.post('/upload-logo', companyController.uploadLogo);

// PUT /api/company-settings
router.put('/', companyController.update);

// GET /api/company-settings
router.get('/', companyController.get);

module.exports = router;