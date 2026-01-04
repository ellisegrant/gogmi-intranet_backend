const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');

// POST /api/announcements
router.post('/', announcementController.create);

// GET /api/announcements (active only)
router.get('/', announcementController.getActive);

// GET /api/announcements/all (admin - all announcements)
router.get('/all', announcementController.getAll);

// GET /api/announcements/:id
router.get('/:id', announcementController.getById);

// PUT /api/announcements/:id
router.put('/:id', announcementController.update);

// DELETE /api/announcements/:id
router.delete('/:id', announcementController.delete);

module.exports = router;