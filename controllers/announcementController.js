const Announcement = require('../models/Announcement');

// ============================================
// CREATE ANNOUNCEMENT
// ============================================
exports.create = async (req, res) => {
  try {
    const { title, content, category, priority, author, authorId, expiryDate } = req.body;

    if (!title || !content || !author || !authorId) {
      return res.status(400).json({
        success: false,
        message: 'Title, content, author, and authorId are required'
      });
    }

    const announcement = await Announcement.create({
      title,
      content,
      category: category || 'General',
      priority: priority || 'Medium',
      author,
      authorId,
      expiryDate: expiryDate || null,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      announcement
    });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating announcement',
      error: error.message
    });
  }
};

// ============================================
// GET ACTIVE ANNOUNCEMENTS (Public)
// ============================================
exports.getActive = async (req, res) => {
  try {
    const now = new Date();

    const announcements = await Announcement.findAll({
      where: {
        isActive: true
      },
      order: [
        ['priority', 'DESC'],
        ['createdAt', 'DESC']
      ]
    });

    // Filter out expired announcements
    const activeAnnouncements = announcements.filter(announcement => {
      if (!announcement.expiryDate) return true;
      return new Date(announcement.expiryDate) > now;
    });

    res.status(200).json({
      success: true,
      count: activeAnnouncements.length,
      announcements: activeAnnouncements
    });
  } catch (error) {
    console.error('Get active announcements error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching announcements',
      error: error.message
    });
  }
};

// ============================================
// GET ALL ANNOUNCEMENTS (Admin)
// ============================================
exports.getAll = async (req, res) => {
  try {
    const announcements = await Announcement.findAll({
      order: [
        ['createdAt', 'DESC']
      ]
    });

    res.status(200).json({
      success: true,
      count: announcements.length,
      announcements
    });
  } catch (error) {
    console.error('Get all announcements error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching announcements',
      error: error.message
    });
  }
};

// ============================================
// GET ANNOUNCEMENT BY ID
// ============================================
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findByPk(id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    res.status(200).json({
      success: true,
      announcement
    });
  } catch (error) {
    console.error('Get announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching announcement',
      error: error.message
    });
  }
};

// ============================================
// UPDATE ANNOUNCEMENT
// ============================================
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, priority, isActive, expiryDate } = req.body;

    const announcement = await Announcement.findByPk(id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    await announcement.update({
      title: title || announcement.title,
      content: content || announcement.content,
      category: category || announcement.category,
      priority: priority || announcement.priority,
      isActive: isActive !== undefined ? isActive : announcement.isActive,
      expiryDate: expiryDate !== undefined ? expiryDate : announcement.expiryDate
    });

    res.status(200).json({
      success: true,
      message: 'Announcement updated successfully',
      announcement
    });
  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating announcement',
      error: error.message
    });
  }
};

// ============================================
// DELETE ANNOUNCEMENT
// ============================================
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findByPk(id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    await announcement.destroy();

    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting announcement',
      error: error.message
    });
  }
};