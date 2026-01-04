const CompanySetting = require('../models/CompanySetting');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'company-logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
}).single('logo');

// ============================================
// UPLOAD LOGO
// ============================================
exports.uploadLogo = (req, res) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: 'File upload error',
        error: err.message
      });
    } else if (err) {
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
      const logoPath = `/uploads/${req.file.filename}`;

      // Get or create company settings
      let settings = await CompanySetting.findOne();
      if (!settings) {
        settings = await CompanySetting.create({ logoPath });
      } else {
        // Delete old logo if exists
        if (settings.logoPath) {
          const oldLogoPath = path.join(__dirname, '..', settings.logoPath);
          if (fs.existsSync(oldLogoPath)) {
            fs.unlinkSync(oldLogoPath);
          }
        }
        settings.logoPath = logoPath;
        await settings.save();
      }

      res.status(200).json({
        success: true,
        message: 'Logo uploaded successfully',
        logoPath
      });
    } catch (error) {
      console.error('Save logo error:', error);
      // Delete uploaded file if database save fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({
        success: false,
        message: 'Error saving logo',
        error: error.message
      });
    }
  });
};

// ============================================
// UPDATE COMPANY SETTINGS
// ============================================
exports.update = async (req, res) => {
  try {
    const { companyName, address, phone, email, website } = req.body;

    let settings = await CompanySetting.findOne();

    if (!settings) {
      settings = await CompanySetting.create({
        companyName,
        address,
        phone,
        email,
        website
      });
    } else {
      await settings.update({
        companyName: companyName || settings.companyName,
        address: address || settings.address,
        phone: phone || settings.phone,
        email: email || settings.email,
        website: website || settings.website
      });
    }

    res.status(200).json({
      success: true,
      message: 'Company settings updated successfully',
      settings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating settings',
      error: error.message
    });
  }
};

// ============================================
// GET COMPANY SETTINGS
// ============================================
exports.get = async (req, res) => {
  try {
    let settings = await CompanySetting.findOne();

    if (!settings) {
      settings = await CompanySetting.create({
        companyName: 'Your Company Name',
        address: '',
        phone: '',
        email: '',
        website: '',
        logoPath: null
      });
    }

    res.status(200).json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching settings',
      error: error.message
    });
  }
};